import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import '@/styles/modules/vet.css'

const BOTTOM_NAV = [
  { label: 'Dashboard', path: '/vet/dashboard', icon: '📅' },
  { label: 'Citas',     path: '/vet/citas',     icon: '🗓️' },
  { label: 'Pacientes', path: '/vet/pacientes', icon: '👥' },
  { label: 'Horarios',  path: '/vet/horarios',  icon: '🕐' },
]

const NAV_ITEMS = [
  { label: 'Dashboard',       path: '/vet/dashboard', icon: '📅' },
  { label: 'Mis Citas',       path: '/vet/citas',     icon: '🗓️' },
  { label: 'Mis Pacientes',   path: '/vet/pacientes', icon: '👥' },
  { label: 'Historial',       path: '/vet/historial', icon: '📋' },
  { label: 'Horarios',        path: '/vet/horarios',  icon: '🕐' },
]

const VetLayout = ({ children }) => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'V'

  return (
    <div className="vet-layout">
      <aside className="vet-sidebar">
        <div className="vet-sidebar__logo">
          <p className="vet-sidebar__logo-title">🐾 PetVission</p>
          <p className="vet-sidebar__logo-sub">Gestión Veterinaria</p>
        </div>

        <div className="vet-sidebar__divider" />

        <nav className="vet-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`vet-sidebar__link${location.pathname === item.path ? ' vet-sidebar__link--active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="vet-sidebar__footer">
          <div className="vet-sidebar__user">
            <div className="vet-sidebar__avatar">{initials}</div>
            <div>
              <p className="vet-sidebar__user-name">{user?.nombres} {user?.apellidos}</p>
              <p className="vet-sidebar__user-email">{user?.correo}</p>
            </div>
          </div>
          <button className="vet-sidebar__logout" onClick={clearUser}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="vet-main">
        {children}
      </main>

      {/* Bottom nav — móvil */}
      <nav className="vet-bottom-nav">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`vet-bottom-nav__item${location.pathname === item.path ? ' vet-bottom-nav__item--active' : ''}`}
          >
            <span className="vet-bottom-nav__icon">{item.icon}</span>
            <span className="vet-bottom-nav__label">{item.label}</span>
          </Link>
        ))}
        <button className="vet-bottom-nav__logout" onClick={clearUser}>
          <span className="vet-bottom-nav__icon">🚪</span>
          <span className="vet-bottom-nav__label">Salir</span>
        </button>
      </nav>
    </div>
  )
}

export default VetLayout
