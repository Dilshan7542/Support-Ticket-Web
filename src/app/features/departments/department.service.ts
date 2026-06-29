import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';
import { Department } from '../../core/models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly api = inject(ApiClientService);

  create(request: Partial<Department>): Observable<Department> {
    return this.api.post<Department, Partial<Department>>(API_ENDPOINTS.departments.create, request);
  }

  list(request: ListRequest = {}): Observable<Department[]> {
    return this.api.post<Department[], ListRequest>(API_ENDPOINTS.departments.list, request);
  }

  detail(request: DetailRequest): Observable<Department> {
    return this.api.post<Department, DetailRequest>(API_ENDPOINTS.departments.detail, request);
  }

  update(request: Partial<Department>): Observable<Department> {
    return this.api.post<Department, Partial<Department>>(API_ENDPOINTS.departments.update, request);
  }
}
