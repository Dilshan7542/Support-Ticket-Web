import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.store.logs().length / this.pageSize)));
  readonly pageLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.store.logs().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.store.loadLogs();
  }

  nextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  previousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }
}
