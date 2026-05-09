import { useState, useEffect } from 'react'

const STORAGE_KEY = 'plantsync_user'
const NAMES_KEY   = 'plantsync_user_names'

const DEFAULT_NAMES = { user1: '아내', user2: '남편' }

export function useUser() {
  const [activeUser, setActiveUser] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'user1'
  })

  const [userNames, setUserNames] = useState(() => {
    try {
      const stored = localStorage.getItem(NAMES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_NAMES
    } catch {
      return DEFAULT_NAMES
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeUser)
  }, [activeUser])

  useEffect(() => {
    localStorage.setItem(NAMES_KEY, JSON.stringify(userNames))
  }, [userNames])

  const toggleUser = () => {
    setActiveUser((prev) => (prev === 'user1' ? 'user2' : 'user1'))
  }

  const updateUserNames = (newNames) => {
    setUserNames((prev) => ({ ...prev, ...newNames }))
  }

  // 현재 활성 유저의 표시 이름
  const currentUserName = userNames[activeUser]

  return { activeUser, currentUserName, userNames, toggleUser, updateUserNames }
}
