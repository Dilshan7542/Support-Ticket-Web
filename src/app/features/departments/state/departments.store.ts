import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Department } from '../../../core/models/department.model';
import { DepartmentService } from '../department.service';

@Injectable({ providedIn: 'root' })
export class DepartmentsStore {
  private readonly departmentService = inject(DepartmentService);
  private readonly departmentsSignal = signal<Department[]>([]);
  private readonly loadingSignal = signal(false);

  readonly departments = this.departmentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadDepartments(): void {
    this.loadingSignal.set(true);
    this.departmentService.list().pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe((departments) => this.departmentsSignal.set(departments));
  }
}
