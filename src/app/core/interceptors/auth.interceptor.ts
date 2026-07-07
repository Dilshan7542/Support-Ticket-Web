import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from '../auth/token-storage.service';
import { TraceIdService } from '../services/trace-id.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorageService);
  const traceIdService = inject(TraceIdService);
  const accessToken = tokenStorage.getAccessToken();
  const encryptionKeyId = tokenStorage.getEncryptionKeyId();
  const isKeyExchangeRequest = request.url.includes('/api/v1/security/key-exchange');

  let headers = request.headers.set('X-Trace-Id', traceIdService.create());

  if (accessToken && !isKeyExchangeRequest) {
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (encryptionKeyId && !isKeyExchangeRequest) {
    headers = headers.set('X-Key-Id', encryptionKeyId);
  }

  return next(request.clone({ headers }));
};
