export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// OAuth 로그인을 시작할 백엔드 주소
export const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";

// VITE_USE_MOCK=false 로 설정하면 실제 API 사용
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
