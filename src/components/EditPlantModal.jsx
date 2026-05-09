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
    if (!form.nickname.trim()) {
      setError('별명을 입력해주세요.')
      return
    }
    setSaving(true)
    try {
      await onSave(plant.id, {
        nickname:     form.nickname.trim(),
        species:      form.species.trim(),
        wateringCycle: Number(form.wateringCycle) || 7,
      })
      onClose()
    } catch (e) {
      setError(e.message || '저장 실패')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">✏️ 식물 정보 수정</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              식물 별명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">식물 종류</label>
            <input
              type="text"
              value={form.species}
              onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">급수 주기 (일)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="60"
                value={form.wateringCycle}
                onChange={(e) => setForm((f) => ({ ...f, wateringCycle: e.target.value }))}
                className="flex-1 accent-primary-500"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.wateringCycle}
                  onChange={(e) => setForm((f) => ({ ...f, wateringCycle: e.target.value }))}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <span className="text-sm text-gray-500">일</span>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              {saving ? <><Loader size={16} className="animate-spin" /> 저장 중...</> : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
