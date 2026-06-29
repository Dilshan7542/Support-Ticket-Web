import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { KeyExchangeSession } from '../models/security.model';
import { CryptoService } from '../security/crypto.service';
import { KeyExchangeService } from '../security/key-exchange.service';

const SKIPPED_PATHS = [
  '/api/v1/security/key-exchange',
  '/api/v1/health/status',
  '/api/v1/tickets/upload-attachment',
  '/api/v1/tickets/attachments/download',
  '/actuator/',
  '/h2-console/'
];

export const cryptoInterceptor: HttpInterceptorFn = (request, next) => {
  if (!environment.cryptoEnabled || shouldSkip(request)) {
    return next(request);
  }

  const cryptoService = inject(CryptoService);
  const keyExchangeService = inject(KeyExchangeService);
  const path = getPath(request.url);
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomUUID();

  return keyExchangeService.ensureKeyExchange().pipe(
    switchMap((session) => from(cryptoService.encryptJson(
      session,
      request.method,
      path,
      request.body ?? {},
      timestamp,
      nonce
    )).pipe(
      switchMap((encryptedBody) => {
        const encryptedRequest = request.clone({
          body: encryptedBody,
          setHeaders: {
            'Content-Type': 'application/json',
            'X-Key-Id': session.keyId,
            'X-Timestamp': timestamp,
            'X-Nonce': nonce
          }
        });

        return next(encryptedRequest).pipe(
          switchMap((event) => decryptResponseEvent(event, session, cryptoService, timestamp, nonce))
        );
      })
    ))
  );
};

function decryptResponseEvent(
  event: HttpEvent<unknown>,
  session: KeyExchangeSession,
  cryptoService: CryptoService,
  timestamp: string,
  nonce: string
) {
  if (!(event instanceof HttpResponse) || !cryptoService.isEncryptedPayload(event.body)) {
    return from(Promise.resolve(event));
  }

  return from(cryptoService.decryptJson(session, event.status, event.body, timestamp, nonce)).pipe(
    map((decryptedBody) => event.clone({ body: decryptedBody }))
  );
}

function shouldSkip(request: HttpRequest<unknown>): boolean {
  const path = getPath(request.url);
  return request.body instanceof FormData ||
    request.responseType === 'blob' ||
    SKIPPED_PATHS.some((skippedPath) => path === skippedPath || path.startsWith(skippedPath));
}

function getPath(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new URL(url).pathname;
  }

  return new URL(url, location.origin).pathname;
}
