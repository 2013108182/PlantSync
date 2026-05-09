import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
} from 'firebase/firestore'
import { db } from '../firebase'
import { uploadToImgBB } from '../api/imageApi'

// 다음 급수일 계산 (lastWateredAt + wateringCycle)
export const getNextWateringDate = (plant) => {
  if (!plant.lastWateredAt) return new Date(0) // 한 번도 안 준 경우 → 가장 급함
  const last = plant.lastWateredAt.toDate ? plant.lastWateredAt.toDate() : new Date(plant.lastWateredAt)
  const next = new Date(last)
  next.setDate(next.getDate() + (plant.wateringCycle || 7))
  return next
}

// D-Day 계산 (음수면 overdue)
export const getDDay = (plant) => {
  const next = getNextWateringDate(plant)
  const now  = new Date()
  const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24))
  return diff
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
        // D-Day 기준 오름차순 정렬 (급한 순)
        data.sort((a, b) => getDDay(a) - getDDay(b))
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
  const addPlant = async ({ nickname, species, imageFile, wateringCycle }) => {
    let imageUrl = ''
    if (imageFile) {
      imageUrl = await uploadToImgBB(imageFile)
    }
    await addDoc(collection(db, 'plants'), {
      nickname,
      species,
      imageUrl,
      wateringCycle: Number(wateringCycle) || 7,
      lastWateredAt: null,
      lastWateredBy: null,
      createdAt: serverTimestamp(),
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

  // 식물 정보 수정
  const updatePlant = async (plantId, updates) => {
    const plantRef = doc(db, 'plants', plantId)
    await updateDoc(plantRef, updates)
  }

  // 식물 삭제 (ImgBB는 API로 삭제 불가 → Firestore 문서만 삭제)
  const deletePlant = async (plant) => {
    await deleteDoc(doc(db, 'plants', plant.id))
  }

  return { plants, loading, error, addPlant, waterPlant, updatePlant, deletePlant }
}
