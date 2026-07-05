import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { Company } from '../../core/models/company.model';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  create(request: Partial<Company>): Observable<Company> {
    return this.api.post<Company>(API_ENDPOINTS.companies.create, {
      userId: this.getUserId(),
      ...request
    });
  }

  list(request: ListRequest = {}): Observable<Company[]> {
    return this.api.post<Company[], ListRequest>(API_ENDPOINTS.companies.list, request);
  }

  detail(request: DetailRequest): Observable<Company> {
    return this.api.post<Company>(API_ENDPOINTS.companies.detail, {
      companyId: this.toNumber(request.id)
    });
  }

  update(request: Partial<Company>): Observable<Company> {
    const { id, ...changes } = request;
    return this.api.post<Company>(API_ENDPOINTS.companies.update, {
      userId: this.getUserId(),
      companyId: this.toNumber(id),
      ...changes
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
