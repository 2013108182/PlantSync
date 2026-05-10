import { useState } from 'react'
import { Plus, Settings, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import { usePlants, getDDay } from './hooks/usePlants'
import { useUser }            from './hooks/useUser'

import PlantCard          from './components/PlantCard'
import AddPlantModal      from './components/AddPlantModal'
import EditPlantModal     from './components/EditPlantModal'
import SettingsModal      from './components/SettingsModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

// 한국어 이/가 조사: 마지막 글자 받침 있으면 '이가', 없으면 '가'
function josa이가(str) {
  if (!str) return '가'
  const code = str.charCodeAt(str.length - 1)
  if (code < 0xAC00 || code > 0xD7A3) return '가'   // 한글 범위 밖이면 기본 '가'
  return (code - 0xAC00) % 28 > 0 ? '이가' : '가'
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return '밤이 깊었네요'
  if (h < 11) return '좋은 아침이에요'
  if (h < 14) return '좋은 오후예요'
  if (h < 18) return '오후도 화이팅'
  if (h < 22) return '좋은 저녁이에요'
  return '오늘도 수고했어요'
}

export default function App() {
  const { plants, loading, error, addPlant, waterPlant, undoWater, updatePlant, deletePlant } = usePlants()
  const { currentUserName, isReadOnly } = useUser()

  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // 기기 감지 중 (비동기) → 스플래시 표시
  if (isReadOnly === null) {
    return (
      <div className="min-h-screen bg-[#1A3528] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl animate-pulse">🌿</div>
        <p className="text-[#86EFAC] text-sm font-semibold">기기 확인 중...</p>
      </div>
    )
  }

  const overdueCount = plants.filter(p => getDDay(p) < 0).length
  const todayCount   = plants.filter(p => getDDay(p) === 0).length
  const urgentCount  = overdueCount + todayCount

  const handleWater = async (id, name) => {
    if (isReadOnly) return
    // 실행취소를 위해 물 주기 전 상태 스냅샷
    const plant = plants.find(p => p.id === id)
    const prevLastWateredAt = plant?.lastWateredAt ?? null
    const prevLastWateredBy = plant?.lastWateredBy ?? null

    try {
      await waterPlant(id, name)
      // 실행취소 버튼이 담긴 토스트 (5초 유지)
      toast(
        (t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>💧 {name}{josa이가(name)} 물을 줬어요!</span>
            <button
              onClick={async () => {
                toast.dismiss(t.id)
                try {
                  await undoWater(id, prevLastWateredAt, prevLastWateredBy)
                  toast.success('↩️ 실행 취소됐어요', {
                    style: { borderRadius: '14px', fontWeight: 600, fontSize: '14px' },
                  })
                } catch (e) { toast.error('실행 취소 실패: ' + e.message) }
              }}
              style={{
                fontSize: 12, fontWeight: 700, color: '#1A3528',
                background: 'rgba(26,53,40,0.12)', border: 'none',
                borderRadius: 8, padding: '4px 10px', cursor: 'pointer', flexShrink: 0,
              }}
            >
              실행취소
            </button>
          </div>
        ),
        { duration: 5000, style: { borderRadius: '14px', padding: '10px 14px' } }
      )
    } catch (e) { toast.error('오류: ' + e.message) }
  }

  const handleAddSave = async (data) => {
    if (isReadOnly) return
    await addPlant(data)
    toast.success('🌱 새 식물 등록 완료!', { style: { borderRadius: '14px', fontWeight: 600 } })
  }

  const handleEditSave = async (id, data) => {
    if (isReadOnly) return
    await updatePlant(id, data)
    toast.success('✅ 수정 완료!')
  }

  const handleDeleteConfirm = async (plant) => {
    if (isReadOnly) return
    await deletePlant(plant)
    toast.success(`🗑️ ${plant.nickname} 삭제됨`)
  }

  return (
    <div className="min-h-screen bg-[#F2F1EC]">
      <Toaster position="top-center" />

      {/* ── 헤더 ── */}
      <div className="bg-[#1A3528] pb-8 pt-12 px-5 rounded-b-[32px] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-16 -right-4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[#86EFAC] text-xs font-semibold tracking-widest uppercase mb-1">
                🌿 PlantSync
              </p>
              {isReadOnly ? (
                <h1 className="text-white text-2xl font-extrabold leading-tight">
                  우리 집 식물들
                  <span className="ml-2 inline-flex items-center gap-1 text-sm font-semibold
                                   bg-white/10 text-white/50 px-2.5 py-0.5 rounded-full align-middle">
                    <Lock size={11} /> 읽기 전용
                  </span>
                </h1>
              ) : (
                <h1 className="text-white text-2xl font-extrabold leading-tight">
                  {getGreeting()},<br />
                  <span className="text-[#86EFAC]">{currentUserName}</span>님!
                </h1>
              )}
            </div>

            {/* 설정 버튼 — 읽기 전용이면 숨김 */}
            {!isReadOnly && (
              <button onClick={() => setShowSettings(true)}
                      className="glass w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all mt-1">
                <Settings size={18} />
              </button>
            )}
          </div>

          {/* 통계 */}
          {!loading && !error && (
            <div className="flex gap-2 flex-wrap">
              <div className="glass rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
                <span className="text-white/60 text-xs">총</span>
                <span className="text-white font-bold text-sm">{plants.length}그루</span>
              </div>
              {urgentCount > 0 && (
                <div className="rounded-full px-3.5 py-1.5 flex items-center gap-1.5"
                     style={{ background: 'rgba(239,68,68,0.25)' }}>
                  <span className="text-[11px]">🚨</span>
                  <span className="text-red-300 font-bold text-sm">{urgentCount}개 물 시급</span>
                </div>
              )}
              {urgentCount === 0 && plants.length > 0 && (
                <div className="rounded-full px-3.5 py-1.5 flex items-center gap-1.5"
                     style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <span className="text-[11px]">✅</span>
                  <span className="text-green-300 font-bold text-sm">모두 상태 양호</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 컨텐츠 ── */}
      <main className="px-4 pt-5 pb-28 max-w-lg mx-auto">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-4xl animate-pulse">🌿</div>
            <p className="text-[#9CA3AF] text-sm font-medium">식물 불러오는 중...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-2xl p-5 card-shadow text-center mt-4">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-red-500 font-bold text-sm mb-1">Firebase 연결 오류</p>
            <p className="text-[#9CA3AF] text-xs">{error}</p>
          </div>
        )}

        {!loading && !error && plants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-24 h-24 bg-white rounded-3xl card-shadow flex items-center justify-center text-5xl">
              🪴
            </div>
            <div>
              <p className="font-extrabold text-[#1A1A1A] text-lg">등록된 식물이 없어요</p>
              <p className="text-[#9CA3AF] text-sm mt-1">
                {isReadOnly ? '아직 등록된 식물이 없습니다' : '사진을 찍으면 AI가 이름을 찾아드려요'}
              </p>
            </div>
            {!isReadOnly && (
              <button onClick={() => setShowAdd(true)}
                      className="flex items-center gap-2 bg-[#1A3528] text-white font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform">
                <Plus size={18} /> 식물 추가하기
              </button>
            )}
          </div>
        )}

        {!loading && !error && plants.length > 0 && (
          <div className="space-y-3">
            {plants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                currentUserName={currentUserName}
                isReadOnly={isReadOnly}
                onWater={handleWater}
                onEdit={p => setEditTarget(p)}
                onDelete={p => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB — 읽기 전용이면 숨김 */}
      {!isReadOnly && plants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#1A3528] hover:bg-[#2D5A40] text-white font-bold pl-5 pr-6 py-3.5 rounded-full shadow-xl shadow-[#1A3528]/30 transition-all active:scale-95">
            <Plus size={20} /> 식물 추가
          </button>
        </div>
      )}

      {/* 모달 — 읽기 전용이면 열리지 않음 */}
      {!isReadOnly && showAdd      && <AddPlantModal      onClose={() => setShowAdd(false)}      onSave={handleAddSave} />}
      {!isReadOnly && editTarget   && <EditPlantModal     plant={editTarget}   onClose={() => setEditTarget(null)}   onSave={handleEditSave} />}
      {!isReadOnly && deleteTarget && <DeleteConfirmModal plant={del