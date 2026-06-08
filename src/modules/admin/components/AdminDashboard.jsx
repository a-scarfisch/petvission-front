import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'
import Skeleton from '@/modules/core/components/Skeleton'

const AdminDashboard = () => {
  const { usuarios, citas, loading } = useAdminContext()

  const hoy      = new Date().toISOString().split('T')[0]
  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const totalUsuarios     = usuarios.length
  const totalVeterinarios = usuarios.filter((u) => u.rol === 'VETERINARIO').length
  const totalClientes     = usuarios.filter((u) => u.rol === 'CLIENTE').length
  const citasHoy          = citas.filter((c) => c.fecha === hoy).length
  const confirmadas       = citas.filter((c) => c.estado === 'CONFIRMADA').length
  const pendientes        = citas.filter((c) => c.estado === 'PENDIENTE').length
  const canceladas        = citas.filter((c) => c.estado === 'CANCELADA').length
  const ultimosUsuarios   = [...usuarios].slice(-5).reverse()

  const stats = [
    { label: 'Total Usuarios', value: totalUsuarios,     icon: '👥', color: '#6366f1' },
    { label: 'Clientes',       value: totalClientes,     icon: '👤', color: '#3b82f6' },
    { label: 'Veterinarios',   value: totalVeterinarios, icon: '👨‍⚕️', color: '#10b981' },
    { label: 'Citas Hoy',      value: citasHoy,          icon: '📅', color: '#f59e0b' },
  ]

  const progreso = [
    { label: 'Confirmadas', value: confirmadas, color: '#10b981' },
    { label: 'Pendientes',  value: pendientes,  color: '#f59e0b' },
    { label: 'Canceladas',  value: canceladas,  color: '#ef4444' },
  ]

  if (loading) return (
    <AdminLayout>
      <div className="adm-page-header">
        <Skeleton height="24px" width="25%" style={{ marginBottom: '8px' }} />
        <Skeleton height="14px" width="50%" />
      </div>
      <div className="adm-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="adm-stat-card">
            <Skeleton height="13px" width="55%" style={{ marginBottom: '14px' }} />
            <Skeleton height="30px" width="40%" />
          </div>
        ))}
      </div>
      <div className="adm-dash-grid">
        <div className="adm-panel">
          <Skeleton height="16px" width="50%" style={{ marginBottom: '20px' }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <Skeleton height="32px" width="32px" radius="50%" />
              <div style={{ flex: 1 }}>
                <Skeleton height="13px" width="60%" style={{ marginBottom: '6px' }} />
                <Skeleton height="11px" width="40%" />
              </div>
              <Skeleton height="20px" width="72px" radius="12px" />
            </div>
          ))}
        </div>
        <div className="adm-panel">
          <Skeleton height="16px" width="40%" style={{ marginBottom: '24px' }} />
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Skeleton height="13px" width="30%" />
                <Skeleton height="13px" width="20%" />
              </div>
              <Skeleton height="8px" radius="4px" />
            </div>
          ))}
          <Skeleton height="64px" radius="8px" style={{ marginTop: '16px' }} />
        </div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="adm-page-header">
        <h2 className="adm-page-header__title">Dashboard</h2>
        <p className="adm-page-header__sub" style={{ textTransform: 'capitalize' }}>{fechaHoy}</p>
      </div>

      <div className="adm-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="adm-stat-card">
            <p className="adm-stat-card__label">{stat.label}</p>
            <div className="adm-stat-card__body">
              <span className="adm-stat-card__icon">{stat.icon}</span>
              <span className="adm-stat-card__value" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-panel">
          <h3 className="adm-panel__title">👥 Últimos usuarios registrados</h3>
          {ultimosUsuarios.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay usuarios registrados.</p>
          ) : (
            <table className="adm-mini-table">
              <thead>
                <tr>
                  {['Usuario', 'Correo', 'Rol'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ultimosUsuarios.map((u) => (
                  <tr key={u.idUsuario}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="adm-avatar adm-avatar--sm">
                          {u.nombres?.[0]}{u.apellidos?.[0]}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {u.nombres} {u.apellidos}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280' }}>{u.correo}</td>
                    <td><span className={`adm-badge adm-badge--${u.rol}`}>{u.rol}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="adm-panel">
          <h3 className="adm-panel__title">📊 Citas por estado</h3>
          {progreso.map((item) => (
            <div key={item.label} className="adm-progress-group">
              <div className="adm-progress__row">
                <span className="adm-progress__label">{item.label}</span>
                <span className="adm-progress__value" style={{ color: item.color }}>{item.value}</span>
              </div>
              <div className="adm-progress__track">
                <div
                  className="adm-progress__fill"
                  style={{
                    background: item.color,
                    width: citas.length > 0 ? `${(item.value / citas.length) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>
          ))}
          <div className="adm-total-box">
            <p className="adm-total-box__label">TOTAL CITAS</p>
            <p className="adm-total-box__value">{citas.length}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
