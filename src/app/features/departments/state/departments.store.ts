import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ListRequest } from '../../../core/models/api-response.model';
import { Department } from '../../../core/models/department.model';
import { DepartmentService } from '../department.service';

@Injectable({ providedIn: 'root' })
export class DepartmentsStore {
  private readonly departmentService = inject(DepartmentService);
  private readonly departmentsSignal = signal<Department[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly pageSignal = signal(0);
  private readonly totalPagesSignal = signal(1);
  private readonly totalElementsSignal = signal(0);

  readonly departments = this.departmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly page = this.pageSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly totalElements = this.totalElementsSignal.asReadonly();

  loadDepartments(request: ListRequest = {}): void {
    this.loadingSignal.set(true);
    this.departmentService.listPage(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe((page) => {
      this.departmentsSignal.set(page.content);
      this.pageSignal.set(page.page);
      this.totalPagesSignal.set(Math.max(1, page.totalPages));
      this.totalElementsSignal.set(page.totalElements);
    });
  }
}
