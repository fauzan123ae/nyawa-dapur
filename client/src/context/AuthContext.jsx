import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jwt_token')
    if (!token) return setLoading(false)
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('jwt_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('jwt_token', token)
    setUser(userData)
  }

  const logout = async () => {
    await apiLogout().catch(() => {})
    localStorage.removeItem('jwt_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)