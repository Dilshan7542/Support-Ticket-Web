import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Company } from '../../../core/models/company.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { CompanyService } from '../../companies/company.service';
import { DepartmentService } from '../department.service';
import { DepartmentsStore } from '../state/departments.store';

@Component({
  selector: 'app-department-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss'
})
export class DepartmentList implements OnInit {
  readonly store = inject(DepartmentsStore);
  private readonly departmentService = inject(DepartmentService);
  private readonly companyService = inject(CompanyService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly companies = signal<Company[]>([]);
  readonly pageSize = 20;
  readonly currentPage = signal(1);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    companyId: [''],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    const companyId = this.route.snapshot.queryParamMap.get('companyId') ?? '';
    this.form.patchValue({ companyId });
    this.loadCompanies();
    this.loadPage(1);
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);
    const companyId = this.form.controls.companyId.value;

    this.departmentService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', code: '', companyId, description: '', status: 'ACTIVE' });
        this.message.set('Department created.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create department'))
    });
  }

  delete(id: string | number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Delete this department?')) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.departmentService.delete(id).subscribe({
      next: () => {
        this.message.set('Department deleted.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to delete department'))
    });
  }

  nextPage(): void {
    this.loadPage(Math.min(this.store.totalPages(), this.currentPage() + 1));
  }

  previousPage(): void {
    this.loadPage(Math.max(1, this.currentPage() - 1));
  }

  private loadCompanies(): void {
    this.companyService.list().subscribe({
      next: (companies) => this.companies.set(companies),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load companies'))
    });
  }

  private loadPage(page: number): void {
    const companyId = this.form.controls.companyId.value;
    this.currentPage.set(page);
    this.store.loadDepartments({
      ...(companyId ? { companyId } : {}),
      page: page - 1,
      size: this.pageSize
    });
  }
}
