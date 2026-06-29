import { Injectable, inject } from '@angular/core';
import { Observable, from, shareReplay, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiClientService } from '../http/api-client.service';
import { KeyExchangeRequest, KeyExchangeResponse, KeyExchangeSession } from '../models/security.model';
import { TokenStorageService } from '../auth/token-storage.service';

const KEY_DERIVATION_INFO = 'support-ticket-backend:browser-session:v1';

@Injectable({ providedIn: 'root' })
export class KeyExchangeService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private session?: KeyExchangeSession;
  private keyExchangeRequest$?: Observable<KeyExchangeSession>;

  ensureKeyExchange(): Observable<KeyExchangeSession> {
    if (this.session) {
      return from(Promise.resolve(this.session));
    }

    const savedKeyId = this.tokenStorage.getEncryptionKeyId();
    if (savedKeyId && !environment.cryptoEnabled) {
      return from(Promise.resolve({
        keyId: savedKeyId,
        serverPublicKey: '',
        salt: '',
        curve: 'P-256',
        keyDerivation: 'HKDF-SHA-256',
        encryptionAlgorithm: 'AES-256-GCM',
        expiresAt: ''
      }));
    }

    this.keyExchangeRequest$ ??= from(this.createClientKeyPair()).pipe(
      switchMap(({ keyPair, clientPublicKey }) => this.api.post<KeyExchangeResponse, KeyExchangeRequest>(
        API_ENDPOINTS.security.keyExchange,
        { clientPublicKey }
      ).pipe(
        switchMap((response) => from(this.createSession(keyPair.privateKey, response)))
      )),
      tap((session) => {
        this.session = session;
        this.tokenStorage.saveEncryptionKeyId(session.keyId);
      }),
      shareReplay(1)
    );

    return this.keyExchangeRequest$;
  }

  getCurrentKeyId(): string | null {
    return this.session?.keyId ?? this.tokenStorage.getEncryptionKeyId();
  }

  private async createClientKeyPair(): Promise<{ keyPair: CryptoKeyPair; clientPublicKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    );
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    return {
      keyPair,
      clientPublicKey: this.arrayBufferToBase64(publicKey)
    };
  }

  private async createSession(privateKey: CryptoKey, response: KeyExchangeResponse): Promise<KeyExchangeSession> {
    if (!environment.cryptoEnabled) {
      return response;
    }

    const serverPublicKey = await crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(response.serverPublicKey),
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      false,
      []
    );
    const sharedSecret = await crypto.subtle.deriveBits(
      {
        name: 'ECDH',
        public: serverPublicKey
      },
      privateKey,
      256
    );
    const hkdfKey = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: this.base64ToArrayBuffer(response.salt),
        info: new TextEncoder().encode(KEY_DERIVATION_INFO)
      },
      hkdfKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );

    return {
      ...response,
      aesKey
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  private base64ToArrayBuffer(value: string): ArrayBuffer {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes.buffer;
  }
}
