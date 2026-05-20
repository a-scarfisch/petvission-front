import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const VetLayout = ({ children }) => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/vet/dashboard', icon: '⊞' },
    { label: 'Mis Citas', path: '/vet/citas', icon: '📅' },
    { label: 'Pacientes', path: '/vet/pacientes', icon: '🐾' },
    { label: 'Historial', path: '/vet/historial', icon: '📋' },
    { label: 'Horarios', path: '/vet/horarios', icon: '🕐' },
  ]

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'V'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#1a1f36',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 8px' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#fff' }}>🐾 PetVission</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7db3' }}>Gestión Veterinaria</p>
        </div>

        <div style={{ height: '1px', background: '#2d3561', margin: '16px 0' }} />

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 24px',
                color: location.pathname === item.path ? '#fff' : '#8892b0',
                background: location.pathname === item.path ? '#2d3561' : 'transparent',
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
        <div style={{ padding: '16px 24px', borderTop: '1px solid #2d3561' }}>
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
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{user?.nombres}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#6b7db3' }}>{user?.correo}</p>
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

export default VetLayout