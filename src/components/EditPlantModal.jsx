import { useState } from 'react'
import { X, Loader } from 'lucide-react'

export default function EditPlantModal({ plant, onClose, onSave }) {
  const [form, setForm] = useState({
    nickname:     plant.nickname || '',
    species:      plant.species  || '',
    wateringCycle: plant.wateringCycle || 7,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!form.nickname.trim()) { setError('별명을 입력해주세요.'); return }
    setSaving(true)
    try {
      await onSave(plant.id, { nickname: form.nickname.trim(), species: form.species.trim(), wateringCycle: Number(form.wateringCycle) || 7 })
      onClose()
    } catch (e) {
      setError(e.message || '저장 실패')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#F2F1EC] rounded-t-[28px] shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[17px] font-extrabold text-[#1A1A1A]">식물 정보 수정</h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{plant.nickname}</p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B7280] card-shadow">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-3">
          <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                식물 별명 *
              </label>
              <input type="text" value={form.nickname}
                     onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                     className="w-full px-4 py-3 bg-[#F2F1EC] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A3528]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                식물 종류
              </label>
              <input type="text" value={form.species}
                     onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                     className="w-full px-4 py-3 bg-[#F2F1EC] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A3528]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                급수 주기
              </label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="60" value={form.wateringCycle}
                       onChange={e => setForm(f => ({ ...f, wateringCycle: e.target.value }))}
                       className="flex-1 accent-[#1A3528]" />
                <div className="flex items-center gap-1.5">
                  <input type="number" min="1" max="365" value={form.wateringCycle}
                         onChange={e => setForm(f => ({ ...f, wateringCycle: e.target.value }))}
                         className="w-14 px-2 py-2 bg-[#F2F1EC] rounded-xl text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1A3528]" />
                  <span className="text-sm text-[#9CA3AF]">일</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-500 text-xs font-medium">{error}</p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A3528] text-white font-bold rounded-2xl text-sm disabled:opacity-50 active:scale-95 transition-transform">
            {saving ? <><Loader size={15} className="animate-spin" /> 저장 중...</> : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
