import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

const SENSITIVE_HEADERS = ['authorization', 'x-key-id'];
const SENSITIVE_FIELDS = ['accessToken', 'refreshToken', 'password', 'confirmPassword', 'token'];

export const devLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  if (environment.production) {
    return next(request);
  }

  const startedAt = performance.now();
  const requestLog = {
    method: request.method,
    url: request.urlWithParams,
    headers: sanitizeHeaders(request.headers.keys().reduce<Record<string, string>>((headers, key) => {
      headers[key] = request.headers.get(key) ?? '';
      return headers;
    }, {})),
    body: sanitizeBody(request.body)
  };

  console.groupCollapsed(`[HTTP Request] ${request.method} ${request.urlWithParams}`);
  console.log(requestLog);
  console.groupEnd();

  return next(request).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        const elapsedMs = Math.round(performance.now() - startedAt);
        console.groupCollapsed(`[HTTP Response] ${request.method} ${request.urlWithParams} ${event.status} ${elapsedMs}ms`);
        console.log({
          status: event.status,
          statusText: event.statusText,
          url: event.url,
          body: sanitizeBody(event.body)
        });
        console.groupEnd();
      },
      error: (error: unknown) => {
        const elapsedMs = Math.round(performance.now() - startedAt);
        const status = error instanceof HttpErrorResponse ? error.status : 'ERROR';
        console.groupCollapsed(`[HTTP Error] ${request.method} ${request.urlWithParams} ${status} ${elapsedMs}ms`);
        console.error(sanitizeBody(error));
        console.groupEnd();
      }
    })
  );
};

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  return Object.entries(headers).reduce<Record<string, string>>((safeHeaders, [key, value]) => {
    safeHeaders[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? '[REDACTED]' : value;
    return safeHeaders;
  }, {});
}

function sanitizeBody(value: unknown): unknown {
  if (value instanceof FormData) {
    return '[FormData]';
  }

  if (value instanceof Blob) {
    return `[Blob ${value.size} bytes]`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeBody(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((safeValue, [key, fieldValue]) => {
      safeValue[key] = SENSITIVE_FIELDS.includes(key) ? '[REDACTED]' : sanitizeBody(fieldValue);
      return safeValue;
    }, {});
  }

  return value;
}
