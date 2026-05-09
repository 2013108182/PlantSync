import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export default function DeleteConfirmModal({ plant, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm(plant)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#F2F1EC] rounded-t-[28px] shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        <div className="px-5 py-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
              <Trash2 size={26} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-[#1A1A1A]">정말 삭제할까요?</h3>
              <p className="text-sm text-[#9CA3AF] mt-1">
                <span className="font-bold text-[#4B5563]">{plant.nickname}</span>의 모든 기록이 사라져요
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose}
                    className="flex-1 py-4 bg-white text-[#4B5563] font-bold rounded-2xl text-sm card-shadow active:scale-95 transition-transform">
              취소
            </button>
            <button onClick={handleConfirm} disabled={deleting}
                    className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl text-sm disabled:opacity-50 active:scale-95 transition-transform">
              {deleting ? '삭제 중...' : '삭제하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
