import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  post<TResponse, TRequest = unknown>(path: string, body?: TRequest): Observable<TResponse> {
    return this.http
      .post<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(map((response) => response.data));
  }

  get<TResponse>(path: string, params?: Record<string, string | number | boolean>): Observable<TResponse> {
    return this.http
      .get<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, { params: this.toParams(params) })
      .pipe(map((response) => response.data));
  }

  getRaw<TResponse>(path: string, params?: Record<string, string | number | boolean>): Observable<TResponse> {
    return this.http.get<TResponse>(`${this.baseUrl}${path}`, { params: this.toParams(params) });
  }

  upload<TResponse>(path: string, formData: FormData): Observable<TResponse> {
    return this.http
      .post<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, formData)
      .pipe(map((response) => response.data));
  }

  download(path: string, params: Record<string, string | number | boolean>): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${path}`, {
      params: this.toParams(params),
      responseType: 'blob'
    });
  }

  downloadResponse(path: string, params: Record<string, string | number | boolean>): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}${path}`, {
      observe: 'response',
      params: this.toParams(params),
      responseType: 'blob'
    });
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }
}
