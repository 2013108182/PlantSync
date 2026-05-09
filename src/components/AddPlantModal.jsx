import { useState, useRef } from 'react'
import { X, Camera, Loader, Leaf, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { identifyPlant, getWateringCycle } from '../api/plantApi'

const STEPS = { UPLOAD: 'upload', IDENTIFYING: 'identifying', CONFIRM: 'confirm', SAVING: 'saving' }

export default function AddPlantModal({ onClose, onSave }) {
  const [step, setStep]               = useState(STEPS.UPLOAD)
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [identified, setIdentified]   = useState(null)   // Plant.id 결과
  const [suggestions, setSuggestions] = useState([])
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)
  const [form, setForm]               = useState({
    nickname: '',
    species: '',
    wateringCycle: 7,
  })
  const [error, setError]             = useState('')
  const fileInputRef                  = useRef()

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleIdentify = async () => {
    if (!imageFile) {
      setError('사진을 먼저 선택해주세요.')
      return
    }
    setStep(STEPS.IDENTIFYING)
    setError('')
    try {
      const result = await identifyPlant(imageFile)
      setIdentified(result)
      setSuggestions(result.allSuggestions || [])

      // Perenual에서 급수 주기 가져오기
      let cycle = 7
      try {
        const watering = await getWateringCycle(result.commonName)
        if (watering?.cycle) cycle = watering.cycle
      } catch (e) {
        console.warn('Perenual API 실패, 기본값 사용:', e)
      }

      setForm({
        nickname: result.commonName,
        species: result.scientificName,
        wateringCycle: cycle,
      })
      setStep(STEPS.CONFIRM)
    } catch (e) {
      setError(e.message || '식물 인식에 실패했습니다. API 키를 확인해주세요.')
      setStep(STEPS.UPLOAD)
    }
  }

  const handleManualEntry = () => {
    setForm({ nickname: '', species: '', wateringCycle: 7 })
    setStep(STEPS.CONFIRM)
  }

  const selectSuggestion = async (suggestion) => {
    setForm((f) => ({ ...f, nickname: suggestion.name, species: suggestion.scientific }))
    // 선택한 이름으로 급수 주기 재조회
    try {
      const watering = await getWateringCycle(suggestion.name)
      if (watering?.cycle) setForm((f) => ({ ...f, wateringCycle: watering.cycle }))
    } catch {}
  }

  const handleSave = async () => {
    if (!form.nickname.trim()) {
      setError('별명을 입력해주세요.')
      return
    }
    setStep(STEPS.SAVING)
    try {
      await onSave({
        nickname: form.nickname.trim(),
        species: form.species.trim(),
        imageFile,
        wateringCycle: Number(form.wateringCycle) || 7,
      })
      onClose()
    } catch (e) {
      setError(e.message || '저장에 실패했습니다.')
      setStep(STEPS.CONFIRM)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">🌱 새 식물 등록</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* STEP 1: 사진 업로드 */}
          {(step === STEPS.UPLOAD || step === STEPS.IDENTIFYING) && (
            <>
              {/* 이미지 선택 영역 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-primary-400 transition-colors"
                style={{ minHeight: '200px' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="미리보기" className="w-full h-52 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 gap-3 text-gray-400">
                    <Camera size={40} strokeWidth={1.5} />
                    <p className="text-sm font-medium">사진을 선택하거나 찍어주세요</p>
                    <p className="text-xs">Plant.id AI가 식물을 인식해드려요</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={handleIdentify}
                  disabled={!imageFile || step === STEPS.IDENTIFYING}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-95"
                >
                  {step === STEPS.IDENTIFYING ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      AI 인식 중...
                    </>
                  ) : (
                    <>
                      <Leaf size={16} />
                      식물 자동 인식
                    </>
                  )}
                </button>
                <button
                  onClick={handleManualEntry}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all active:scale-95 text-sm"
                >
                  직접 입력
                </button>
              </div>
            </>
          )}

          {/* STEP 2: 확인 및 수정 */}
          {(step === STEPS.CONFIRM || step === STEPS.SAVING) && (
            <>
              {/* 이미지 미리보기 (소형) */}
              {imagePreview && (
                <div className="flex justify-center">
                  <img src={imagePreview} alt="식물" className="w-28 h-28 rounded-2xl object-cover shadow-md" />
                </div>
              )}

              {/* AI 인식 결과 선택 (여러 후보가 있을 때) */}
              {suggestions.length > 1 && (
                <div className="bg-primary-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-primary-700 mb-2">AI 인식 결과 후보</p>
                  <div className="space-y-1">
                    {(showAllSuggestions ? suggestions : suggestions.slice(0, 2)).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selectSuggestion(s)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          form.nickname === s.name
                            ? 'bg-primary-500 text-white'
                            : 'bg-white hover:bg-primary-100 text-gray-700'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          {s.scientific && <p className={`text-xs ${form.nickname === s.name ? 'text-primary-100' : 'text-gray-400'}`}>{s.scientific}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${form.nickname === s.name ? 'text-primary-100' : 'text-gray-400'}`}>
                            {Math.round(s.probability * 100)}%
                          </span>
                          {form.nickname === s.name && <Check size={14} />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {suggestions.length > 2 && (
                    <button
                      onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                      className="mt-1 flex items-center gap-1 text-xs text-primary-600 font-medium"
                    >
                      {showAllSuggestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      {showAllSuggestions ? '접기' : `${suggestions.length - 2}개 더 보기`}
                    </button>
                  )}
                </div>
              )}

              {/* 폼 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    식물 별명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nickname}
                    onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                    placeholder="예: 거실 몬스테라"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    식물 종류 (학명 또는 일반명)
                  </label>
                  <input
                    type="text"
                    value={form.species}
                    onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                    placeholder="예: Monstera deliciosa"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    급수 주기 (일)
                  </label>
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
                  <p className="text-xs text-gray-400 mt-1">
                    Perenual AI 추천값 · 직접 조정 가능해요
                  </p>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(STEPS.UPLOAD)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm"
                >
                  뒤로
                </button>
                <button
                  onClick={handleSave}
                  disabled={step === STEPS.SAVING}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-95"
                >
                  {step === STEPS.SAVING ? (
                    <><Loader size={16} className="animate-spin" /> 저장 중...</>
                  ) : (
                    '식물 등록하기 🌿'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
