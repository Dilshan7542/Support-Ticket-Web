export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  traceId?: string;
  timestamp?: string;
}

export interface ListRequest {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

export interface DetailRequest {
  id: string | number;
}
