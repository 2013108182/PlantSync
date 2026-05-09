import { X } from 'lucide-react'

export default function SettingsModal({ currentUserName, isDeviceDetected, onClose, onChangeName }) {
  const names = ['지수', '남식']

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#F2F1EC] rounded-t-[28px] shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[17px] font-extrabold text-[#1A1A1A]">설정</h2>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B7280] card-shadow">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-3">
          {/* 현재 기기 정보 */}
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">현재 기기</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A3528] rounded-xl flex items-center justify-center text-lg">
                📱
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A] text-sm">{currentUserName}의 기기</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  {isDeviceDetected ? '기기 자동 인식됨 ✓' : '수동으로 설정됨'}
                </p>
              </div>
            </div>
          </div>

          {/* 이름 변경 (기기 감지 안 된 경우에만) */}
          {!isDeviceDetected && (
            <div className="bg-white rounded-2xl p-4 card-shadow">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">이름 변경</p>
              <div className="flex gap-2">
                {names.map(name => (
                  <button key={name} onClick={() => { onChangeName(name); onClose() }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                            currentUserName === name
                              ? 'bg-[#1A3528] text-white'
                              : 'bg-[#F2F1EC] text-[#4B5563]'
                          }`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 앱 정보 */}
          <div className="bg-white rounded-2xl p-4 card-shadow">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">앱 정보</p>
            <div className="space-y-2 text-xs text-[#9CA3AF]">
              <div className="flex justify-between">
                <span>기기 감지</span>
                <span className="font-medium text-[#4B5563]">
                  Galaxy S24 → 지수 / S23 Ultra → 남식
                </span>
              </div>
              <div className="flex justify-between">
                <span>이미지 서비스</span>
                <span className="font-medium text-[#4B5563]">ImgBB</span>
              </div>
              <div className="flex justify-between">
                <span>데이터베이스</span>
                <span className="font-medium text-[#4B5563]">Firebase Firestore</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
