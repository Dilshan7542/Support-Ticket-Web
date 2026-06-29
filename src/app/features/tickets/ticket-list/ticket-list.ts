import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TicketsStore } from '../state/tickets.store';

@Component({
  selector: 'app-ticket-list',
  imports: [RouterLink],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit {
  readonly store = inject(TicketsStore);

  ngOnInit(): void {
    this.store.loadTickets();
  }
}
