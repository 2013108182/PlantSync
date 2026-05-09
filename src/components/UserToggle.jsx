import { Settings } from 'lucide-react'

export default function UserToggle({ activeUser, currentUserName, userNames, onToggle, onSettingsOpen }) {
  const otherUser     = activeUser === 'user1' ? 'user2' : 'user1'
  const otherUserName = userNames[otherUser]

  return (
    <div className="flex items-center gap-2">
      {/* 유저 토글 버튼 */}
      <div className="flex items-center bg-white/20 rounded-full p-1 gap-1">
        <button
          onClick={activeUser === 'user2' ? onToggle : undefined}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeUser === 'user1'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-white/80 hover:text-white'
          }`}
        >
          {userNames.user1}
        </button>
        <button
          onClick={activeUser === 'user1' ? onToggle : undefined}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeUser === 'user2'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-white/80 hover:text-white'
          }`}
        >
          {userNames.user2}
        </button>
      </div>

      {/* 설정 버튼 */}
      <button
        onClick={onSettingsOpen}
        className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all"
        aria-label="설정"
      >
        <Settings size={18} />
      </button>
    </div>
  )
}
