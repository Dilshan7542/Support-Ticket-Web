import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Department } from '../../../core/models/department.model';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department-detail',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './department-detail.html',
  styleUrl: './department-detail.scss'
})
export class DepartmentDetail implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly department = signal<Department | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.loadDepartment();
  }

  update(): void {
    const department = this.department();

    if (!department || this.form.invalid) {
      return;
    }

    this.departmentService.update({
      id: department.id,
      ...this.form.getRawValue()
    }).subscribe((updatedDepartment) => this.department.set(updatedDepartment));
  }

  delete(): void {
    const department = this.department();

    if (!department || !confirm('Delete this department?')) {
      return;
    }

    this.departmentService.delete(department.id).subscribe(() => this.router.navigateByUrl('/departments'));
  }

  private loadDepartment(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.departmentService.detail({ id }).subscribe((department) => {
        this.department.set(department);
        this.form.reset({
          name: department.name,
          description: department.description ?? '',
          status: department.status ?? 'ACTIVE'
        });
      });
    }
  }
}
