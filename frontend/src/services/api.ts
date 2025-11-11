import { authService } from "./auth";
import { ApiResponse, QueryParams } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  // Authenticated GET request
  async get(
    endpoint: string,
    params: QueryParams = {},
    options: QueryParams = {},
  ): Promise<ApiResponse> {
    // Build URL with query parameters
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      url += `?${queryParams.toString()}`;
    }
    return this.request(url, { method: "GET", ...options });
  }

  // Authenticated POST request
  async post(
    endpoint: string,
    data: unknown = {},
    options: QueryParams = {},
  ): Promise<ApiResponse> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Authenticated PUT request
  async put(
    endpoint: string,
    data: unknown = {},
    options: QueryParams = {},
  ): Promise<ApiResponse> {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  // Authenticated DELETE request
  async delete(
    endpoint: string,
    options: QueryParams = {},
  ): Promise<ApiResponse> {
    return this.request(endpoint, { method: "DELETE", ...options });
  }

  // Generic authenticated request method
  async request(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    const token = authService.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(
          error.error || `Request failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
