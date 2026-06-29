import { Routes } from '@angular/router';

export const activityLogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./activity-log-list/activity-log-list').then((m) => m.ActivityLogList)
  },
  {
    path: ':id',
    loadComponent: () => import('./activity-log-detail/activity-log-detail').then((m) => m.ActivityLogDetail)
  }
];
