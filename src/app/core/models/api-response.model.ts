export interface ApiResponse<T> {
  success: boolean;
  statusCode?: string;
  message?: string;
  data: T;
  errors?: string[];
  traceId?: string;
  timestamp?: string;
}

export interface ApiErrorData {
  code?: string;
  display?: boolean;
  displayMessage?: string | null;
  severity?: 'ERROR' | 'WARNING' | 'INFO' | string;
  details?: Record<string, string>;
  action?: string;
}

export class ApiBusinessError extends Error {
  constructor(
    message: string,
    readonly response: ApiResponse<unknown>,
    readonly errorData?: ApiErrorData
  ) {
    super(message);
    this.name = 'ApiBusinessError';
  }
}

export const GENERIC_API_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiBusinessError) {
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
