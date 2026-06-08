import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import AdminSidebar from './AdminSidebar'
import '@/styles/modules/admin.css'

const BOTTOM_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
  { label: 'Usuarios',  path: '/admin/usuarios',  icon: '👥' },
  { label: 'Mascotas',  path: '/admin/mascotas',  icon: '🐾' },
  { label: 'Citas',     path: '/admin/citas',     icon: '📅' },
  { label: 'Horarios',  path: '/admin/horarios',  icon: '🕐' },
]

const AdminLayout = ({ children }) => {
  const { clearUser } = useAuthContext()
  const location = useLocation()

  const bottomClass = (path) =>
    `adm-bottom-nav__item${location.pathname === path ? ' adm-bottom-nav__item--active' : ''}`

  return (
    <div className="adm-layout">
      <AdminSidebar />

      <main className="adm-main">
        {children}
      </main>

      {/* Bottom nav — solo móvil */}
      <nav className="adm-bottom-nav">
        {BOTTOM_NAV.map((item) => (
          <Link key={item.path} to={item.path} className={bottomClass(item.path)}>
            <span className="adm-bottom-nav__icon">{item.icon}</span>
            <span className="adm-bottom-nav__label">{item.label}</span>
          </Link>
        ))}
        <button className="adm-bottom-nav__logout" onClick={clearUser}>
          <span className="adm-bottom-nav__icon">🚪</span>
          <span className="adm-bottom-nav__label">Salir</span>
        </button>
      </nav>
    </div>
  )
}

export default AdminLayout
