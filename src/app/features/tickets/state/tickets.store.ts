import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { getApiErrorMessage, ListRequest } from '../../../core/models/api-response.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketsStore {
  private readonly ticketService = inject(TicketService);
  private readonly ticketsSignal = signal<Ticket[]>([]);
  private readonly selectedTicketSignal = signal<Ticket | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly pageSignal = signal(0);
  private readonly totalPagesSignal = signal(1);
  private readonly totalElementsSignal = signal(0);

  readonly tickets = this.ticketsSignal.asReadonly();
  readonly selectedTicket = this.selectedTicketSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly page = this.pageSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly totalElements = this.totalElementsSignal.asReadonly();
  readonly openTickets = computed(() => this.tickets().filter((ticket) => ticket.status !== 'CLOSED'));

  loadTickets(request: ListRequest = {}): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.ticketService.listPage(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      next: (page) => {
        this.ticketsSignal.set(page.content);
        this.pageSignal.set(page.page);
        this.totalPagesSignal.set(Math.max(1, page.totalPages));
        this.totalElementsSignal.set(page.totalElements);
      },
      error: (error) => this.errorSignal.set(getApiErrorMessage(error, 'Unable to load tickets'))
    });
  }

  loadTicket(id: string | number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.ticketService.detail({ id }).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      next: (ticket) => this.selectedTicketSignal.set(ticket),
      error: (error) => this.errorSignal.set(getApiErrorMessage(error, 'Unable to load ticket'))
    });
  }
}
