import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { DashboardSummary } from '../../../core/models/dashboard.model';
import { DashboardService } from '../dashboard.service';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly dashboardService = inject(DashboardService);
  private readonly summarySignal = signal<DashboardSummary | null>(null);
  private readonly loadingSignal = signal(false);

  readonly summary = this.summarySignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  loadSummary(): void {
    this.loadingSignal.set(true);
    this.dashboardService.summary().pipe(
      finalize(() => this.loadingSignal.set(false))
    ).subscribe((summary) => this.summarySignal.set(summary));
  }
}
