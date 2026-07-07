import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { ActivityLog } from '../../core/models/activity-log.model';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  list(request: ListRequest = {}): Observable<ActivityLog[]> {
    return this.listPage({ page: 0, size: 100, ...request }).pipe(map((page) => page.content));
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<ActivityLog>> {
    return this.api.post<PageResponse<ActivityLog>, ListRequest>(API_ENDPOINTS.activityLogs.list, {
      userId: this.tokenStorage.getUserId(),
      page: 0,
      size: 20,
      ...request
    });
  }

  detail(request: DetailRequest): Observable<ActivityLog> {
    return this.api.post<ActivityLog>(API_ENDPOINTS.activityLogs.detail, {
      userId: this.tokenStorage.getUserId(),
      activityLogId: request.id
    });
  }
}
