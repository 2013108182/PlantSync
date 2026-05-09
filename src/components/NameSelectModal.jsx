// 기기 감지가 안 될 때 (PC, 다른 폰 등) 이름을 직접 선택하는 화면

export default function NameSelectModal({ onSelect }) {
  const names = ['지수', '남식']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A3528] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">🌿</div>
        <h1 className="text-white text-2xl font-extrabold mb-1">PlantSync</h1>
        <p className="text-[#86EFAC] text-sm mb-10">누구세요?</p>

        <div className="flex flex-col gap-3">
          {names.map(name => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg rounded-2xl transition-all active:scale-95"
            >
              {name}
            </button>
          ))}
        </div>

        <p className="text-white/30 text-xs mt-8">
          기기에서 자동으로 인식되지 않은 경우 선택해주세요
        </p>
      </div>
    </div>
  )
}
