import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Company } from '../../../core/models/company.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { CompanyService } from '../../companies/company.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-create',
  imports: [ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreate implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly companyService = inject(CompanyService);

  readonly companies = signal<Company[]>([]);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    vendorId: ['', Validators.required],
    role: ['EDITOR' as const, Validators.required]
  });

  ngOnInit(): void {
    this.companyService.list().subscribe({
      next: (companies) => this.companies.set(companies.filter((company) => company.status !== 'INACTIVE' && company.status !== 'DELETED')),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load vendors'))
    });
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.userService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({
          username: '',
          password: '',
          fullName: '',
          email: '',
          phone: '',
          vendorId: '',
          role: 'EDITOR'
        });
        this.message.set('User created.');
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create user'))
    });
  }
}
