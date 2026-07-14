import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { TicketCategoryMapping } from '../../core/models/ticket-category-mapping.model';

@Injectable({ providedIn: 'root' })
export class TicketCategoryMappingService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  list(request: ListRequest = {}): Observable<TicketCategoryMapping[]> {
    return this.listPage({ page: 0, size: 100, ...request }).pipe(map((page) => page.content));
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<TicketCategoryMapping>> {
    return this.api.post<PageResponse<TicketCategoryMapping>, ListRequest>(API_ENDPOINTS.ticketCategoryMappings.list, {
      userId: this.getUserId(),
      page: 0,
      size: 100,
      ...this.normalizeMappingRequest(request)
    });
  }

  detail(request: DetailRequest): Observable<TicketCategoryMapping> {
    return this.api.post<TicketCategoryMapping>(API_ENDPOINTS.ticketCategoryMappings.detail, {
      userId: this.getUserId(),
      mappingId: this.toNumber(request.id)
    });
  }

  create(request: Partial<TicketCategoryMapping>): Observable<TicketCategoryMapping> {
    return this.api.post<TicketCategoryMapping>(API_ENDPOINTS.ticketCategoryMappings.create, {
      userId: this.getUserId(),
      ...this.normalizeMappingRequest(request)
    });
  }

  update(request: Partial<TicketCategoryMapping>): Observable<TicketCategoryMapping> {
    const { id, ...changes } = request;

    return this.api.post<TicketCategoryMapping>(API_ENDPOINTS.ticketCategoryMappings.update, {
      userId: this.getUserId(),
      mappingId: this.toNumber(id),
      ...this.normalizeMappingRequest(changes)
    });
  }

  private normalizeMappingRequest<TRequest extends Partial<TicketCategoryMapping> | ListRequest>(request: TRequest): TRequest {
    return {
      ...request,
      companyId: this.toNumber(request.companyId as string | number | null | undefined),
      categoryId: this.toNumber(request.categoryId as string | number | null | undefined),
      departmentId: this.toNumber(request.departmentId as string | number | null | undefined)
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
