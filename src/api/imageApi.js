// ImgBB 무료 이미지 호스팅 (Firebase Storage 대체)
// 업로드 전 Canvas로 자동 압축 → 어떤 폰 카메라 사진도 1MB 이하로 처리

const MAX_SIZE_PX  = 1200   // 최대 가로/세로 픽셀
const JPEG_QUALITY = 0.82   // JPEG 압축률 (0~1)

// 이미지 압축: Canvas로 리사이즈 + JPEG 변환
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // 최대 크기 초과 시 비율 유지하며 축소
      if (width > MAX_SIZE_PX || height > MAX_SIZE_PX) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE_PX) / width)
          width  = MAX_SIZE_PX
        } else {
          width  = Math.round((width * MAX_SIZE_PX) / height)
          height = MAX_SIZE_PX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('이미지 압축 실패'))
          resolve(blob)
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지 로드 실패'))
    }

    img.src = objectUrl
  })
}

// Blob → base64 변환
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ImgBB 업로드 (압축 포함)
export async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY
  if (!apiKey) throw new Error('ImgBB API 키가 설정되지 않았습니다.')

  // 1. 압축
  const compressed = await compressImage(file)

  // 2. base64 변환
  const base64Data = await blobToBase64(compressed)

  // 3. ImgBB 업로드
  const formData = new FormData()
  formData.append('key', apiKey)
  formData.append('image', base64Data)

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`이미지 업로드 실패: ${response.status}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error('이미지 업로드 실패: ' + (data.error?.message || '알 수 없는 오류'))
  }

  return data.data.url
}
