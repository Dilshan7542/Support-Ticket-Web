import { Injectable } from '@angular/core';

import { AuthTokens, UserRole } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'support_ticket_access_token';
const REFRESH_TOKEN_KEY = 'support_ticket_refresh_token';
const USER_ID_KEY = 'support_ticket_user_id';
const ENCRYPTION_KEY_ID_KEY = 'support_ticket_encryption_key_id';
const USER_ROLE_KEY = 'support_ticket_user_role';
const USERNAME_KEY = 'support_ticket_username';
const FULL_NAME_KEY = 'support_ticket_full_name';
const AUTH_KEYS = [
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ID_KEY,
  ENCRYPTION_KEY_ID_KEY,
  USER_ROLE_KEY,
  USERNAME_KEY,
  FULL_NAME_KEY
] as const;

type AuthScope = 'admin' | 'customer';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  save(tokens: AuthTokens): void {
    this.clearLegacyKeys();
    localStorage.setItem(this.key(ACCESS_TOKEN_KEY), tokens.accessToken);
    localStorage.setItem(this.key(REFRESH_TOKEN_KEY), tokens.refreshToken);
    localStorage.setItem(this.key(USER_ID_KEY), String(tokens.userId));

    if (tokens.encryptionKeyId) {
      this.saveEncryptionKeyId(tokens.encryptionKeyId);
    }

    if (tokens.role) {
      localStorage.setItem(this.key(USER_ROLE_KEY), tokens.role);
    }

    if (tokens.username) {
      localStorage.setItem(this.key(USERNAME_KEY), tokens.username);
    }

    if (tokens.fullName) {
      localStorage.setItem(this.key(FULL_NAME_KEY), tokens.fullName);
    }
  }

  clear(): void {
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(this.key(key));
      localStorage.removeItem(key);
    });
  }

  getAccessToken(): string | null {
    return this.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getItem(REFRESH_TOKEN_KEY);
  }

  getUserId(): string | null {
    return this.getItem(USER_ID_KEY);
  }

  saveEncryptionKeyId(keyId: string): void {
    localStorage.setItem(this.key(ENCRYPTION_KEY_ID_KEY), keyId);
  }

  getEncryptionKeyId(): string | null {
    return this.getItem(ENCRYPTION_KEY_ID_KEY);
  }

  getRole(): UserRole | null {
    return this.getItem(USER_ROLE_KEY) as UserRole | null;
  }

  getUsername(): string | null {
    return this.getItem(USERNAME_KEY);
  }

  getFullName(): string | null {
    return this.getItem(FULL_NAME_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  }

  private getItem(key: string): string | null {
    return localStorage.getItem(this.key(key)) ?? localStorage.getItem(key);
  }

  private key(key: string): string {
    return `${key}_${this.scope()}`;
  }

  private scope(): AuthScope {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/customer')) {
      return 'customer';
    }

    return 'admin';
  }

  private clearLegacyKeys(): void {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  }
}
