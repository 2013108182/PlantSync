import { Settings } from 'lucide-react'

export default function UserToggle({ activeUser, userNames, onToggle, onSettingsOpen }) {
  return (
    <div className="flex items-center gap-2">
      <div className="glass rounded-full p-1 flex gap-1">
        {['user1', 'user2'].map((u) => (
          <button
            key={u}
            onClick={() => u !== activeUser && onToggle()}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeUser === u
                ? 'bg-white text-[#1A3528] shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {userNames[u]}
          </button>
        ))}
      </div>
      <button
        onClick={onSettingsOpen}
        className="glass w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}
