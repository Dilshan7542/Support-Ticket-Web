import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { Company } from '../../core/models/company.model';
import { DetailRequest, ListRequest, PageResponse } from '../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly listCache = new Map<string, Observable<Company[]>>();

  create(request: Partial<Company>): Observable<Company> {
    return this.api.post<Company>(API_ENDPOINTS.companies.create, {
      userId: this.getUserId(),
      ...request
    }).pipe(tap(() => this.clearListCache()));
  }

  list(request: ListRequest = {}): Observable<Company[]> {
    const listRequest = { page: 0, size: 100, ...request };
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

  listPage(request: ListRequest = {}): Observable<PageResponse<Company>> {
    return this.api.post<PageResponse<Company>, ListRequest>(API_ENDPOINTS.companies.list, {
      userId: this.getUserId(),
      page: 0,
      size: 100,
      ...request
    });
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
    }).pipe(tap(() => this.clearListCache()));
  }

  clearListCache(): void {
    this.listCache.clear();
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
