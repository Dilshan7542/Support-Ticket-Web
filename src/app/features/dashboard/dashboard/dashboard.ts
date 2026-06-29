import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../tickets/ticket.service';
import { DashboardStore } from '../state/dashboard.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly ticketService = inject(TicketService);
  readonly store = inject(DashboardStore);

  readonly tickets = signal<Ticket[]>([]);
  readonly total = computed(() => Number(this.store.summary()?.['totalTickets'] ?? 0));
  readonly open = computed(() => Number(this.store.summary()?.['openTickets'] ?? this.store.summary()?.['pendingTickets'] ?? 0));
  readonly resolved = computed(() => Number(this.store.summary()?.['resolvedTickets'] ?? 0));
  readonly closed = computed(() => Number(this.store.summary()?.['closedTickets'] ?? 0));

  ngOnInit(): void {
    this.store.loadSummary();
    this.ticketService.list().subscribe((tickets) => this.tickets.set(tickets));
  }
}
