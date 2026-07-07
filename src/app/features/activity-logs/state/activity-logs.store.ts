import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ListRequest } from '../../../core/models/api-response.model';
import { ActivityLog } from '../../../core/models/activity-log.model';
import { ActivityLogService } from '../activity-log.service';

@Injectable({ providedIn: 'root' })
export class ActivityLogsStore {
  private readonly activityLogService = inject(ActivityLogService);
  private readonly logsSignal = signal<ActivityLog[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly pageSignal = signal(0);
  private readonly totalPagesSignal = signal(1);
  private readonly totalElementsSignal = signal(0);

  readonly logs = this.logsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly page = this.pageSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly totalElements = this.totalElementsSignal.asReadonly();

  loadLogs(request: ListRequest = {}): void {
    this.loadingSignal.set(true);
    this.activityLogService.listPage(request).pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe((page) => {
      this.logsSignal.set(page.content);
      this.pageSignal.set(page.page);
      this.totalPagesSignal.set(Math.max(1, page.totalPages));
      this.totalElementsSignal.set(page.totalElements);
    });
  }
}
