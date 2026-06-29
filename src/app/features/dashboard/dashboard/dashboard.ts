import { Component, OnInit, inject, signal } from '@angular/core';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../tickets/ticket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly ticketService = inject(TicketService);

  readonly tickets = signal<Ticket[]>([]);
  readonly total = signal(0);
  readonly open = signal(0);
  readonly resolved = signal(0);
  readonly closed = signal(0);

  ngOnInit(): void {
    this.ticketService.list().subscribe((tickets) => {
      this.tickets.set(tickets);
      this.total.set(tickets.length);
      this.open.set(tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS').length);
      this.resolved.set(tickets.filter((ticket) => ticket.status === 'RESOLVED').length);
      this.closed.set(tickets.filter((ticket) => ticket.status === 'CLOSED').length);
    });
  }
}
