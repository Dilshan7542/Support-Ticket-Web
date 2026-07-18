import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    redirectTo: '/customer/register'
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }
];
