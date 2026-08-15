// .env 파일에서 값을 읽어옵니다. 절대 이 파일에 실제 URL을 하드코딩하지 마세요.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

// VITE_USE_MOCK=false 로 설정하기 전까지는 항상 mock으로 동작합니다.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"
