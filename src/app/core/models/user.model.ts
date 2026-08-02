import { UserRole } from './auth.model';

export interface User {
  id: string | number;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  vendorId?: string | number | null;
  role: UserRole;
  status?: string | null;
}

export interface CreateUserRequest {
  userId: string | number | null;
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string | null;
  vendorId: string | number | null;
  role: UserRole;
}

export interface DepartmentUsersRequest {
  userId: string | number | null;
  departmentId?: string | number | null;
  categoryId?: string | number | null;
  categoryCode?: string | null;
}
