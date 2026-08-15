// 로그인 성공 시 백엔드(OAuth2SuccessHandler)가
// { accessToken, userId, email } 형태로 JSON을 내려줌.
// AUTH-002(OAuth Callback) 쪽에서 로그인 성공 시 이 두 값을 저장해줘야
// api/client.ts와 api/recommendation.ts가 각각 꺼내 쓸 수 있음.
const TOKEN_KEY = "mcm_access_token"
const USER_ID_KEY = "mcm_user_id"

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUserId(): number | null {
  const raw = localStorage.getItem(USER_ID_KEY)
  return raw ? Number(raw) : null
}

export function setUserId(userId: number): void {
  localStorage.setItem(USER_ID_KEY, String(userId))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
}
