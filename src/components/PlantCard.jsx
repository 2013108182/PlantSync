import { useState } from 'react'
import { Droplets, Trash2, Edit3, Lock } from 'lucide-react'
import { getDDay } from '../hooks/usePlants'

function urgencyStyle(dday) {
  if (dday < 0)   return { bar: '#EF4444', badge: '#FEE2E2', badgeText: '#B91C1C', dayText: '#EF4444', label: `+${Math.abs(dday)}일 지남` }
  if (dday === 0) return { bar: '#F97316', badge: '#FFEDD5', badgeText: '#C2410C', dayText: '#F97316', label: '오늘!' }
  if (dday <= 3)  return { bar: '#EAB308', badge: '#FEF9C3', badgeText: '#A16207', dayText: '#CA8A04', label: '곧 줘야해요' }
  return                 { bar: '#22C55E', badge: '#DCFCE7', badgeText: '#15803D', dayText: '#16A34A', label: '상태 양호' }
}

function timeAgo(ts) {
  if (!ts) return null
  const d    = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 86400000)
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  return `${diff}일 전`
}

export default function PlantCard({ plant, currentUserName, isReadOnly, onWater, onDelete, onEdit }) {
  const [watering, setWatering] = useState(false)
  const dday  = getDDay(plant)
  const style = urgencyStyle(dday)
  const ddayLabel = dday < 0 ? `D+${Math.abs(dday)}` : dday === 0 ? 'D-Day' : `D-${dday}`

  const handleWater = async () => {
    setWatering(true)
    try { await onWater(plant.id, currentUserName) }
    finally { setWatering(false) }
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden transition-all duration-200 active:scale-[0.99]"
         style={{ borderLeft: `4px solid ${style.bar}` }}>
      <div className="p-4">
        <div className="flex gap-3">
          {/* 식물 이미지 */}
          <div className="flex-shrink-0">
            {plant.imageUrl ? (
              <img src={plant.imageUrl} alt={plant.nickname}
                   className="w-[68px] h-[68px] rounded-xl object-cover" />
            ) : (
              <div className="w-[68px] h-[68px] rounded-xl flex items-center justify-center text-3xl"
                   style={{ background: style.badge }}>
                🌿
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-[#1A1A1A] text-[15px] leading-snug truncate">
                  {plant.nickname}
                </p>
                {plant.species && (
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{plant.species}</p>
                )}
              </div>

              {/* D-Day */}
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <span className="text-2xl font-extrabold tabular leading-none"
                      style={{ color: style.dayText }}>
                  {ddayLabel}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: style.badge, color: style.badgeText }}>
                  {style.label}
                </span>
              </div>
            </div>

            {/* 메타 */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-[#9CA3AF]">💧 {plant.wateringCycle}일마다</span>
                {plant.lastWateredAt ? (
                  <span className="text-[11px] text-[#6B7280]">
                    <span className="font-semibold text-[#4B5563]">{plant.lastWateredBy}</span>
                    {'가 '}{timeAgo(plant.lastWateredAt)} 물 줌
                  </span>
                ) : (
                  <span className="text-[11px] text-[#D1D5DB] italic">물 준 기록 없음</span>
                )}
              </div>

              {/* 수정/삭제 — 읽기 전용이면 숨김 */}
              {!isReadOnly && (
                <div className="flex gap-1">
                  <button onClick={() => onEdit(plant)}
                          className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => onDelete(plant)}
                          className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 물주기 버튼 — 읽기 전용이면 잠금 표시 */}
      {isReadOnly ? (
        <div className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-[#C4C4C4]"
             style={{ background: '#F9F9F9' }}>
          <Lock size={13} />
          읽기 전용
        </div>
      ) : (
        <button onClick={handleWater} disabled={watering}
                className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-[13px] transition-all duration-200 disabled:opacity-60 active:brightness-95"
                style={{ background: style.badge, color: style.badgeText }}>
          <Droplets size={15} className={watering ? 'animate-bounce' : ''} />
          {watering ? '기록 중...' : '물 줬어요 💧'}
        </button>
      )}
    </div>
  )
}
