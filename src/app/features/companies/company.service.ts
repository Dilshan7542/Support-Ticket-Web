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
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }

  list(request: ListRequest = {}): Observable<Company[]> {
    return this.api.post<Company[], ListRequest>(API_ENDPOINTS.companies.list, {
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }

  detail(request: DetailRequest): Observable<Company> {
    return this.api.post<Company>(API_ENDPOINTS.companies.detail, {
      userId: this.tokenStorage.getUserId(),
      companyId: request.id
    });
  }

  update(request: Partial<Company>): Observable<Company> {
    const { id, ...changes } = request;
    return this.api.post<Company>(API_ENDPOINTS.companies.update, {
      userId: this.tokenStorage.getUserId(),
      companyId: id,
      ...changes
    });
  }
}
