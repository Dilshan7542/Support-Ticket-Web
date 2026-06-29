import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'customer',
    loadComponent: () => import('./features/customer/customer-portal/customer-portal').then((m) => m.CustomerPortal)
  },
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes)
      },
      {
        path: 'tickets',
        loadChildren: () => import('./features/tickets/tickets.routes').then((m) => m.ticketsRoutes)
      },
      {
        path: 'departments',
        loadChildren: () => import('./features/departments/departments.routes').then((m) => m.departmentsRoutes)
      },
      {
        path: 'activity-logs',
        loadChildren: () => import('./features/activity-logs/activity-logs.routes').then((m) => m.activityLogsRoutes)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/auth/register'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
