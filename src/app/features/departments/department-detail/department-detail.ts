import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Department } from '../../../core/models/department.model';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department-detail',
  imports: [JsonPipe],
  templateUrl: './department-detail.html',
  styleUrl: './department-detail.scss'
})
export class DepartmentDetail implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);
  readonly department = signal<Department | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.departmentService.detail({ id }).subscribe((department) => this.department.set(department));
    }
  }
}
