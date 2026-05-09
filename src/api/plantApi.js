// Plant.id API - 사진으로 식물 이름 식별
export async function identifyPlant(imageFile) {
  const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY
  if (!apiKey) throw new Error('Plant.id API 키가 설정되지 않았습니다.')

  const base64 = await fileToBase64(imageFile)
  const base64Data = base64.split(',')[1]

  const response = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
    body: JSON.stringify({
      images: [base64Data],
      plant_details: ['common_names', 'scientific_name'],
    }),
  })

  if (!response.ok) throw new Error(`Plant.id 오류: ${await response.text()}`)

  const data = await response.json()
  const suggestions = data.suggestions || []
  if (suggestions.length === 0) throw new Error('식물을 인식하지 못했습니다.')

  // 상위 3개 후보 영문 이름 수집
  const topSuggestions = suggestions.slice(0, 3).map(s => ({
    nameEn:     s.plant_details?.common_names?.[0] || s.plant_name,
    scientific: s.plant_details?.scientific_name || s.plant_name,
    probability: s.probability,
  }))

  // 모든 후보 영문 이름을 한 번에 번역 (API 호출 최소화)
  const allEnNames = topSuggestions.map(s => s.nameEn)
  const translatedNames = await translateBatch(allEnNames)

  const allSuggestions = topSuggestions.map((s, i) => ({
    name:       translatedNames[i] || s.nameEn,
    scientific: s.scientific,
    probability: s.probability,
  }))

  return {
    commonName:    allSuggestions[0].name,
    scientificName: allSuggestions[0].scientific,
    probability:   allSuggestions[0].probability,
    allSuggestions,
  }
}

// 영어 이름 배열을 한국어로 번역 (MyMemory 무료 API, 키 불필요)
async function translateBatch(names) {
  const results = await Promise.allSettled(
    names.map(name => translateToKorean(name))
  )
  return results.map((r, i) =>
    r.status === 'fulfilled' && r.value ? r.value : names[i]
  )
}

async function translateToKorean(text) {
  if (!text) return text
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`
    const res  = await fetch(url)
    const data = await res.json()
    const translated = data?.responseData?.translatedText
    // 번역 결과가 영어 그대로거나 너무 짧으면 원문 반환
    if (!translated || translated.toLowerCase() === text.toLowerCase()) return text
    return translated
  } catch {
    return text  // 번역 실패 시 영문 원본 유지
  }
}

// Perenual API - 학명/영문 이름으로 급수 주기 직접 검색
// 예: "Monstera deliciosa", "Pothos", "Cactus"
export async function getWateringCycle(scientificOrEnglishName) {
  const apiKey = import.meta.env.VITE_PERENUAL_API_KEY
  if (!apiKey) throw new Error('Perenual API 키가 설정되지 않았습니다.')

  const url = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(scientificOrEnglishName)}&page=1`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Perenual 오류: ${response.status}`)

  const data = await response.json()
  const results = data.data || []
  if (results.length === 0) return null

  const plant = results[0]

  const cycleMap    = { frequent: 3, average: 7, minimum: 14, none: 30 }
  const cycleKorMap = { frequent: '자주 (3일)', average: '보통 (7일)', minimum: '적게 (14일)', none: '거의 안 줌 (30일)' }
  const key         = plant.watering?.toLowerCase() || ''
  const cycle       = cycleMap[key] || 7
  const cycleLabel  = cycleKorMap[key] || `${cycle}일`

  return {
    cycle,
    cycleLabel,                              // UI 표시용 한국어 레이블
    matchedName: plant.common_name || scientificOrEnglishName,  // 매칭된 식물명
  }
}

// 헬퍼: File → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
