import { createContext, useContext,useEffect, useState } from 'react'
import api from '../api/axios'



const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return
    }
    api.get('/api/v1/auth/me')
        .then((response) => {
          setUser(response.data)
        })
        .catch((error) => {
          setUser(null)

          if (error.response?.status === 401) {
            localStorage.removeItem('token')
          }
        })
        .finally(() => {
          setLoading(false)
        })
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  return useContext(AuthContext)
}