import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';
import { Department } from '../../core/models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  create(request: Partial<Department>): Observable<Department> {
    return this.api.post<Department>(API_ENDPOINTS.departments.create, {
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }

  list(request: ListRequest = {}): Observable<Department[]> {
    return this.api.post<Department[], ListRequest>(API_ENDPOINTS.departments.list, {
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }

  detail(request: DetailRequest): Observable<Department> {
    return this.api.post<Department>(API_ENDPOINTS.departments.detail, {
      userId: this.tokenStorage.getUserId(),
      departmentId: request.id
    });
  }

  update(request: Partial<Department>): Observable<Department> {
    const { id, ...changes } = request;
    return this.api.post<Department>(API_ENDPOINTS.departments.update, {
      userId: this.tokenStorage.getUserId(),
      departmentId: id,
      ...changes
    });
  }

  delete(id: string | number): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.departments.delete, {
      userId: this.tokenStorage.getUserId(),
      departmentId: id
    });
  }
}
