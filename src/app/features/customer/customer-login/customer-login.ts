import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-customer-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.scss'
})
export class CustomerLogin {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    const credentials = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.authService.login({
      username: credentials.username.trim(),
      password: credentials.password
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.router.navigateByUrl('/customer'),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Invalid customer username or password'))
    });
  }
}
