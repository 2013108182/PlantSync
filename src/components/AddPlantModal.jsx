import { useState, useRef } from 'react'
import { X, Camera, Loader, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { identifyPlant, getWateringCycle } from '../api/plantApi'

const STEPS = { UPLOAD: 'upload', IDENTIFYING: 'identifying', CONFIRM: 'confirm', SAVING: 'saving' }

export default function AddPlantModal({ onClose, onSave }) {
  const [step, setStep]                   = useState(STEPS.UPLOAD)
  const [imageFile, setImageFile]         = useState(null)
  const [imagePreview, setImagePreview]   = useState(null)
  const [suggestions, setSuggestions]     = useState([])
  const [showAllSug, setShowAllSug]       = useState(false)
  const [form, setForm]                   = useState({ nickname: '', species: '', wateringCycle: 7 })
  const [error, setError]                 = useState('')
  const fileInputRef                      = useRef()

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleIdentify = async () => {
    if (!imageFile) { setError('사진을 먼저 선택해주세요.'); return }
    setStep(STEPS.IDENTIFYING)
    setError('')
    try {
      const result = await identifyPlant(imageFile)
      setSuggestions(result.allSuggestions || [])
      let cycle = 7
      try {
        const w = await getWateringCycle(result.commonName)
        if (w?.cycle) cycle = w.cycle
      } catch {}
      setForm({ nickname: result.commonName, species: result.scientificName, wateringCycle: cycle })
      setStep(STEPS.CONFIRM)
    } catch (e) {
      setError(e.message || '식물 인식 실패. API 키를 확인해주세요.')
      setStep(STEPS.UPLOAD)
    }
  }

  const selectSuggestion = async (s) => {
    setForm(f => ({ ...f, nickname: s.name, species: s.scientific }))
    try {
      const w = await getWateringCycle(s.name)
      if (w?.cycle) setForm(f => ({ ...f, wateringCycle: w.cycle }))
    } catch {}
  }

  const handleSave = async () => {
    if (!form.nickname.trim()) { setError('식물 이름을 입력해주세요.'); return }
    setStep(STEPS.SAVING)
    try {
      await onSave({ nickname: form.nickname.trim(), species: form.species.trim(), imageFile, wateringCycle: Number(form.wateringCycle) || 7 })
      onClose()
    } catch (e) {
      setError(e.message || '저장 실패')
      setStep(STEPS.CONFIRM)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#F2F1EC] rounded-t-[28px] shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[17px] font-extrabold text-[#1A1A1A]">새 식물 등록</h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              {step === STEPS.UPLOAD || step === STEPS.IDENTIFYING ? 'AI가 식물을 인식해드려요' : '정보를 확인하고 수정해주세요'}
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B7280] card-shadow">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-4">

          {/* STEP 1: 사진 업로드 */}
          {(step === STEPS.UPLOAD || step === STEPS.IDENTIFYING) && (
            <>
              <div onClick={() => fileInputRef.current?.click()}
                   className="relative rounded-2xl overflow-hidden cursor-pointer bg-white card-shadow"
                   style={{ minHeight: 220 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="미리보기" className="w-full h-56 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#F2F1EC] flex items-center justify-center text-3xl">📷</div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#1A1A1A]">사진 선택 / 촬영</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">AI가 식물 이름을 찾아드려요</p>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                       className="hidden" onChange={handleImageSelect} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-red-500 text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleIdentify}
                        disabled={!imageFile || step === STEPS.IDENTIFYING}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1A3528] text-white font-bold rounded-2xl text-sm disabled:opacity-50 active:scale-95 transition-transform">
                  {step === STEPS.IDENTIFYING
                    ? <><Loader size={15} className="animate-spin" /> AI 인식 중...</>
                    : <><Sparkles size={15} /> 식물 자동 인식</>}
                </button>
                <button onClick={() => setStep(STEPS.CONFIRM)}
                        className="px-4 py-3.5 bg-white text-[#4B5563] font-semibold rounded-2xl text-sm card-shadow active:scale-95 transition-transform">
                  직접 입력
                </button>
              </div>
            </>
          )}

          {/* STEP 2: 확인 & 수정 */}
          {(step === STEPS.CONFIRM || step === STEPS.SAVING) && (
            <>
              {imagePreview && (
                <div className="flex justify-center">
                  <div className="relative">
                    <img src={imagePreview} alt="식물"
                         className="w-28 h-28 rounded-2xl object-cover card-shadow" />
                    <button onClick={() => setStep(STEPS.UPLOAD)}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full card-shadow flex items-center justify-center text-[#9CA3AF]">
                      <Camera size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* AI 후보 */}
              {suggestions.length > 1 && (
                <div className="bg-white rounded-2xl p-4 card-shadow space-y-2">
                  <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">AI 인식 결과</p>
                  {(showAllSug ? suggestions : suggestions.slice(0, 2)).map((s, i) => (
                    <button key={i} onClick={() => selectSuggestion(s)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                              form.nickname === s.name ? 'bg-[#1A3528] text-white' : 'bg-[#F2F1EC] text-[#1A1A1A]'
                            }`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{s.name}</p>
                        {s.scientific && (
                          <p className={`text-xs truncate ${form.nickname === s.name ? 'text-white/60' : 'text-[#9CA3AF]'}`}>
                            {s.scientific}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold ${form.nickname === s.name ? 'text-[#86EFAC]' : 'text-[#9CA3AF]'}`}>
                          {Math.round(s.probability * 100)}%
                        </span>
                        {form.nickname === s.name && <Check size={14} />}
                      </div>
                    </button>
                  ))}
                  {suggestions.length > 2 && (
                    <button onClick={() => setShowAllSug(!showAllSug)}
                            className="flex items-center gap-1 text-xs text-[#6B7280] font-semibold pt-1">
                      {showAllSug ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {showAllSug ? '접기' : `${suggestions.length - 2}개 더 보기`}
                    </button>
                  )}
                </div>
              )}

              {/* 폼 */}
              <div className="bg-white rounded-2xl p-4 card-shadow space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    식물 별명 *
                  </label>
                  <input type="text" value={form.nickname}
                         onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                         placeholder="예: 거실 몬스테라"
                         className="w-full px-4 py-3 bg-[#F2F1EC] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A3528]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    식물 종류
                  </label>
                  <input type="text" value={form.species}
                         onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
                         placeholder="예: Monstera deliciosa"
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

              <button onClick={handleSave} disabled={step === STEPS.SAVING}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-[#1A3528] text-white font-bold rounded-2xl text-sm disabled:opacity-50 active:scale-95 transition-transform">
                {step === STEPS.SAVING
                  ? <><Loader size={15} className="animate-spin" /> 저장 중...</>
                  : '등록 완료 🌿'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
