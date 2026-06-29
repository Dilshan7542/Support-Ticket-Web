import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    active: [true]
  });

  ngOnInit(): void {
    this.store.loadDepartments();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.departmentService.create(this.form.getRawValue()).subscribe(() => {
      this.form.reset({ name: '', description: '', active: true });
      this.store.loadDepartments();
    });
  }

  delete(id: string | number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Delete this department?')) {
      return;
    }

    this.departmentService.delete(id).subscribe(() => this.store.loadDepartments());
  }
}
