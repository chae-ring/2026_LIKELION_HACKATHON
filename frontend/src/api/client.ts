import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = "UNKNOWN", status?: number) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";

  body?: unknown;
  timeoutMs?: number;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, timeoutMs = 10000 } = options;

  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const accessToken = localStorage.getItem("accessToken");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,

      body: body !== undefined ? JSON.stringify(body) : undefined,

      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `요청이 실패했습니다. (${res.status})`;

      try {
        const errBody = await res.json();

        if (errBody?.message) {
          message = errBody.message;
        }
      } catch {
        // 에러 응답이 JSON이 아니면
        // 기본 메시지 사용
      }

      if (res.status === 401 || res.status === 403) {
        console.warn("인증이 만료되었거나 권한이 없습니다.");
      }

      throw new ApiError(message, "HTTP_ERROR", res.status);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("요청 시간이 초과되었습니다.", "TIMEOUT");
    }

    throw new ApiError("네트워크 오류가 발생했습니다.", "NETWORK_ERROR");
  } finally {
    clearTimeout(timer);
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}