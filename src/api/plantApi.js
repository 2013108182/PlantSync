// Plant.id API - 사진으로 식물 이름 식별
export async function identifyPlant(imageFile) {
  const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY
  if (!apiKey) throw new Error('Plant.id API 키가 설정되지 않았습니다.')

  // 이미지를 base64로 변환
  const base64 = await fileToBase64(imageFile)
  const base64Data = base64.split(',')[1] // data:image/... 헤더 제거

  const response = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      images: [base64Data],
      plant_details: ['common_names', 'scientific_name'],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Plant.id 오류: ${err}`)
  }

  const data = await response.json()
  const suggestions = data.suggestions || []
  if (suggestions.length === 0) throw new Error('식물을 인식하지 못했습니다.')

  const top = suggestions[0]
  const commonName = top.plant_details?.common_names?.[0] || top.plant_name
  const scientificName = top.plant_details?.scientific_name || top.plant_name

  return {
    commonName,
    scientificName,
    probability: top.probability,
    allSuggestions: suggestions.slice(0, 3).map((s) => ({
      name: s.plant_details?.common_names?.[0] || s.plant_name,
      scientific: s.plant_details?.scientific_name || '',
      probability: s.probability,
    })),
  }
}

// Perenual API - 식물 이름으로 급수 주기 조회
export async function getWateringCycle(plantName) {
  const apiKey = import.meta.env.VITE_PERENUAL_API_KEY
  if (!apiKey) throw new Error('Perenual API 키가 설정되지 않았습니다.')

  const url = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(plantName)}&page=1`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Perenual 오류: ${response.status}`)
  }

  const data = await response.json()
  const results = data.data || []
  if (results.length === 0) return null

  const plant = results[0]
  const wateringText = plant.watering?.toLowerCase() || ''

  // watering 텍스트를 일수로 변환
  const cycleMap = {
    frequent:   3,
    average:    7,
    minimum:   14,
    none:      30,
  }

  const cycle = cycleMap[wateringText] || 7

  return {
    cycle,
    wateringText: plant.watering,
    plantName: plant.common_name || plantName,
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
