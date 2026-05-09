import { useState } from 'react'
import { Plus, Droplets, AlertTriangle, Leaf } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

import { usePlants, getDDay } from './hooks/usePlants'
import { useUser } from './hooks/useUser'

import UserToggle       from './components/UserToggle'
import PlantCard        from './components/PlantCard'
import AddPlantModal    from './components/AddPlantModal'
import EditPlantModal   from './components/EditPlantModal'
import SettingsModal    from './components/SettingsModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

export default function App() {
  const { plants, loading, error, addPlant, waterPlant, updatePlant, deletePlant } = usePlants()
  const { activeUser, currentUserName, userNames, toggleUser, updateUserNames } = useUser()

  const [showAdd, setShowAdd]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // 급수 완료 처리
  const handleWater = async (plantId, userName) => {
    try {
      await waterPlant(plantId, userName)
      toast.success(`💧 ${userName}이(가) 물을 줬어요!`, { duration: 2500 })
    } catch (e) {
      toast.error('저장 실패: ' + e.message)
    }
  }

  // 식물 추가
  const handleAddSave = async (data) => {
    await addPlant(data)
    toast.success('🌱 새 식물이 등록됐어요!')
  }

  // 식물 수정
  const handleEditSave = async (id, data) => {
    await updatePlant(id, data)
    toast.success('✅ 식물 정보가 수정됐어요!')
  }

  // 식물 삭제
  const handleDeleteConfirm = async (plant) => {
    await deletePlant(plant)
    toast.success(`🗑️ ${plant.nickname}이(가) 삭제됐어요.`)
  }

  // 요약 통계
  const overdueCount = plants.filter((p) => getDDay(p) < 0).length
  const todayCount   = plants.filter((p) => getDDay(p) === 0).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '14px' },
        }}
      />

      {/* 헤더 */}
      <header className="bg-gradient-to-br from-primary-600 to-primary-700 text-white px-4 pt-12 pb-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">🌿 PlantSync</h1>
              <p className="text-primary-200 text-sm mt-0.5">우리 집 식물 관리</p>
            </div>
            <UserToggle
              activeUser={activeUser}
              currentUserName={currentUserName}
              userNames={userNames}
              onToggle={toggleUser}
              onSettingsOpen={() => setShowSettings(true)}
            />
          </div>

          {/* 요약 배지 */}
          {(overdueCount > 0 || todayCount > 0) && (
            <div className="flex gap-2 flex-wrap">
              {overdueCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <AlertTriangle size={12} />
                  {overdueCount}개 물 주는 날 지남
                </div>
              )}
              {todayCount > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-400/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Droplets size={12} />
                  오늘 {todayCount}개 물 주는 날
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Leaf size={36} className="animate-pulse text-primary-400" />
            <p className="text-sm">식물 불러오는 중...</p>
          </div>
        )}

        {/* Firebase 에러 */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-600 font-semibold text-sm mb-1">Firebase 연결 오류</p>
            <p className="text-red-400 text-xs">{error}</p>
            <p className="text-gray-500 text-xs mt-2">
              <code className="bg-gray-100 px-1 rounded">.env</code> 파일의 Firebase 설정을 확인해주세요.
            </p>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && !error && plants.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="text-6xl">🪴</div>
            <div>
              <p className="font-bold text-gray-700 text-lg">아직 식물이 없어요</p>
              <p className="text-gray-400 text-sm mt-1">
                아래 + 버튼을 눌러 첫 번째 식물을 등록해보세요!
              </p>
            </div>
          </div>
        )}

        {/* 식물 카드 목록 */}
        {!loading && !error && plants.length > 0 && (
          <div className="space-y-3">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                currentUserName={currentUserName}
                onWater={handleWater}
                onEdit={(p) => setEditTarget(p)}
                onDelete={(p) => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 식물 추가 FAB */}
      <div className="fixed bottom-6 right-4 sm:right-[max(1rem,calc(50%-22rem))]">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-95"
        >
          <Plus size={20} />
          식물 추가
        </button>
      </div>

      {/* 모달들 */}
      {showAdd && (
        <AddPlantModal
          onClose={() => setShowAdd(false)}
          onSave={handleAddSave}
        />
      )}

      {editTarget && (
        <EditPlantModal
          plant={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          plant={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {showSettings && (
        <SettingsModal
          userNames={userNames}
          onClose={() => setShowSettings(false)}
          onSave={updateUserNames}
        />
      )}
    </div>
  )
}
