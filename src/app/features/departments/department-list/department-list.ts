import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { getApiErrorMessage } from '../../../core/models/api-response.model';
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
  private readonly formBuilder = inject(FormBuilder);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.store.loadDepartments();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.departmentService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', description: '', status: 'ACTIVE' });
        this.message.set('Department created.');
        this.store.loadDepartments();
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
        this.store.loadDepartments();
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to delete department'))
    });
  }
}
