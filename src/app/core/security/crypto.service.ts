import { Injectable } from '@angular/core';

import { EncryptedPayload, KeyExchangeSession } from '../models/security.model';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  async encryptJson(
    session: KeyExchangeSession,
    method: string,
    path: string,
    body: unknown,
    timestamp: string,
    nonce: string
  ): Promise<EncryptedPayload> {
    if (!session.aesKey) {
      throw new Error('AES key is not available');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aad = this.encode(this.buildRequestAad(session.keyId, method, path, timestamp, nonce));
    const plainText = this.encode(JSON.stringify(body ?? {}));
    const cipherText = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: aad
      },
      session.aesKey,
      plainText
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      cipherText: this.arrayBufferToBase64(cipherText)
    };
  }

  async decryptJson(
    session: KeyExchangeSession,
    httpStatus: number,
    body: EncryptedPayload,
    timestamp: string,
    nonce: string
  ): Promise<unknown> {
    if (!session.aesKey) {
      throw new Error('AES key is not available');
    }

    const aad = this.encode(this.buildResponseAad(session.keyId, httpStatus, timestamp, nonce));
    const plainText = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.base64ToArrayBuffer(body.iv),
        additionalData: aad
      },
      session.aesKey,
      this.base64ToArrayBuffer(body.cipherText)
    );

    return JSON.parse(new TextDecoder().decode(plainText));
  }

  isEncryptedPayload(body: unknown): body is EncryptedPayload {
    return Boolean(
      body &&
      typeof body === 'object' &&
      typeof (body as EncryptedPayload).iv === 'string' &&
      typeof (body as EncryptedPayload).cipherText === 'string'
    );
  }

  private buildRequestAad(keyId: string, method: string, path: string, timestamp: string, nonce: string): string {
    return `AI-TICKET-V4|REQUEST|${keyId}|${method.toUpperCase()}|${path}|${timestamp}|${nonce}`;
  }

  private buildResponseAad(keyId: string, httpStatus: number, timestamp: string, nonce: string): string {
    return `AI-TICKET-V4|RESPONSE|${keyId}|${httpStatus}|${timestamp}|${nonce}`;
  }

  private encode(value: string): ArrayBuffer {
    const bytes = new TextEncoder().encode(value);
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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
