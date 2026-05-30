import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const ClientLayout = ({ children }) => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/client/dashboard', icon: '⊞' },
    { label: 'Mis Mascotas', path: '/client/mascotas', icon: '🐾' },
    { label: 'Mis Reservas', path: '/client/reservas', icon: '🗓️' },
    { label: 'Mi Perfil', path: '/client/perfil', icon: '👤' },
    { label: 'Configuración', path: '/client/configuracion', icon: '⚙️' },
  ]

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', fontWeight: 700, fontSize: '18px', color: '#2a9d8f' }}>
          🐾 PetVission
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <p style={{ padding: '0 24px', fontSize: '11px', color: '#9ca3af', fontWeight: 600, marginBottom: '8px' }}>
            PRINCIPAL
          </p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 24px',
                color: location.pathname === item.path ? '#2a9d8f' : '#374151',
                background: location.pathname === item.path ? '#f0faf9' : 'transparent',
                textDecoration: 'none',
                fontWeight: location.pathname === item.path ? 600 : 400,
                fontSize: '14px',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#2a9d8f', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
            }}>
              {initials}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{user?.nombres}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{user?.correo}</p>
            </div>
          </div>
          <button
            onClick={clearUser}
            style={{
              width: '100%', padding: '8px', border: 'none',
              background: 'none', color: '#ef4444', cursor: 'pointer',
              textAlign: 'left', fontSize: '13px',
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f9fafb', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}

export default ClientLayout