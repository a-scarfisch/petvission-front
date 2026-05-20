import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'

const AdminLayout = ({ children }) => {
  const { user, clearUser } = useAuthContext()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '⊞' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: '👥' },
    { label: 'Veterinarios', path: '/admin/veterinarios', icon: '👨‍⚕️' },
    { label: 'Mascotas', path: '/admin/mascotas', icon: '🐾' },
    { label: 'Citas', path: '/admin/citas', icon: '📅' },
  ]

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`
    : 'A'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: '#1e1b4b',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 8px' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#fff' }}>🐾 PetVission</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#818cf8' }}>Panel Administrador</p>
        </div>

        <div style={{ height: '1px', background: '#312e81', margin: '16px 0' }} />

        {/* Nav sections */}
        <nav style={{ flex: 1 }}>
          <p style={{ padding: '0 24px', fontSize: '11px', color: '#818cf8', fontWeight: 600, marginBottom: '8px' }}>
            PRINCIPAL
          </p>
          {navItems.slice(0, 1).map((item) => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 24px', textDecoration: 'none', fontSize: '14px',
              color: location.pathname === item.path ? '#fff' : '#a5b4fc',
              background: location.pathname === item.path ? '#312e81' : 'transparent',
              fontWeight: location.pathname === item.path ? 600 : 400,
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}

          <p style={{ padding: '16px 24px 8px', fontSize: '11px', color: '#818cf8', fontWeight: 600 }}>
            GESTIÓN
          </p>
          {navItems.slice(1).map((item) => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 24px', textDecoration: 'none', fontSize: '14px',
              color: location.pathname === item.path ? '#fff' : '#a5b4fc',
              background: location.pathname === item.path ? '#312e81' : 'transparent',
              fontWeight: location.pathname === item.path ? 600 : 400,
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #312e81' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#6366f1', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
            }}>
              {initials}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{user?.nombres}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#818cf8' }}>{user?.correo}</p>
            </div>
          </div>
          <button onClick={clearUser} style={{
            width: '100%', padding: '8px', border: 'none',
            background: 'none', color: '#ef4444', cursor: 'pointer',
            textAlign: 'left', fontSize: '13px',
          }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#f9fafb', padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout