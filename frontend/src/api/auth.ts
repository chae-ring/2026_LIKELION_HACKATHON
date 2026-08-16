// 로그인 성공 시 App.tsx(useEffect)가 아래 두 키로 이미 저장해둠:
// localStorage.setItem("accessToken", ...)
// localStorage.setItem("userId", ...)
// api/client.ts는 accessToken을 직접 읽어서 쓰고,
// 여기서는 userId만 다른 화면(추천 등)에서 편하게 꺼내 쓰도록 함수로 노출.
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken")
}

export function getUserId(): number | null {
  const raw = localStorage.getItem("userId")
  return raw ? Number(raw) : null
}
