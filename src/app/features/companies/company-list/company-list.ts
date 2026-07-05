import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Company } from '../../../core/models/company.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { CompanyService } from '../company.service';

@Component({
  selector: 'app-company-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './company-list.html',
  styleUrl: './company-list.scss'
})
export class CompanyList implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly formBuilder = inject(FormBuilder);

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.companyService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', code: '', description: '' });
        this.message.set('Company created.');
        this.loadCompanies();
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create company'))
    });
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.companyService.list().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (companies) => this.companies.set(companies),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load companies'))
    });
  }
}
