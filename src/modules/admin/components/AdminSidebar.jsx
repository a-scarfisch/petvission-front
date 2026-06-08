import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const NAV_PRINCIPAL = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '⊞' },
]

const NAV_GESTION = [
  { label: 'Usuarios',  path: '/admin/usuarios',  icon: '👥' },
  { label: 'Mascotas',  path: '/admin/mascotas',  icon: '🐾' },
  { label: 'Citas',     path: '/admin/citas',     icon: '📅' },
  { label: 'Horarios',  path: '/admin/horarios',  icon: '🕐' },
  { label: 'Seguridad', path: '/admin/seguridad', icon: '🔐' },
]

const AdminSidebar = () => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'A'

  const linkClass = (path) =>
    `adm-sidebar__link${location.pathname === path ? ' adm-sidebar__link--active' : ''}`

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar__logo">
        <p className="adm-sidebar__logo-title">🐾 PetVission</p>
        <p className="adm-sidebar__logo-sub">Panel Administrador</p>
      </div>

      <div className="adm-sidebar__divider" />

      <nav className="adm-sidebar__nav">
        <p className="adm-sidebar__nav-label">PRINCIPAL</p>
        {NAV_PRINCIPAL.map((item) => (
          <Link key={item.path} to={item.path} className={linkClass(item.path)}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}

        <p className="adm-sidebar__nav-label--section">GESTIÓN</p>
        {NAV_GESTION.map((item) => (
          <Link key={item.path} to={item.path} className={linkClass(item.path)}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>

      <div className="adm-sidebar__footer">
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__avatar">{initials}</div>
          <div>
            <p className="adm-sidebar__user-name">{user?.nombres}</p>
            <p className="adm-sidebar__user-email">{user?.correo}</p>
          </div>
        </div>
        <button className="adm-sidebar__logout" onClick={clearUser}>
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
