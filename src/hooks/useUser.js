import { useState, useEffect } from 'react'

// 기기 모델 → 사용자 매핑
// Chrome 최신 버전은 UA 문자열에 모델명을 숨기므로
// User-Agent Client Hints API (getHighEntropyValues) 를 우선 사용
const DEVICE_MAP = [
  { match: 'SM-S921', name: '지수' },   // Galaxy S24 (B/N/U 등 모든 지역 모델)
  { match: 'SM-S918', name: '남식' },   // Galaxy S23 Ultra
]

function matchDevice(model = '', ua = '') {
  for (const { match, name } of DEVICE_MAP) {
    if (model.includes(match) || ua.includes(match)) {
      return { name, isReadOnly: false }
    }
  }
  return { name: '방문자', isReadOnly: true }
}

async function detectUser() {
  // 1순위: User-Agent Client Hints (Chrome 90+, 정확한 모델명 반환)
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { model } = await navigator.userAgentData.getHighEntropyValues(['model'])
      const result = matchDevice(model, '')
      if (!result.isReadOnly) return result
      // 모델이 빈 값이거나 매칭 안 된 경우 UA 폴백으로 진행
    } catch (e) {
      console.warn('UA Client Hints 실패, UA 폴백 사용:', e)
    }
  }

  // 2순위: 전통적인 User-Agent 문자열 파싱 (Samsung Internet, 구버전 Chrome)
  return matchDevice('', navigator.userAgent)
}

export function useUser() {
  // null = 감지 중
  const [user, setUser] = useState({ currentUserName: null, isReadOnly: null })

  useEffect(() => {
    detectUser().then(setUser)
  }, [])

  return user
}
