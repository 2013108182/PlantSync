import { useState } from 'react'
import { X } from 'lucide-react'

export default function SettingsModal({ userNames, onClose, onSave }) {
  const [names, setNames] = useState({ ...userNames })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!names.user1.trim() || !names.user2.trim()) return
    onSave({ user1: names.user1.trim(), user2: names.user2.trim() })
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">⚙️ 설정</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">👥 사용자 이름 설정</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">사용자 1</label>
                <input
                  type="text"
                  value={names.user1}
                  onChange={(e) => setNames((n) => ({ ...n, user1: e.target.value }))}
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  placeholder="예: 아내, 지수, 민지..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">사용자 2</label>
                <input
                  type="text"
                  value={names.user2}
                  onChange={(e) => setNames((n) => ({ ...n, user2: e.target.value }))}
                  maxLength={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                  placeholder="예: 남편, 준혁, 민준..."
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600">💡 앱 정보</p>
            <p>이름은 이 기기에만 저장됩니다.</p>
            <p>Firebase와 API 키는 <code className="bg-gray-100 px-1 rounded">.env</code> 파일에서 설정하세요.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!names.user1.trim() || !names.user2.trim()}
              className={`flex-1 py-3 font-semibold rounded-xl transition-all text-sm active:scale-95 ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50'
              }`}
            >
              {saved ? '✓ 저장됨!' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
