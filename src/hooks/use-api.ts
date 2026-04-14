import { useCallback, useRef } from "react";
import { toast } from "sonner";

export interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export function useApi() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const request = useCallback(
    async <T = unknown>(
      url: string,
      options?: RequestInit & UseApiOptions
    ): Promise<T | null> => {
      const {
        onSuccess,
        onError,
        successMessage,
        errorMessage,
        showToast = true,
        ...fetchOptions
      } = options || {};

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || errorData?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        onSuccess?.(data);
        if (showToast && successMessage) toast.success(successMessage);
        return data as T;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return null;
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        if (showToast) toast.error(errorMessage || err.message);
        return null;
      }
    },
    []
  );

  const get = useCallback(
    <T = unknown>(url: string, options?: Omit<RequestInit, "method"> & UseApiOptions) =>
      request<T>(url, { ...options, method: "GET" }),
    [request]
  );

  const post = useCallback(
    <T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, "method"> & UseApiOptions) =>
      request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),
    [request]
  );

  const put = useCallback(
    <T = unknown>(url: string, body?: unknown, options?: Omit<RequestInit, "method"> & UseApiOptions) =>
      request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
    [request]
  );

  const del = useCallback(
    <T = unknown>(url: string, options?: Omit<RequestInit, "method"> & UseApiOptions) =>
      request<T>(url, { ...options, method: "DELETE" }),
    [request]
  );

  return { get, post, put, del, request };
}
