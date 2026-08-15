import { API_BASE_URL } from "./config"
import { getAccessToken } from "./auth"

export class ApiError extends Error {
  code: string
  status?: number

  constructor(message: string, code = "UNKNOWN", status?: number) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
  timeoutMs?: number
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, timeoutMs = 10000 } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!res.ok) {
      let message = `요청이 실패했습니다. (${res.status})`
      try {
        const errBody = await res.json()
        if (errBody?.message) message = errBody.message
      } catch {
        // 에러 응답이 JSON이 아니면 기본 메시지 사용
      }
      throw new ApiError(message, "HTTP_ERROR", res.status)
    }

    // 204 No Content 등 바디 없는 응답 대비
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
  } catch (err) {
    if (err instanceof ApiError) throw err

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("요청 시간이 초과되었습니다.", "TIMEOUT")
    }

    throw new ApiError("네트워크 오류가 발생했습니다.", "NETWORK_ERROR")
  } finally {
    clearTimeout(timer)
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 백엔드가 아트워크 URL을 "/api/v1/artworks/5/image" 같은 상대경로로 줄 때,
// 실제 <img src>에 쓸 수 있도록 서버 주소를 붙여줌.
// mock에서 오는 절대 URL(https://...)은 그대로 통과시킴.
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return ""
  // 절대 URL이나 base64 data URI는 그대로 두고, 상대경로일 때만 서버 주소를 붙임
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url
  }
  return `${API_BASE_URL}${url}`
}
