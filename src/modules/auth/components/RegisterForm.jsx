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

const PHONE_RE = /^\+56 9 \d{4} \d{4}$/

const validate = (f) => {
  const e = {}
  if (!f.firstName.trim())  e.firstName  = 'El nombre es obligatorio.'
  if (!f.lastName.trim())   e.lastName   = 'El apellido es obligatorio.'
  if (!f.email.trim())      e.email      = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Ingresa un correo válido.'
  if (!f.phone.trim())      e.phone      = 'El teléfono es obligatorio.'
  else if (!PHONE_RE.test(f.phone)) e.phone = 'Formato: +56 9 XXXX XXXX'
  if (!f.password)          e.password   = 'La contraseña es obligatoria.'
  else if (f.password.length < 8) e.password = 'Mínimo 8 caracteres.'
  if (!f.confirm)           e.confirm    = 'Confirma tu contraseña.'
  else if (f.confirm !== f.password) e.confirm = 'Las contraseñas no coinciden.'
  if (!f.terms)             e.terms      = 'Debes aceptar los términos.'
  return e
}

const INIT = {
  firstName: '', lastName: '', email: '',
  phone: '', password: '', confirm: '',
  terms: false,
}

const RegisterForm = () => {
  const navigate = useNavigate()
  const { saveUser } = useAuthContext()
  const { handleRegister, handleGoogleLogin, loading } = useAuth()

  const [form, setForm]               = useState(INIT)
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const redirect = (rol) => {
    if (rol === 'CLIENTE')            navigate('/client/dashboard')
    else if (rol === 'VETERINARIO')   navigate('/vet/dashboard')
    else if (rol === 'ADMINISTRADOR') navigate('/admin/dashboard')
    else navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError(null)
    const errs = validate(form)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})

    const data = await handleRegister({ ...form, role: 'CLIENTE' })
    if (data) {
      saveUser(data)
      redirect(data.rol)
    } else {
      setGlobalError('No se pudo crear la cuenta. Intenta de nuevo.')
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
        setGlobalError('No se pudo continuar con Google.')
      }
    },
    onError: () => {
      setGoogleLoading(false)
      setGlobalError('Error al conectar con Google. Intenta de nuevo.')
    },
  })

  const field = (name, label, type, placeholder, icon, extra = {}) => (
    <div className="au-field">
      <label className="au-label">{label}</label>
      <div className={`au-input-group${fieldErrors[name] ? ' au-input-error' : ''}`}>
        <span className="au-input-icon">{icon}</span>
        <input
          className="au-input"
          type={type}
          placeholder={placeholder}
          value={form[name]}
          onChange={set(name)}
          {...extra}
        />
      </div>
      {fieldErrors[name] && <p className="au-field-error">{fieldErrors[name]}</p>}
    </div>
  )

  return (
    <div className="au-page">

      {/* Panel izquierdo */}
      <div className="au-panel">
        <div className="au-panel-content">
          <div className="au-brand">🐾 PetVission</div>
          <h2 className="au-panel-title">Tu mascota merece lo mejor</h2>
          <p className="au-panel-sub">
            Únete a cientos de dueños que ya gestionan el cuidado de sus mascotas con PetVission.
          </p>
          <div className="au-steps">
            {[
              ['Crea tu cuenta',     'Solo toma 2 minutos'],
              ['Agrega tus mascotas','Perfil completo de cada una'],
              ['Agenda tu cita',     'Todo desde un solo lugar'],
            ].map(([title, sub], i) => (
              <div key={i} className="au-step">
                <div className="au-step-badge">{i + 1}</div>
                <div>
                  <p className="au-step-title">{title}</p>
                  <p className="au-step-sub">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="au-form-panel">
        <div className="au-form-wrapper">

          <div className="au-brand-mobile">🐾 PetVission</div>

          <h3 className="au-form-title">Crear cuenta</h3>
          <p className="au-form-sub">Empieza a cuidar mejor a tu mascota</p>

          {globalError && <div className="au-error-global">{globalError}</div>}

          <form onSubmit={handleSubmit} noValidate>

            {field('firstName', 'Nombre',              'text',     'Juan',              '👤', { autoComplete: 'given-name' })}
            {field('lastName',  'Apellido',             'text',     'Pérez',             '👤', { autoComplete: 'family-name' })}
            {field('email',     'Correo electrónico',  'email',    'tu@email.com',      '✉️', { autoComplete: 'email' })}
            {field('phone',     'Teléfono',             'tel',      '+56 9 XXXX XXXX',   '📞', { autoComplete: 'tel' })}

            {/* Contraseña */}
            <div className="au-field">
              <label className="au-label">Contraseña</label>
              <div className={`au-input-group${fieldErrors.password ? ' au-input-error' : ''}`}>
                <span className="au-input-icon">🔒</span>
                <input
                  className="au-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button type="button" className="au-pw-toggle" onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Ocultar' : 'Mostrar'}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <p className="au-field-error">{fieldErrors.password}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div className="au-field">
              <label className="au-label">Confirmar contraseña</label>
              <div className={`au-input-group${fieldErrors.confirm ? ' au-input-error' : ''}`}>
                <span className="au-input-icon">🔒</span>
                <input
                  className="au-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                <button type="button" className="au-pw-toggle" onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.confirm && <p className="au-field-error">{fieldErrors.confirm}</p>}
            </div>

            {/* Términos */}
            <div className="au-terms">
              <input
                id="terms"
                type="checkbox"
                className="au-terms-check"
                checked={form.terms}
                onChange={set('terms')}
              />
              <label htmlFor="terms" className="au-terms-label">
                Acepto los{' '}
                <a href="#" className="au-terms-link">Términos de uso</a>
                {' '}y la{' '}
                <a href="#" className="au-terms-link">Política de privacidad</a>
              </label>
            </div>
            {fieldErrors.terms && <p className="au-field-error" style={{ marginTop: '-12px', marginBottom: '12px' }}>{fieldErrors.terms}</p>}

            <button type="submit" className="au-btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
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
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Iniciar sesión</Link>
            </p>

          </form>
        </div>
      </div>

    </div>
  )
}

export default RegisterForm
