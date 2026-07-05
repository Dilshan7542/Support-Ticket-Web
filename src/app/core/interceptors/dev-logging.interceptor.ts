import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

const SENSITIVE_HEADERS = ['authorization', 'x-key-id'];
const SENSITIVE_FIELDS = ['accessToken', 'refreshToken', 'password', 'confirmPassword', 'token'];
const REQUEST_STYLE = 'color: #0d6efd; font-weight: 600';
const RESPONSE_STYLE = 'color: #198754; font-weight: 600';
const ERROR_STYLE = 'color: #dc3545; font-weight: 600';

export const devLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  if (environment.production || !environment.devHttpLoggingEnabled) {
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

  console.groupCollapsed(`%c[HTTP Request] ${request.method} ${request.urlWithParams}`, REQUEST_STYLE);
  console.log(requestLog);
  console.groupEnd();

  return next(request).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (!(event instanceof HttpResponse)) {
          return;
        }

        const elapsedMs = Math.round(performance.now() - startedAt);
        console.groupCollapsed(
          `%c[HTTP Response] ${request.method} ${request.urlWithParams} ${event.status} ${elapsedMs}ms`,
          RESPONSE_STYLE
        );
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
        console.groupCollapsed(
          `%c[HTTP Error] ${request.method} ${request.urlWithParams} ${status} ${elapsedMs}ms`,
          ERROR_STYLE
        );
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
