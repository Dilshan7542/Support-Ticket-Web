import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { CreateUserRequest, DepartmentUsersRequest, User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  create(request: Omit<CreateUserRequest, 'userId'>): Observable<User> {
    return this.api.post<User, CreateUserRequest>(API_ENDPOINTS.auth.createUser, {
      userId: this.getUserId(),
      ...request,
      vendorId: this.toNumber(request.vendorId)
    });
  }

  getUsersByDepartment(filter: Omit<DepartmentUsersRequest, 'userId'>): Observable<User[]> {
    return this.api.post<User[], DepartmentUsersRequest>(API_ENDPOINTS.departments.users, {
      userId: this.getUserId(),
      departmentId: this.toNumber(filter.departmentId),
      categoryId: this.toNumber(filter.categoryId),
      categoryCode: filter.categoryCode || null
    });
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
