import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Company } from '../../../core/models/company.model';
import { Department } from '../../../core/models/department.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { DepartmentService } from '../../departments/department.service';
import { CompanyService } from '../company.service';

@Component({
  selector: 'app-company-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.scss'
})
export class CompanyDetail implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly company = signal<Company | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly error = signal<string | null>(null);
  readonly departmentError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.loadCompany();
  }

  update(): void {
    const company = this.company();

    if (!company || this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.companyService.update({
      id: company.id,
      ...this.form.getRawValue()
    }).subscribe({
      next: (updatedCompany) => {
        this.company.set(updatedCompany);
        this.message.set('Company updated.');
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to update company'))
    });
  }

  private loadCompany(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    this.error.set(null);
    this.companyService.detail({ id }).subscribe({
      next: (company) => {
        this.company.set(company);
        this.loadDepartments(company.id);
        this.form.reset({
          name: company.name,
          code: company.code,
          description: company.description ?? '',
          status: company.status ?? 'ACTIVE'
        });
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load company'))
    });
  }

  private loadDepartments(companyId: string | number): void {
    this.departmentError.set(null);
    this.departmentService.list({ companyId }).subscribe({
      next: (departments) => this.departments.set(departments),
      error: (error) => this.departmentError.set(getApiErrorMessage(error, 'Unable to load departments'))
    });
  }
}
