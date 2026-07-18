import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-customer-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-register.html',
  styleUrl: './customer-register.scss'
})
export class CustomerRegister {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }

    const formValue = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.authService.register({
      fullName: formValue.fullName,
      username: formValue.username.trim(),
      email: formValue.email.trim(),
      phone: formValue.phone.trim() || undefined,
      password: formValue.password
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.router.navigateByUrl('/customer/login'),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create customer account'))
    });
  }
}
