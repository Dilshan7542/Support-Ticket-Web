export interface ApiResponse<T> {
  success: boolean;
  statusCode?: string;
  message?: string;
  data: T;
  errors?: string[];
  traceId?: string;
  timestamp?: string;
}

export class ApiBusinessError extends Error {
  constructor(
    message: string,
    readonly response: ApiResponse<unknown>
  ) {
    super(message);
    this.name = 'ApiBusinessError';
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiBusinessError) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
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
