import { useState } from 'react'
import { Droplets, Trash2, Edit3, Clock, User } from 'lucide-react'
import { getDDay, getNextWateringDate } from '../hooks/usePlants'

function formatDate(ts) {
  if (!ts) return '아직 없음'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function DDayBadge({ dday }) {
  if (dday < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
        D+{Math.abs(dday)} 지남
      </span>
    )
  }
  if (dday === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
        오늘 물 주는 날!
      </span>
    )
  }
  if (dday <= 2) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
        D-{dday}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
      D-{dday}
    </span>
  )
}

export default function PlantCard({ plant, currentUserName, onWater, onDelete, onEdit }) {
  const [watering, setWatering] = useState(false)
  const dday = getDDay(plant)
  const isOverdue = dday < 0
  const nextDate  = getNextWateringDate(plant)

  const handleWater = async () => {
    setWatering(true)
    try {
      await onWater(plant.id, currentUserName)
    } finally {
      setWatering(false)
    }
  }

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all duration-200 ${
        isOverdue ? 'border-red-300 shadow-red-100' : 'border-transparent'
      }`}
    >
      {/* 오버듀 경고 배너 */}
      {isOverdue && (
        <div className="bg-red-500 text-white text-center text-xs font-semibold py-1 px-3">
          💧 물 주는 날이 {Math.abs(dday)}일 지났어요!
        </div>
      )}

      <div className="flex gap-3 p-4">
        {/* 식물 이미지 */}
        <div className="flex-shrink-0">
          {plant.imageUrl ? (
            <img
              src={plant.imageUrl}
              alt={plant.nickname}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center text-3xl">
              🌿
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                {plant.nickname}
              </h3>
              {plant.species && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{plant.species}</p>
              )}
            </div>
            <DDayBadge dday={dday} />
          </div>

          {/* 급수 정보 */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} className="text-gray-400" />
              <span>주기: {plant.wateringCycle}일마다</span>
            </div>

            {plant.lastWateredAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <User size={12} className="text-gray-400" />
                <span>
                  <span className="font-semibold text-primary-600">{plant.lastWateredBy}</span>
                  {' '}가 마지막으로 줌 · {formatDate(plant.lastWateredAt)}
                </span>
              </div>
            )}

            {!plant.lastWateredAt && (
              <p className="text-xs text-gray-400 italic">아직 물을 준 기록이 없어요</p>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex items-center gap-2 px-4 pb-4">
        {/* 물 주기 버튼 */}
        <button
          onClick={handleWater}
          disabled={watering}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isOverdue
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          } disabled:opacity-60 disabled:cursor-not-allowed active:scale-95`}
        >
          <Droplets size={16} className={watering ? 'animate-bounce' : ''} />
          {watering ? '기록 중...' : '물 줬어요! 💧'}
        </button>

        {/* 수정 버튼 */}
        <button
          onClick={() => onEdit(plant)}
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95"
          aria-label="수정"
        >
          <Edit3 size={16} />
        </button>

        {/* 삭제 버튼 */}
        <button
          onClick={() => onDelete(plant)}
          className="p-2.5 rounded-xl bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all active:scale-95"
          aria-label="삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
