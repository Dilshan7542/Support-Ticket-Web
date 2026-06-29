import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DepartmentsStore } from '../state/departments.store';

@Component({
  selector: 'app-department-list',
  imports: [RouterLink],
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss'
})
export class DepartmentList implements OnInit {
  readonly store = inject(DepartmentsStore);

  ngOnInit(): void {
    this.store.loadDepartments();
  }
}
