import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

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
  private readonly destroyRef = inject(DestroyRef);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly companies = signal<Company[]>([]);
  readonly pageSize = 20;
  readonly currentPage = signal(1);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    vendorId: [''],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    const vendorId = this.route.snapshot.queryParamMap.get('vendorId') ?? '';
    this.form.patchValue({ vendorId });
    this.form.controls.vendorId.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.loadPage(1));
    this.loadCompanies();
    this.loadPage(1);
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);
    const vendorId = this.form.controls.vendorId.value;

    this.departmentService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', code: '', vendorId, description: '', status: 'ACTIVE' });
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
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load vendors'))
    });
  }

  private loadPage(page: number): void {
    const vendorId = this.form.controls.vendorId.value;
    this.currentPage.set(page);
    this.store.loadDepartments({
      ...(vendorId ? { vendorId } : {}),
      page: page - 1,
      size: this.pageSize
    });
  }
}
