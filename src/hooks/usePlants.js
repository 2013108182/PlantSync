import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'
import { uploadToImgBB } from '../api/imageApi'

// 계절 보정 multiplier (한국 계절 기준)
// 여름(6~8월): 0.8배 — 증발 빠름, 겨울(12~2월): 1.5배 — 휴면기 과습 주의
export const getSeasonalMultiplier = () => {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 8)  return 0.8
  if (month >= 12 || month <= 2) return 1.5
  return 1.0
}

// 다음 급수일 계산 (lastWateredAt + wateringCycle × 계절 보정)
export const getNextWateringDate = (plant) => {
  if (!plant.lastWateredAt) return null
  const last = plant.lastWateredAt.toDate ? plant.lastWateredAt.toDate() : new Date(plant.lastWateredAt)
  const next = new Date(last)
  const adjustedCycle = Math.max(1, Math.round((plant.wateringCycle || 7) * getSeasonalMultiplier()))
  next.setDate(next.getDate() + adjustedCycle)
  return next
}

// D-Day 계산 (음수면 overdue, null이면 기록없음)
// 양쪽을 자정 기준으로 정규화해서 시간대 오차 없이 순수 날짜 차이만 계산
export const getDDay = (plant) => {
  const next = getNextWateringDate(plant)
  if (!next) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  return Math.round((next - today) / (1000 * 60 * 60 * 24))
}

// 정렬용 D-Day (null은 맨 뒤에, 연체 → 오늘 → 여유 순)
export const getSortKey = (plant) => {
  const dday = getDDay(plant)
  if (dday === null) return 99999
  return dday
}

export function usePlants() {
  const [plants, setPlants]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'plants'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => getSortKey(a) - getSortKey(b))
        setPlants(data)
        setLoading(false)
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err)
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // 식물 추가
  const addPlant = async ({ nickname, species, imageFile, wateringCycle, lastWateredAt, wateringMethod, wateringMethodNote }) => {
    let imageUrl = ''
    if (imageFile) {
      imageUrl = await uploadToImgBB(imageFile)
    }
    const wateredTimestamp = lastWateredAt ? Timestamp.fromDate(new Date(lastWateredAt)) : null
    await addDoc(collection(db, 'plants'), {
      nickname,
      species,
      imageUrl,
      wateringCycle:      Number(wateringCycle) || 7,
      lastWateredAt:      wateredTimestamp,
      lastWateredBy:      null,
      wateringMethod:     wateringMethod     || '',
      wateringMethodNote: wateringMethodNote || '',
      createdAt:          serverTimestamp(),
    })
  }

  // 급수 완료
  const waterPlant = async (plantId, userName) => {
    const plantRef = doc(db, 'plants', plantId)
    await updateDoc(plantRef, {
      lastWateredAt: serverTimestamp(),
      lastWateredBy: userName,
    })
  }

  // 급수 실행취소 — 이전 lastWateredAt / lastWateredBy 복원
  const undoWater = async (plantId, prevLastWateredAt, prevLastWateredBy) => {
    const plantRef = doc(db, 'plants', plantId)
    await updateDoc(plantRef, {
      lastWateredAt: prevLastWateredAt ?? null,
      lastWateredBy: prevLastWateredBy ?? null,
    })
  }

  // 식물 정보 수정
  const updatePlant = async (plantId, updates) => {
    const plantRef = doc(db, 'plants', plantId)
    await updateDoc(plantRef, updates)
  }

  // 식물 삭제 (ImgBB는 API로 삭제 불가 → Firestore 문서만 삭제)
  const deletePlant = async (plant) => {
    await deleteDoc(doc(db, 'plants', plant.id))
  }

  return { plants, loading, error, addPlant, waterPlant, undoWater, updatePlant, deletePlant }
}
