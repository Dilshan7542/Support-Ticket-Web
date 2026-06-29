import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  summary(request: Record<string, unknown> = {}): Observable<DashboardSummary> {
    return this.api.post<DashboardSummary, Record<string, unknown>>(API_ENDPOINTS.dashboard.summary, {
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }
}
