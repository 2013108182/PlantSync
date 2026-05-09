// 기기 User-Agent로 사용자 자동 감지
// 갤럭시 S24 (SM-S921) → 지수 / 갤럭시 S23 Ultra (SM-S918) → 남식
// 그 외 기기 → 읽기 전용 (isReadOnly: true)

const DEVICE_MAP = [
  { match: 'SM-S921', name: '지수' },   // Galaxy S24
  { match: 'SM-S918', name: '남식' },   // Galaxy S23 Ultra
]

function detectUser() {
  const ua = navigator.userAgent
  for (const { match, name } of DEVICE_MAP) {
    if (ua.includes(match)) return { name, isReadOnly: false }
  }
  return { name: '방문자', isReadOnly: true }
}

export function useUser() {
  const { name: currentUserName, isReadOnly } = detectUser()
  return { currentUserName, isReadOnly }
}
