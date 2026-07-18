import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { TicketPriority } from '../../core/models/ticket-priority.model';

@Injectable({ providedIn: 'root' })
export class TicketPriorityService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  list(request: ListRequest = {}): Observable<TicketPriority[]> {
    return this.listPage({ page: 0, size: 100, ...request }).pipe(map((page) => page.content));
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<TicketPriority>> {
    return this.api.post<PageResponse<TicketPriority>, ListRequest>(API_ENDPOINTS.ticketPriorities.list, {
      page: 0,
      size: 100,
      ...request
    });
  }

  detail(request: DetailRequest): Observable<TicketPriority> {
    return this.api.post<TicketPriority>(API_ENDPOINTS.ticketPriorities.detail, {
      priorityId: this.toNumber(request.id)
    });
  }

  create(request: Partial<TicketPriority>): Observable<TicketPriority> {
    return this.api.post<TicketPriority>(API_ENDPOINTS.ticketPriorities.create, {
      userId: this.getUserId(),
      name: request.name,
      code: request.code,
      description: request.description ?? null
    });
  }

  update(request: Partial<TicketPriority>): Observable<TicketPriority> {
    const { id, ...changes } = request;

    return this.api.post<TicketPriority>(API_ENDPOINTS.ticketPriorities.update, {
      userId: this.getUserId(),
      priorityId: this.toNumber(id),
      name: changes.name,
      code: changes.code,
      description: changes.description ?? null,
      status: changes.status
    });
  }

  softDelete(id: string | number): Observable<TicketPriority> {
    return this.api.post<TicketPriority>(API_ENDPOINTS.ticketPriorities.delete, {
      userId: this.getUserId(),
      priorityId: this.toNumber(id)
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
