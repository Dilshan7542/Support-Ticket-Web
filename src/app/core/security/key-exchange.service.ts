import { Injectable, inject } from '@angular/core';
import { Observable, from, shareReplay, switchMap, tap } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiClientService } from '../http/api-client.service';
import { KeyExchangeRequest, KeyExchangeResponse } from '../models/security.model';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({ providedIn: 'root' })
export class KeyExchangeService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private keyExchangeRequest$?: Observable<KeyExchangeResponse>;

  ensureKeyExchange(): Observable<KeyExchangeResponse> {
    if (this.tokenStorage.getEncryptionKeyId()) {
      return from(Promise.resolve({
        keyId: this.tokenStorage.getEncryptionKeyId() as string,
        serverPublicKey: '',
        salt: '',
        curve: 'P-256',
        keyDerivation: 'HKDF-SHA-256',
        encryptionAlgorithm: 'AES-256-GCM',
        expiresAt: ''
      }));
    }

    this.keyExchangeRequest$ ??= from(this.createClientPublicKey()).pipe(
      switchMap((clientPublicKey) => this.api.post<KeyExchangeResponse, KeyExchangeRequest>(
        API_ENDPOINTS.security.keyExchange,
        { clientPublicKey }
      )),
      tap((response) => this.tokenStorage.saveEncryptionKeyId(response.keyId)),
      shareReplay(1)
    );

    return this.keyExchangeRequest$;
  }

  private async createClientPublicKey(): Promise<string> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveKey']
    );
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    return this.arrayBufferToBase64(publicKey);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }
}
