import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { TicketStatusMaster } from '../../core/models/ticket-status.model';

@Injectable({ providedIn: 'root' })
export class TicketStatusService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  list(request: ListRequest = {}): Observable<TicketStatusMaster[]> {
    return this.listPage({ page: 0, size: 100, ...request }).pipe(map((page) => page.content));
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<TicketStatusMaster>> {
    return this.api.post<PageResponse<TicketStatusMaster>, ListRequest>(API_ENDPOINTS.ticketStatuses.list, {
      userId: this.getUserId(),
      page: 0,
      size: 100,
      ...request
    });
  }

  detail(request: DetailRequest): Observable<TicketStatusMaster> {
    return this.api.post<TicketStatusMaster>(API_ENDPOINTS.ticketStatuses.detail, {
      userId: this.getUserId(),
      statusId: this.toNumber(request.id)
    });
  }

  create(request: Partial<TicketStatusMaster>): Observable<TicketStatusMaster> {
    return this.api.post<TicketStatusMaster>(API_ENDPOINTS.ticketStatuses.create, {
      userId: this.getUserId(),
      name: request.name,
      code: request.code,
      description: request.description ?? null
    });
  }

  update(request: Partial<TicketStatusMaster>): Observable<TicketStatusMaster> {
    const { id, ...changes } = request;

    return this.api.post<TicketStatusMaster>(API_ENDPOINTS.ticketStatuses.update, {
      userId: this.getUserId(),
      statusId: this.toNumber(id),
      name: changes.name,
      code: changes.code,
      description: changes.description ?? null,
      status: changes.status
    });
  }

  private getUserId(): number | null {
    return this.toNumber(this.tokenStorage.getUserId());
  }

  private toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }
}
