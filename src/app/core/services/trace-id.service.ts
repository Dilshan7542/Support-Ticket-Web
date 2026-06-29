import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TraceIdService {
  create(): string {
    return crypto.randomUUID();
  }
}
