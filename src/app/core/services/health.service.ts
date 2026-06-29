import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiClientService } from '../http/api-client.service';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly api = inject(ApiClientService);

  status(): Observable<unknown> {
    return this.api.get<unknown>(API_ENDPOINTS.health.status);
  }
}
