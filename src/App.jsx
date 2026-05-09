import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import { usePlants, getDDay } from './hooks/usePlants'
import { useUser }            from './hooks/useUser'

import PlantCard          from './components/PlantCard'
import AddPlantModal      from './components/AddPlantModal'
import EditPlantModal     from './components/EditPlantModal'
import SettingsModal      from './components/SettingsModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import NameSelectModal    from './components/NameSelectModal'

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
  const { plants, loading, error, addPlant, waterPlant, updatePlant, deletePlant } = usePlants()
  const { currentUserName, isDeviceDetected, setName } = useUser()

  const [showAdd, setShowAdd]           = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // 이름이 없으면 선택 화면 먼저
  if (!currentUserName) {
    return <NameSelectModal onSelect={setName} />
  }

  const overdueCount = plants.filter(p => getDDay(p) < 0).length
  const todayCount   = plants.filter(p => getDDay(p) === 0).length
  const urgentCount  = overdueCount + todayCount

  const handleWater = async (id, name) => {
    try {
      await waterPlant(id, name)
      toast.success(`💧 ${name}이(가) 물을 줬어요!`, {
        style: { borderRadius: '14px', fontWeight: 600, fontSize: '14px' },
      })
    } catch (e) { toast.error('오류: ' + e.message) }
  }

  const handleAddSave = async (data) => {
    await addPlant(data)
    toast.success('🌱 새 식물 등록 완료!', {
      style: { borderRadius: '14px', fontWeight: 600 },
    })
  }

  const handleEditSave = async (id, data) => {
    await updatePlant(id, data)
    toast.success('✅ 수정 완료!')
  }

  const handleDeleteConfirm = async (plant) => {
    await deletePlant(plant)
    toast.success(`🗑️ ${plant.nickname} 삭제됨`)
  }

  return (
    <div className="min-h-screen bg-[#F2F1EC]">
      <Toaster position="top-center" />

      {/* ── 헤더 ── */}
      <div className="bg-[#1A3528] pb-8 pt-12 px-5 rounded-b-[32px] relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-16 -right-4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[#86EFAC] text-xs font-semibold tracking-widest uppercase mb-1">
                🌿 PlantSync
              </p>
              <h1 className="text-white text-2xl font-extrabold leading-tight">
                {getGreeting()},<br />
                <span className="text-[#86EFAC]">{currentUserName}</span>님!
              </h1>
            </div>

            {/* 설정 버튼만 */}
            <button onClick={() => setShowSettings(true)}
                    className="glass w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all mt-1">
              <Settings size={18} />
            </button>
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
              <p className="font-extrabold text-[#1A1A1A] text-lg">첫 번째 식물을 추가해요</p>
              <p className="text-[#9CA3AF] text-sm mt-1">사진을 찍으면 AI가 이름을 찾아드려요</p>
            </div>
            <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-[#1A3528] text-white font-bold px-6 py-3 rounded-2xl text-sm active:scale-95 transition-transform">
              <Plus size={18} /> 식물 추가하기
            </button>
          </div>
        )}

        {!loading && !error && plants.length > 0 && (
          <div className="space-y-3">
            {plants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                currentUserName={currentUserName}
                onWater={handleWater}
                onEdit={p => setEditTarget(p)}
                onDelete={p => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FAB ── */}
      {plants.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-[#1A3528] hover:bg-[#2D5A40] text-white font-bold pl-5 pr-6 py-3.5 rounded-full shadow-xl shadow-[#1A3528]/30 transition-all active:scale-95">
            <Plus size={20} />
            식물 추가
          </button>
        </div>
      )}

      {/* ── 모달 ── */}
      {showAdd      && <AddPlantModal      onClose={() => setShowAdd(false)}      onSave={handleAddSave} />}
      {editTarget   && <EditPlantModal     plant={editTarget}   onClose={() => setEditTarget(null)}   onSave={handleEditSave} />}
      {deleteTarget && <DeleteConfirmModal plant={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />}
      {showSettings && (
        <SettingsModal
          currentUserName={currentUserName}
          isDeviceDetected={isDeviceDetected}
          onClose={() => setShowSettings(false)}
          onChangeName={setName}
        />
      )}
    </div>
  )
}
