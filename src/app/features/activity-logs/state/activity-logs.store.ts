import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ActivityLog } from '../../../core/models/activity-log.model';
import { ActivityLogService } from '../activity-log.service';

@Injectable({ providedIn: 'root' })
export class ActivityLogsStore {
  private readonly activityLogService = inject(ActivityLogService);
  private readonly logsSignal = signal<ActivityLog[]>([]);
  private readonly loadingSignal = signal(false);

  readonly logs = this.logsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadLogs(): void {
    this.loadingSignal.set(true);
    this.activityLogService.list().pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe((logs) => this.logsSignal.set(logs));
  }
}
