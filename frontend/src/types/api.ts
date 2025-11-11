// Generic API types

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  params?: QueryParams;
}

export interface FetchConfig extends RequestOptions {
  url: string;
}

export interface ResponseMetadata {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
