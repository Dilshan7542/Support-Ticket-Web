import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

  ngOnInit(): void {
    this.loadPage(1);
  }

  nextPage(): void {
    this.loadPage(Math.min(this.store.totalPages(), this.currentPage() + 1));
  }

  previousPage(): void {
    this.loadPage(Math.max(1, this.currentPage() - 1));
  }

  private loadPage(page: number): void {
    this.currentPage.set(page);
    this.store.loadTickets({ page: page - 1, size: this.pageSize });
  }
}
