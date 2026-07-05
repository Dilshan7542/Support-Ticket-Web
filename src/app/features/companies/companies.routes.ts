import { Routes } from '@angular/router';

export const companiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./company-list/company-list').then((m) => m.CompanyList)
  },
  {
    path: ':id',
    loadComponent: () => import('./company-detail/company-detail').then((m) => m.CompanyDetail)
  }
];
