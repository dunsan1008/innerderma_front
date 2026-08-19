import { COLORS, FONTS } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // 색상/폰트는 src/theme.js 단일 소스에서 주입한다.
      colors: COLORS,
      fontFamily: FONTS,
      keyframes: {
        // 오늘 밤 ↔ 내일 아침 전환처럼 내용이 통째로 바뀔 때 쓰는 페이드.
        // transform 을 쓰면 absolute 자식들의 기준 박스가 바뀌므로 opacity 만 움직인다.
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 260ms ease-out both',
      },
    },
  },
  plugins: [],
};
