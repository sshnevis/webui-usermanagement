import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const api = axios.create({
    baseURL: '/api/v1',
  })

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  const login = async (username, password) => {
    try {
      const response = await api.post('/token', new URLSearchParams({
        username,
        password
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      localStorage.setItem('token', response.data.access_token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData)
      return { success: true, user: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const getCurrentUser = async () => {
    try {
      const response = await api.get('/users/me')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const updateUser = async (userData) => {
    try {
      const response = await api.put('/users/me', userData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Update failed' }
    }
  }

  const addCredits = async (amount) => {
    try {
      const response = await api.post('/users/me/add-credits', { amount })
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add credits' }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getCurrentUser()
    }
    setLoading(false)
  }, [])

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    addCredits,
    api,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}