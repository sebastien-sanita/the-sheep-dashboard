import type { ApiError } from "../types";

// Browser: use relative URLs so Next.js rewrite proxy handles CORS
// Server (SSR): use the full backend URL directly
const BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "https://api.the-sheep.fr";

// Direct backend URL for SSE streaming (bypasses Next.js proxy which buffers/times out)
const STREAM_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.the-sheep.fr";

const AUTH_STORAGE_KEY = "the-sheep-auth";

class ApiClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = "/login";
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!BASE_URL) {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs.set(key, String(value));
      }
    }
    const query = qs.toString();
    return query ? `${endpoint}?${query}` : endpoint;
  }

  const url = new URL(endpoint, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleError(res: Response): Promise<never> {
  if (res.status === 401) {
    clearAuthAndRedirect();
  }

  let message = `${res.status} ${res.statusText}`;
  try {
    const body = (await res.json()) as ApiError;
    if (body.message) {
      message = body.message;
    }
  } catch {
    // response body not JSON — keep default message
  }
  throw new ApiClientError(message, res.status);
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers: customHeaders, ...fetchOptions } = options;

  const res = await fetch(buildUrl(endpoint, params), {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...customHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...fetchOptions,
  });

  if (!res.ok) {
    await handleError(res);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET", params });
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiClient<T>(endpoint, { method: "POST", body });
}

export async function apiDelete<T = void>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

/** Returns the raw Response so callers can inspect Content-Type and choose SSE vs JSON parsing */
export async function apiStreamRaw(endpoint: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  // Use direct backend URL for streaming — bypasses Next.js rewrite proxy
  const streamUrl = `${STREAM_BASE_URL}${endpoint}`;

  const res = await fetch(streamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    if (res.status === 401) clearAuthAndRedirect();
    let message = `${res.status} ${res.statusText}`;
    try { const b = await res.json() as ApiError; if (b.message) message = b.message; } catch { /* ignore */ }
    throw new ApiClientError(message, res.status);
  }

  return res;
}

/** Backward-compatible: returns ReadableStream (for settings page test) */
export async function apiStream(endpoint: string, body: unknown, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  const res = await apiStreamRaw(endpoint, body, signal);
  if (!res.body) throw new ApiClientError("Response body is null", 0);
  return res.body;
}
