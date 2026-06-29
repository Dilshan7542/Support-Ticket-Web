import { Injectable } from '@angular/core';

import { AuthTokens } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'support_ticket_access_token';
const REFRESH_TOKEN_KEY = 'support_ticket_refresh_token';
const USER_ID_KEY = 'support_ticket_user_id';
const ENCRYPTION_KEY_ID_KEY = 'support_ticket_encryption_key_id';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(USER_ID_KEY, String(tokens.userId));

    if (tokens.encryptionKeyId) {
      this.saveEncryptionKeyId(tokens.encryptionKeyId);
    }
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ENCRYPTION_KEY_ID_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  saveEncryptionKeyId(keyId: string): void {
    localStorage.setItem(ENCRYPTION_KEY_ID_KEY, keyId);
  }

  getEncryptionKeyId(): string | null {
    return localStorage.getItem(ENCRYPTION_KEY_ID_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }
}
