import { Component, OnInit, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TicketsStore } from '../state/tickets.store';

@Component({
  selector: 'app-ticket-detail',
  imports: [JsonPipe],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {
  readonly store = inject(TicketsStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.store.loadTicket(id);
    }
  }
}
