import { Routes } from '@angular/router';

export const departmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./department-list/department-list').then((m) => m.DepartmentList)
  },
  {
    path: ':id',
    loadComponent: () => import('./department-detail/department-detail').then((m) => m.DepartmentDetail)
  }
];
