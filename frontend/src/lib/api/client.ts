import { API_BASE_URL } from "lib/env";

import { ApiError } from "./errors";

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  /** Skip JSON Content-Type (e.g. multipart FormData) */
  rawBody?: boolean;
};

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { error: text };
  }
}

/**
 * Typed fetch wrapper for Flask API — preserves existing routes and payloads.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, rawBody, headers: customHeaders, ...init } = options;

  const headers = new Headers(customHeaders);

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (rawBody || body instanceof FormData || body instanceof Blob) {
      requestBody = body as BodyInit;
    } else {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(buildUrl(path), {
    ...init,
    headers,
    body: requestBody,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : res.statusText || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export { API_BASE_URL };
