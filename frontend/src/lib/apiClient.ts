"use client";

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL, AUTH_COOKIE_NAME, ROUTES } from "./constants";
import type { ApiError } from "@/types";

// ─── Create the Axios instance ────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000, // 15 s
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach JWT from cookie ─────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — normalise errors, handle 401 ─────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear cookie and redirect to login
      Cookies.remove(AUTH_COOKIE_NAME);
      if (typeof window !== "undefined") {
        window.location.href = ROUTES.LOGIN;
      }
    }

    // Normalise to a consistent error shape
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred.",
      statusCode: error.response?.status ?? 0,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;

// ─── Convenience helpers ──────────────────────────────────────────────────────

export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
