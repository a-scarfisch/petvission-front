import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuthContext } from '../states/AuthContext'
import { useAuth } from '../hooks/useAuth'
import '@/styles/global.css'
import '@/styles/modules/auth.css'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"/>
  </svg>
)

const validate = (email, password) => {
  const errs = {}
  if (!email.trim()) {
    errs.email = 'El correo es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = 'Ingresa un correo válido.'
  }
  if (!password) errs.password = 'La contraseña es obligatoria.'
  return errs
}

const LoginForm = () => {
  const navigate = useNavigate()
  const { saveUser } = useAuthContext()
  const { handleLogin, handleGoogleLogin, loading } = useAuth()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const redirect = (rol) => {
    if (rol === 'CLIENTE')       navigate('/client/dashboard')
    else if (rol === 'VETERINARIO')   navigate('/vet/dashboard')
    else if (rol === 'ADMINISTRADOR') navigate('/admin/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)
    const errs = validate(email, password)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})

    const data = await handleLogin(email, password)
    if (data) {
      saveUser(data)
      redirect(data.rol)
    } else {
      setGlobalError('Correo o contraseña incorrectos.')
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setGlobalError(null)
      const data = await handleGoogleLogin(tokenResponse.access_token)
      setGoogleLoading(false)
      if (data) {
        saveUser(data)
        redirect(data.rol)
      } else {
        setGlobalError('No se pudo iniciar sesión con Google.')
      }
    },
    onError: () => {
      setGoogleLoading(false)
      setGlobalError('Error al conectar con Google. Intenta de nuevo.')
    },
  })

  return (
    <div className="au-page">

      {/* Panel izquierdo */}
      <div className="au-panel">
        <div className="au-panel-content">
          <div className="au-brand">🐾 PetVission</div>
          <h2 className="au-panel-title">Cuidamos a quienes más quieres</h2>
          <p className="au-panel-sub">
            Gestiona las reservas, historial clínico y productos para tu mascota desde un solo lugar.
          </p>
          <div className="au-features">
            <div className="au-feature">
              <span className="au-feature-icon">📅</span>
              Agenda reserva en segundos
            </div>
            <div className="au-feature">
              <span className="au-feature-icon">📋</span>
              Historial clínico digital
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="au-form-panel">
        <div className="au-form-wrapper">

          <div className="au-brand-mobile">🐾 PetVission</div>

          <h3 className="au-form-title">Bienvenido de vuelta</h3>
          <p className="au-form-sub">Ingresa a tu cuenta para continuar</p>

          {globalError && <div className="au-error-global">{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {/* Correo */}
            <div className="au-field">
              <label className="au-label">Correo electrónico</label>
              <div className={`au-input-group${fieldErrors.email ? ' au-input-error' : ''}`}>
                <span className="au-input-icon">✉️</span>
                <input
                  className="au-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <p className="au-field-error">{fieldErrors.email}</p>}
            </div>

            {/* Contraseña */}
            <div className="au-field">
              <div className="au-label-row">
                <label className="au-label">Contraseña</label>
                <a href="#" className="au-forgot">¿Olvidaste tu contraseña?</a>
              </div>
              <div className={`au-input-group${fieldErrors.password ? ' au-input-error' : ''}`}>
                <span className="au-input-icon">🔒</span>
                <input
                  className="au-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="au-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <p className="au-field-error">{fieldErrors.password}</p>}
            </div>

            <button type="submit" className="au-btn-primary" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
            </button>

            <div className="au-divider">
              <span className="au-divider-text">o continúa con</span>
            </div>

            <button
              type="button"
              className="au-btn-google"
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              {googleLoading ? 'Conectando...' : 'Continuar con Google'}
            </button>

            <p className="au-footer-link">
              ¿No tienes cuenta?{' '}
              <Link to="/register">Regístrate gratis</Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  )
}

export default LoginForm
