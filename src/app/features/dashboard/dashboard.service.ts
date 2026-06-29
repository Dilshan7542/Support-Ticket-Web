import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClientService);

  summary(request: Record<string, unknown> = {}): Observable<DashboardSummary> {
    return this.api.post<DashboardSummary, Record<string, unknown>>(API_ENDPOINTS.dashboard.summary, request);
  }
}
