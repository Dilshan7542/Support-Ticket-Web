import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';
import { ActivityLog } from '../../core/models/activity-log.model';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly api = inject(ApiClientService);

  list(request: ListRequest = {}): Observable<ActivityLog[]> {
    return this.api.post<ActivityLog[], ListRequest>(API_ENDPOINTS.activityLogs.list, request);
  }

  detail(request: DetailRequest): Observable<ActivityLog> {
    return this.api.post<ActivityLog, DetailRequest>(API_ENDPOINTS.activityLogs.detail, request);
  }
}
