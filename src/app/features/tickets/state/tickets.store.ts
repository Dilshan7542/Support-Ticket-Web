import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ListRequest } from '../../../core/models/api-response.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../ticket.service';

@Injectable({ providedIn: 'root' })
export class TicketsStore {
  private readonly ticketService = inject(TicketService);
  private readonly ticketsSignal = signal<Ticket[]>([]);
  private readonly selectedTicketSignal = signal<Ticket | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly tickets = this.ticketsSignal.asReadonly();
  readonly selectedTicket = this.selectedTicketSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly openTickets = computed(() => this.tickets().filter((ticket) => ticket.status !== 'CLOSED'));

  loadTickets(request: ListRequest = {}): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.ticketService.list(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      next: (tickets) => this.ticketsSignal.set(tickets),
      error: () => this.errorSignal.set('Unable to load tickets')
    });
  }

  loadTicket(id: string | number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.ticketService.detail({ id }).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe({
      next: (ticket) => this.selectedTicketSignal.set(ticket),
      error: () => this.errorSignal.set('Unable to load ticket')
    });
  }
}
