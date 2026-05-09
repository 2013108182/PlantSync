import { X, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function DeleteConfirmModal({ plant, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm(plant)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={28} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">식물을 삭제할까요?</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{plant.nickname}</span>의 모든 기록이 사라져요.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all text-sm"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-95 text-sm"
            >
              {deleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
