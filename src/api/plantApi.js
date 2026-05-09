// Gemini 1.5 Flash — 식물 인식 + 급수 주기 통합 API
// 거실 창가 환경 + 현재 계절을 반영한 한국어 결과 반환

import { GoogleGenerativeAI } from '@google/generative-ai'

// Blob/File → base64 (data URL 헤더 제거)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 현재 월 기반 계절 컨텍스트 (한국 계절 기준)
function getSeasonContext() {
  const month = new Date().getMonth() + 1  // 1~12
  if (month >= 6 && month <= 8)  return `여름 (${month}월) — 고온다습, 햇빛 강함, 증산 왕성`
  if (month >= 12 || month <= 2) return `겨울 (${month}월) — 저온건조, 햇빛 약함, 휴면기`
  if (month >= 3 && month <= 5)  return `봄 (${month}월) — 성장기 시작, 기온 상승`
  return `가을 (${month}월) — 성장 둔화, 기온 하강`
}

/**
 * 식물 사진을 Gemini 1.5 Flash로 분석
 * 반환값:
 *   koreanName    — 한국어 일반명 (예: "몬스테라 델리시오사")
 *   scientificName — 학명 (예: "Monstera deliciosa")
 *   wateringCycle — 숫자(일), 계절 보정 적용
 *   cycleBasis    — 보정 근거 한 줄
 *   careNote      — 거실 창가 관리 팁 한 줄
 *   suggestions   — [{ name, scientific, probability }]
 */
export async function identifyAndGetCycle(imageFile) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다.')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const base64   = await fileToBase64(imageFile)
  const mimeType = imageFile.type || 'image/jpeg'
  const seasonCtx = getSeasonContext()

  const prompt = `당신은 식물 전문가입니다. 아래 조건에 맞게 이미지 속 식물을 분석해주세요.

[환경 조건]
- 위치: 거실 창가 (간접광, 실내)
- 현재 계절: ${seasonCtx}

[요청 사항]
1. 사진 속 식물을 가능성 높은 순서로 3가지 식별해주세요.
2. 1순위 식물의 거실 창가 환경 기준 급수 주기(일)를 계절 보정하여 계산해주세요.
   - 여름(6~8월): 기본 주기 × 0.8 반올림
   - 겨울(12~2월): 기본 주기 × 1.5 반올림
   - 봄/가을: 기본 주기 × 1.0
3. 모든 이름과 설명은 한국어로 작성해주세요.
4. 아래 JSON 형식으로만 응답하세요. 코드블록이나 추가 설명 없이 순수 JSON만 반환하세요.

{
  "best": {
    "koreanName": "한국어 일반명",
    "scientificName": "학명",
    "wateringCycle": 7,
    "cycleBasis": "기본 7일 기준, 계절 보정 없음 (봄/가을)",
    "careNote": "거실 창가 관리 핵심 팁 한 줄"
  },
  "suggestions": [
    { "name": "한국어 이름", "scientific": "학명", "probability": 0.92 },
    { "name": "한국어 이름", "scientific": "학명", "probability": 0.05 },
    { "name": "한국어 이름", "scientific": "학명", "probability": 0.03 }
  ]
}`

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64 } },
  ])

  const text = result.response.text().trim()

  // ```json 블록이 붙어 오는 경우 제거
  const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('식물 인식 결과를 처리할 수 없어요. 다시 시도해주세요.')
  }

  const best = parsed.best || {}
  return {
    koreanName:     best.koreanName     || '알 수 없는 식물',
    scientificName: best.scientificName || '',
    wateringCycle:  Math.max(1, Math.round(Number(best.wateringCycle) || 7)),
    cycleBasis:     best.cycleBasis     || '',
    careNote:       best.careNote       || '',
    suggestions: (parsed.suggestions || []).map(s => ({
      name:        s.name        || '',
      scientific:  s.scientific  || '',
      probability: Number(s.probability) || 0,
    })),
  }
}
