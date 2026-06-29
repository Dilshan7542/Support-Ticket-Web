import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { LoginRequest, RegisterRequest } from '../../../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenStorage.isAuthenticated());

  login(request: LoginRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.authService.login(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => this.errorSignal.set('Invalid username or password')
    });
  }

  register(request: RegisterRequest): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.authService.register(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      error: () => this.errorSignal.set('Unable to register account')
    });
  }
}
