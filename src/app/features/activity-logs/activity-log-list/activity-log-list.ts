import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActivityLogsStore } from '../state/activity-logs.store';

@Component({
  selector: 'app-activity-log-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './activity-log-list.html',
  styleUrl: './activity-log-list.scss'
})
export class ActivityLogList implements OnInit {
  readonly store = inject(ActivityLogsStore);
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
    this.store.loadLogs({ page: page - 1, size: this.pageSize });
  }
}
