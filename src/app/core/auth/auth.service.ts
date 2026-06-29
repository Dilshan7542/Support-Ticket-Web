import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiClientService } from '../http/api-client.service';
import { AuthTokens, LoginRequest, RegisterRequest } from '../models/auth.model';
import { KeyExchangeService } from '../security/key-exchange.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClientService);
  private readonly keyExchangeService = inject(KeyExchangeService);
  private readonly tokenStorage = inject(TokenStorageService);

  login(request: LoginRequest): Observable<AuthTokens> {
    return this.keyExchangeService.ensureKeyExchange().pipe(
      switchMap(() => this.api.post<AuthTokens, LoginRequest>(API_ENDPOINTS.auth.login, request)),
      tap((tokens) => this.tokenStorage.save(tokens))
    );
  }

  register(request: RegisterRequest): Observable<number> {
    return this.keyExchangeService.ensureKeyExchange().pipe(
      switchMap(() => this.api.post<number, RegisterRequest>(API_ENDPOINTS.auth.register, request))
    );
  }

  refreshToken(): Observable<AuthTokens> {
    return this.api.post<AuthTokens>(API_ENDPOINTS.auth.refreshToken, {
      userId: this.tokenStorage.getUserId(),
      refreshToken: this.tokenStorage.getRefreshToken()
    }).pipe(tap((tokens) => this.tokenStorage.save(tokens)));
  }

  logout(): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.auth.logout, {
      userId: this.tokenStorage.getUserId()
    }).pipe(
      tap(() => this.tokenStorage.clear())
    );
  }
}
