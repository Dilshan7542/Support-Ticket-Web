import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TicketPriority } from '../../../core/models/ticket-priority.model';
import { TicketPriorityService } from '../ticket-priority.service';
import { TicketsStore } from '../state/tickets.store';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit {
  readonly store = inject(TicketsStore);
  private readonly ticketPriorityService = inject(TicketPriorityService);

  readonly pageSize = 20;
  readonly currentPage = signal(1);
  readonly priorities = signal<TicketPriority[]>([]);
  readonly selectedPriority = signal('');
  readonly prioritiesLoading = signal(false);

  ngOnInit(): void {
    this.loadPriorities();
    this.loadPage(1);
  }

  filterByPriority(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.selectedPriority.set(select.value);
    this.loadPage(1);
  }

  nextPage(): void {
    this.loadPage(Math.min(this.store.totalPages(), this.currentPage() + 1));
  }

  previousPage(): void {
    this.loadPage(Math.max(1, this.currentPage() - 1));
  }

  private loadPage(page: number): void {
    const priority = this.selectedPriority();

    this.currentPage.set(page);
    this.store.loadTickets({
      page: page - 1,
      size: this.pageSize,
      ...(priority ? { priority } : {})
    });
  }

  private loadPriorities(): void {
    this.prioritiesLoading.set(true);

    this.ticketPriorityService.list({ page: 0, size: 100 }).subscribe({
      next: (priorities) => {
        this.priorities.set(priorities.filter((priority) => priority.status !== 'INACTIVE' && priority.status !== 'DELETED'));
        this.prioritiesLoading.set(false);
      },
      error: () => this.prioritiesLoading.set(false)
    });
  }
}
