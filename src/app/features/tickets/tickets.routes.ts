import { Routes } from '@angular/router';

export const ticketsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ticket-list/ticket-list').then((m) => m.TicketList)
  },
  {
    path: 'create',
    loadComponent: () => import('./ticket-create/ticket-create').then((m) => m.TicketCreate)
  },
  {
    path: ':id',
    loadComponent: () => import('./ticket-detail/ticket-detail').then((m) => m.TicketDetail)
  }
];
