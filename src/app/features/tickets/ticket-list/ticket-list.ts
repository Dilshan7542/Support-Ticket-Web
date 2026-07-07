import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TicketsStore } from '../state/tickets.store';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit {
  readonly store = inject(TicketsStore);
  readonly pageSize = 20;
  readonly currentPage = signal(1);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.store.tickets().length / this.pageSize)));
  readonly pageTickets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.store.tickets().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.store.loadTickets();
  }

  nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }
}
