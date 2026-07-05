import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { cryptoInterceptor } from './core/interceptors/crypto.interceptor';
import { devLoggingInterceptor } from './core/interceptors/dev-logging.interceptor';
import { KeyExchangeService } from './core/security/key-exchange.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, devLoggingInterceptor, cryptoInterceptor])),
    provideAppInitializer(() => firstValueFrom(inject(KeyExchangeService).ensureKeyExchange()))
  ]
};
