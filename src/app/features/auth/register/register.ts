import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required]
  });

  submit(): void {
    if (this.form.valid) {
      localStorage.setItem('support_ticket_customer_identity', this.form.controls.username.value.trim());
      this.router.navigateByUrl('/customer');
    }
  }
}
