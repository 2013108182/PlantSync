// Gemini 1.5 Flash — 식물 인식 + 급수 주기 통합 API
// 거실 창가 환경 + 현재 계절을 반영한 한국어 결과 반환

import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * 식물 이름(+학명)만으로 물 주는 방식을 Gemini에게 물어보는 함수
 * 기존 등록 식물에 wateringMethod가 없을 때 사용
 */
export async function getWateringMethodByName(nickname, species = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다.')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const plantDesc = species ? nickname + ' (' + species + ')' : nickname

  const lines = [
    '당신은 식물 전문가입니다. "' + plantDesc + '" 식물의 실내 거실 창가 환경 기준 물 주는 방식을 알려주세요.',
    '',
    '아래 4가지 중 정확히 하나만 골라 wateringMethod에 넣어주세요.',
    '- "듬뿍" : 화분 밑으로 물이 빠질 때까지 충분히 준다',
    '- "겉흙만" : 겉흙이 살짝 촉촉해질 정도만 준다',
    '- "스프레이" : 분무기로 잎과 표면에 뿌린다',
    '- "소량자주" : 적은 양을 조금씩 자주 준다',
    '',
    'wateringMethodNote에는 이 선택의 이유를 한 줄(30자 이내)로 작성해주세요.',
    '코드블록 없이 순수 JSON만 반환하세요.',
    '',
    '{ "wateringMethod": "듬뿍", "wateringMethodNote": "이유 한 줄" }',
  ]
  const prompt = lines.join('\n')

  const result = await model.generateContent(prompt)
  const text   = result.response.text().trim()
  const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed
  try { parsed = JSON.parse(jsonStr) }
  catch { throw new Error('AI 응답을 처리할 수 없어요. 다시 시도해주세요.') }

  return {
    wateringMethod:     parsed.wateringMethod     || '',
    wateringMethodNote: parsed.wateringMethodNote || '',
  }
}

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
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 8)  return '여름 (' + month + '월) — 고온다습, 햇빛 강함, 증산 왕성'
  if (month >= 12 || month <= 2) return '겨울 (' + month + '월) — 저온건조, 햇빛 약함, 휴면기'
  if (month >= 3 && month <= 5)  return '봄 (' + month + '월) — 성장기 시작, 기온 상승'
  return '가을 (' + month + '월) — 성장 둔화, 기온 하강'
}

/**
 * 식물 사진을 Gemini 1.5 Flash로 분석
 * 반환값: koreanName, scientificName, wateringCycle, cycleBasis,
 *         careNote, wateringMethod, wateringMethodNote, suggestions
 */
export async function identifyAndGetCycle(imageFile) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API 키가 설정되지 않았습니다.')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const base64    = await fileToBase64(imageFile)
  const mimeType  = imageFile.type || 'image/jpeg'
  const seasonCtx = getSeasonContext()

  const promptLines = [
    '당신은 식물 전문가입니다. 아래 조건에 맞게 이미지 속 식물을 분석해주세요.',
    '',
    '[환경 조건]',
    '- 위치: 거실 창가 (간접광, 실내)',
    '- 현재 계절: ' + seasonCtx,
    '',
    '[요청 사항]',
    '1. 사진 속 식물을 가능성 높은 순서로 3가지 식별해주세요.',
    '2. 1순위 식물의 거실 창가 환경 기준 급수 주기(일)를 계절 보정하여 계산해주세요.',
    '   - 여름(6~8월): 기본 주기 x 0.8 반올림',
    '   - 겨울(12~2월): 기본 주기 x 1.5 반올림',
    '   - 봄/가을: 기본 주기 x 1.0',
    '3. 이 식물에 가장 알맞은 물 주는 방식을 아래 4가지 중 정확히 하나만 골라 wateringMethod에 넣어주세요.',
    '   - "듬뿍" : 화분 밑으로 물이 빠질 때까지 충분히 준다 (배수 좋은 식물)',
    '   - "겉흙만" : 겉흙이 살짝 촉촉해질 정도만 준다 (과습에 약한 식물)',
    '   - "스프레이" : 분무기로 잎과 표면에 뿌린다 (착생란, 이끼류 등)',
    '   - "소량자주" : 적은 양을 조금씩 자주 준다 (건조에 민감한 식물)',
    '   wateringMethodNote에는 이 식물에 대한 물 주기 방식 이유를 한 줄로 설명해주세요.',
    '4. 모든 이름과 설명은 한국어로 작성해주세요.',
    '5. 아래 JSON 형식으로만 응답하세요. 코드블록이나 추가 설명 없이 순수 JSON만 반환하세요.',
    '',
    '{',
    '  "best": {',
    '    "koreanName": "한국어 일반명",',
    '    "scientificName": "학명",',
    '    "wateringCycle": 7,',
    '    "cycleBasis": "기본 7일 기준, 계절 보정 없음 (봄/가을)",',
    '    "careNote": "거실 창가 관리 핵심 팁 한 줄",',
    '    "wateringMethod": "듬뿍",',
    '    "wateringMethodNote": "이 식물에 물 주는 방식 이유 한 줄"',
    '  },',
    '  "suggestions": [',
    '    { "name": "한국어 이름", "scientific": "학명", "probability": 0.92 },',
    '    { "name": "한국어 이름", "scientific": "학명", "probability": 0.05 },',
    '    { "name": "한국어 이름", "scientific": "학명", "probability": 0.03 }',
    '  ]',
    '}',
  ]
  const prompt = promptLines.join('\n')

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64 } },
  ])

  const text    = result.response.text().trim()
  const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('식물 인식 결과를 처리할 수 없어요. 다시 시도해주세요.')
  }

  const best = parsed.best || {}
  return {
    koreanName:          best.koreanName          || '알 수 없는 식물',
    scientificName:      best.scientificName      || '',
    wateringCycle:       Math.max(1, Math.round(Number(best.wateringCycle) || 7)),
    cycleBasis:          best.cycleBasis          || '',
    careNote:            best.careNote            || '',
    wateringMethod:      best.wateringMethod      || '',
    wateringMethodNote:  best.wateringMethodNote  || '',
    suggestions: (parsed.suggestions || []).map(s => ({
      name:        s.name        || '',
      scientific:  s.scientific  || '',
      probability: Number(s.probability) || 0,
    })),
  }
}
