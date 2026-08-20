import client from '@/api/client';

/**
 * AI 추천 규칙 도메인 API.
 * 사용자 화면이 아니라 관리/운영용 — 지금은 어느 화면도 쓰지 않는다.
 */

/** 전체 규칙 목록 */
export function getAiRules() {
  return client.get('/ai-rules');
}

/** 활성화된 규칙만 */
export function getEnabledAiRules() {
  return client.get('/ai-rules/enabled');
}

/** 규칙 활성/비활성 토글 */
export function toggleAiRule(ruleId) {
  return client.patch(`/ai-rules/${ruleId}/toggle`);
}
