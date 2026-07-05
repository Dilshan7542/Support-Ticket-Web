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
      userId: this.getUserId(),
      ...this.normalizeDepartmentRequest(request)
    });
  }

  list(request: ListRequest = {}): Observable<Department[]> {
    return this.api.post<Department[], ListRequest>(API_ENDPOINTS.departments.list, {
      userId: this.getUserId(),
      ...this.normalizeDepartmentRequest(request)
    });
  }

  detail(request: DetailRequest): Observable<Department> {
    return this.api.post<Department>(API_ENDPOINTS.departments.detail, {
      userId: this.getUserId(),
      departmentId: this.toNumber(request.id)
    });
  }

  update(request: Partial<Department>): Observable<Department> {
    const { id, ...changes } = request;
    return this.api.post<Department>(API_ENDPOINTS.departments.update, {
      userId: this.getUserId(),
      departmentId: this.toNumber(id),
      ...this.normalizeDepartmentRequest(changes)
    });
  }

  delete(id: string | number): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.departments.delete, {
      userId: this.getUserId(),
      departmentId: this.toNumber(id)
    });
  }

  private normalizeDepartmentRequest<TRequest extends Partial<Department> | ListRequest>(request: TRequest): TRequest {
    return {
      ...request,
      companyId: this.toNumber(request.companyId as string | number | null | undefined)
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
