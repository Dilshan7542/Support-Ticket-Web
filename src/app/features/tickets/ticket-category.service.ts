import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { TicketCategory } from '../../core/models/ticket-category.model';

@Injectable({ providedIn: 'root' })
export class TicketCategoryService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  list(request: ListRequest = {}): Observable<TicketCategory[]> {
    return this.listPage({ page: 0, size: 100, ...request }).pipe(map((page) => page.content));
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<TicketCategory>> {
    return this.api.post<PageResponse<TicketCategory>, ListRequest>(API_ENDPOINTS.ticketCategories.list, {
      userId: this.getUserId(),
      page: 0,
      size: 100,
      ...request
    });
  }

  detail(request: DetailRequest): Observable<TicketCategory> {
    return this.api.post<TicketCategory>(API_ENDPOINTS.ticketCategories.detail, {
      userId: this.getUserId(),
      categoryId: this.toNumber(request.id)
    });
  }

  create(request: Partial<TicketCategory>): Observable<TicketCategory> {
    return this.api.post<TicketCategory>(API_ENDPOINTS.ticketCategories.create, {
      userId: this.getUserId(),
      ...this.normalizeCategoryRequest(request)
    });
  }

  update(request: Partial<TicketCategory>): Observable<TicketCategory> {
    const { id, ...changes } = request;
    return this.api.post<TicketCategory>(API_ENDPOINTS.ticketCategories.update, {
      userId: this.getUserId(),
      categoryId: this.toNumber(id),
      ...this.normalizeCategoryRequest(changes)
    });
  }

  private normalizeCategoryRequest<TRequest extends Partial<TicketCategory>>(request: TRequest): TRequest {
    return {
      ...request,
      companyId: this.toNumber(request.companyId),
      departmentId: this.toNumber(request.departmentId)
    } as TRequest;
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
