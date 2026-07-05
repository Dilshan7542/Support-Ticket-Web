import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiBusinessError, ApiErrorData, ApiResponse, GENERIC_API_ERROR_MESSAGE } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  post<TResponse, TRequest = unknown>(path: string, body?: TRequest): Observable<TResponse> {
    return this.http
      .post<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  get<TResponse>(path: string, params?: Record<string, string | number | boolean>): Observable<TResponse> {
    return this.http
      .get<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, { params: this.toParams(params) })
      .pipe(map((response) => this.unwrapResponse(response)));
  }

  getRaw<TResponse>(path: string, params?: Record<string, string | number | boolean>): Observable<TResponse> {
    return this.http.get<TResponse>(`${this.baseUrl}${path}`, { params: this.toParams(params) });
  }

  upload<TResponse>(path: string, formData: FormData): Observable<TResponse> {
    return this.http
      .post<ApiResponse<TResponse>>(`${this.baseUrl}${path}`, formData)
      .pipe(map((response) => this.unwrapResponse(response)));
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

  private unwrapResponse<TResponse>(response: ApiResponse<TResponse>): TResponse {
    if (!response.success || response.statusCode === '01') {
      const errorData = this.getErrorData(response.data);
      const message = errorData?.display === true && errorData.displayMessage
        ? errorData.displayMessage
        : GENERIC_API_ERROR_MESSAGE;

      throw new ApiBusinessError(message, response as ApiResponse<unknown>, errorData);
    }

    return response.data;
  }

  private getErrorData(data: unknown): ApiErrorData | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    return data as ApiErrorData;
  }
}
