import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import '@/styles/modules/client-layout.css'

const NAV_ITEMS = [
  { label: 'Dashboard',     path: '/client/dashboard',     icon: '⊞' },
  { label: 'Mis Mascotas',  path: '/client/mascotas',      icon: '🐾' },
  { label: 'Mis Reservas',  path: '/client/reservas',      icon: '🗓️' },
  { label: 'Mi Perfil',     path: '/client/perfil',        icon: '👤' },
  { label: 'Configuración', path: '/client/configuracion', icon: '⚙️' },
]

const BOTTOM_NAV = [
  { label: 'Inicio',   path: '/client/dashboard', icon: '🏠' },
  { label: 'Mascotas', path: '/client/mascotas',  icon: '🐾' },
  { label: 'Reservas', path: '/client/reservas',  icon: '📅' },
  { label: 'Perfil',   path: '/client/perfil',    icon: '👤' },
]

const ClientLayout = ({ children }) => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'U'

  return (
    <div className="cl-layout">
      {/* Sidebar — desktop */}
      <aside className="cl-sidebar">
        <div className="cl-sidebar__logo">🐾 PetVission</div>

        <nav style={{ flex: 1 }}>
          <p className="cl-sidebar__nav-label">PRINCIPAL</p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`cl-sidebar__link${location.pathname === item.path ? ' cl-sidebar__link--active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="cl-sidebar__footer">
          <div className="cl-sidebar__user">
            <div className="cl-sidebar__avatar">{initials}</div>
            <div>
              <p className="cl-sidebar__user-name">{user?.nombres}</p>
              <p className="cl-sidebar__user-email">{user?.correo}</p>
            </div>
          </div>
          <button className="cl-sidebar__logout" onClick={clearUser}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="cl-main">
        {children}
      </main>

      {/* Bottom nav — móvil */}
      <nav className="cl-bottom-nav">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`cl-bottom-nav__item${location.pathname === item.path ? ' cl-bottom-nav__item--active' : ''}`}
          >
            <span className="cl-bottom-nav__icon">{item.icon}</span>
            <span className="cl-bottom-nav__label">{item.label}</span>
          </Link>
        ))}
        <button className="cl-bottom-nav__logout" onClick={clearUser}>
          <span className="cl-bottom-nav__icon">🚪</span>
          <span className="cl-bottom-nav__label">Salir</span>
        </button>
      </nav>
    </div>
  )
}

export default ClientLayout
