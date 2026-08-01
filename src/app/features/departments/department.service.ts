import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';
import { Department } from '../../core/models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly listCache = new Map<string, Observable<Department[]>>();

  create(request: Partial<Department>): Observable<Department> {
    return this.api.post<Department>(API_ENDPOINTS.departments.create, {
      userId: this.getUserId(),
      ...this.normalizeDepartmentRequest(request)
    }).pipe(tap(() => this.clearListCache()));
  }

  list(request: ListRequest = {}): Observable<Department[]> {
    const listRequest = this.normalizeDepartmentRequest({ page: 0, size: 100, ...request });
    const cacheKey = this.getCacheKey(listRequest);
    const cachedList = this.listCache.get(cacheKey);

    if (cachedList) {
      return cachedList;
    }

    const list$ = this.listPage(listRequest).pipe(
      map((page) => page.content),
      catchError((error) => {
        this.listCache.delete(cacheKey);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.listCache.set(cacheKey, list$);

    return list$;
  }

  listPage(request: ListRequest = {}): Observable<PageResponse<Department>> {
    return this.api.post<PageResponse<Department>, ListRequest>(API_ENDPOINTS.departments.list, {
      userId: this.getUserId(),
      page: 0,
      size: 20,
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
    }).pipe(tap(() => this.clearListCache()));
  }

  delete(id: string | number): Observable<Department> {
    return this.api.post<Department>(API_ENDPOINTS.departments.update, {
      userId: this.getUserId(),
      departmentId: this.toNumber(id),
      status: 'DELETED'
    }).pipe(tap(() => this.clearListCache()));
  }

  clearListCache(): void {
    this.listCache.clear();
  }

  private normalizeDepartmentRequest<TRequest extends Partial<Department> | ListRequest>(request: TRequest): TRequest {
    return {
      ...request,
      vendorId: this.toNumber(request.vendorId as string | number | null | undefined)
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

  private getCacheKey(request: ListRequest): string {
    return JSON.stringify(Object.keys(request).sort().reduce<Record<string, unknown>>((cacheKey, key) => {
      cacheKey[key] = request[key as keyof ListRequest];
      return cacheKey;
    }, {}));
  }
}
