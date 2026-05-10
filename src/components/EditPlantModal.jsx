import { useState } from 'react'
import { X, Loader, Sparkles } from 'lucide-react'
import { getWateringMethodByName } from '../api/plantApi'

const WATERING_METHODS = [
  { key: '듬뿍',    icon: '🚿', desc: '밑으로 물 빠질 때까지' },
  { key: '겉흙만',  icon: '💧', desc: '겉흙만 촉촉하게' },
  { key: '스프레이', icon: '🌫️', desc: '분무기로 뿌리기' },
  { key: '소량자주', icon: '🫧', desc: '조금씩 자주' },
]

export default function EditPlantModal({ plant, onClose, onSave }) {
  const [form, setForm] = useState({
    nickname:           plant.nickname           || '',
    species:            plant.species            || '',
    wateringCycle:      plant.wateringCycle      || 7,
    wateringMethod:     plant.wateringMethod     || '',
    wateringMethodNote: plant.wateringMethodNote || '',
  })
  const [saving, setSaving]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError]       = useState('')

  // AI로 물 주는 법 자동 조회
  const handleAiMethod = async () => {
    if (!form.nickname.trim()) { setError('별명을 먼저 입력해주세요.'); return }
    setAiLoading(true)
    setError('')
    try {
      const result = await getWateringMethodByName(form.nickname.trim(), form.species.trim())
      setForm(f => ({ ...f, wateringMethod: result.wateringMethod, wateringMethodNote: result.wateringMethodNote }))
    } catch (e) {
      setError(e.message || 'AI 조회 실패')
    } finally { setAiLoading(false) }
  }

  const handleSave = async () => {
    if (!form.nickname.trim()) { setError('별명을 입력해주세요.'); return }
    setSaving(true)
    try {
      await onSave(plant.id, {
        nickname:           form.nickname.trim(),
        species:            form.species.trim(),
        wateringCycle:      Number(form.wateringCycle) || 7,
        wateringMethod:     form.wateringMethod,
        wateringMethodNote: form.wateringMethodNote,
      })
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

            {/* 물 주는 법 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  물 주는 법
                </label>
                <button onClick={handleAiMethod} disabled={aiLoading}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#1A3528] disabled:opacity-50">
                  {aiLoading
                    ? <><Loader size={11} className="animate-spin" /> AI 조회 중...</>
                    : <><Sparkles size={11} /> AI로 알아보기</>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {WATERING_METHODS.map(m => (
                  <button key={m.key}
                          onClick={() => setForm(f => ({
                            ...f,
                            wateringMethod:     f.wateringMethod === m.key ? '' : m.key,
                            wateringMethodNote: f.wateringMethod === m.key ? '' : f.wateringMethodNote,
                          }))}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={form.wateringMethod === m.key
                            ? { background: '#1A3528', color: '#86EFAC' }
                            : { background: '#F2F1EC', color: '#4B5563' }}>
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <p className="text-[12px] font-bold leading-none">{m.key}</p>
                      <p className="text-[10px] mt-0.5 opacity-70">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {form.wateringMethodNote && (
                <p className="text-[11px] text-[#6B7280] mt-1.5 italic">{form.wateringMethodNote}</p>
              )}
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
