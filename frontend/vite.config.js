import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'node:path';
import os from 'node:os';

/**
 * HTTPS 사용 여부.
 * `HTTPS=1` 환경변수가 있으면 자체 서명 인증서로 HTTPS 를 켠다.
 *
 * 왜 필요한가:
 *   브라우저의 getUserMedia(카메라)는 **보안 컨텍스트**에서만 노출된다.
 *   localhost 는 예외로 허용되지만, 다른 기기에서 LAN IP(http://192.168.x.x)로 접속하면
 *   navigator.mediaDevices 자체가 undefined 가 되어 카메라를 쓸 수 없다.
 *   그래서 다른 기기 테스트용으로 HTTPS 모드를 준비해 둔다.
 */
const useHttps = process.env.HTTPS === '1';

/**
 * 이 PC 의 LAN IPv4 주소 목록.
 * 기본 인증서에는 127.0.0.1 만 들어가서 다른 기기가 LAN IP 로 접속하면
 * SSL 핸드셰이크가 실패한다. 그래서 감지한 IP 를 인증서 SAN 에 넣어 준다.
 */
function localIPv4List() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((nic) => nic && nic.family === 'IPv4' && !nic.internal)
    .map((nic) => nic.address);
}

/** 인증서에 담을 도메인·IP (localhost 계열 + 이 PC 의 LAN IP) */
const certDomains = ['localhost', '127.0.0.1', '::1', ...localIPv4List()];

export default defineConfig({
  plugins: [react(), ...(useHttps ? [basicSsl({ domains: certDomains })] : [])],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    port: 5173,
    // HTTPS 모드에서는 다른 기기에서 접속할 수 있도록 모든 인터페이스에 바인딩한다
    host: useHttps ? true : 'localhost',
    // 추후 백엔드 API 연동용 프록시. VITE_API_BASE_URL 을 쓰지 않는 로컬 개발에서 사용.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: useHttps ? true : 'localhost',
  },
});
