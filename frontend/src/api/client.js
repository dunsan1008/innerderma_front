import axios from 'axios';

/**
 * 공용 HTTP 클라이언트.
 * 규칙: 컴포넌트에서 axios/fetch 를 직접 호출하지 않고 src/api/<도메인>.js 를 경유한다.
 * 백엔드 계약은 camelCase, 기본 네임스페이스는 /api (버전 세그먼트 없음).
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** 토큰 저장소 (추후 인증 연동 시 교체 지점) */
const TOKEN_KEY = 'innerderma.accessToken';

export function setAccessToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * 백엔드 응답은 { success, data } 로 감싸져 온다(ApiResponse<T>).
 * success/data 봉투가 있으면 data 만 꺼내서 반환하고, 아니면(예: actuator 등 비표준 응답) 그대로 둔다.
 */
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) return body.data;
    return body;
  },
  (error) => {
    if (error.response?.status === 401) setAccessToken(null);
    return Promise.reject(error);
  },
);

export default client;
