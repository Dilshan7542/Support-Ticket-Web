import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiClientService } from '../http/api-client.service';
import { AuthTokens, LoginRequest, RegisterRequest } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  login(request: LoginRequest): Observable<AuthTokens> {
    const tokens: AuthTokens = {
      accessToken: `demo-admin-${Date.now()}`,
      refreshToken: `demo-refresh-${Date.now()}`,
      userId: request.username
    };

    return of(tokens).pipe(tap((savedTokens) => this.tokenStorage.save(savedTokens)));
  }

  register(request: RegisterRequest): Observable<AuthTokens> {
    return this.api.post<AuthTokens, RegisterRequest>(API_ENDPOINTS.auth.register, request).pipe(
      tap((tokens) => this.tokenStorage.save(tokens))
    );
  }

  refreshToken(): Observable<AuthTokens> {
    return this.api.post<AuthTokens>(API_ENDPOINTS.auth.refreshToken, {
      refreshToken: this.tokenStorage.getRefreshToken()
    }).pipe(tap((tokens) => this.tokenStorage.save(tokens)));
  }

  logout(): Observable<void> {
    return of(undefined).pipe(tap(() => this.tokenStorage.clear()));
  }
}
