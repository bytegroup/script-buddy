"use client";

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";
import { getSession } from "next-auth/react";
import { API_BASE_URL } from "./constants";
import type { ApiError } from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Attach access token from Auth.js session on every request
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message:    error.response?.data?.message ?? error.message ?? "An unexpected error occurred.",
      statusCode: error.response?.status ?? 0,
      errors:     error.response?.data?.errors,
    };
    return Promise.reject(apiError);
  }
);

export default apiClient;

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}
