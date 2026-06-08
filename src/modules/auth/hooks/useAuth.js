import { useState } from 'react'
import { login, register, loginConGoogle } from '../services/authService'
import { handleError } from '@/modules/core/lib/errorHandler'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await login(email, password)
      // Si el admin tiene 2FA activo, el backend no devuelve token todavía
      if (data.requiresTwoFactor) return data
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      setError(handleError(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await register(userData)
      return data
    } catch (err) {
      setError(handleError(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (accessToken) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginConGoogle(accessToken)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      setError(handleError(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return { handleLogin, handleRegister, handleGoogleLogin, handleLogout, loading, error }
}
