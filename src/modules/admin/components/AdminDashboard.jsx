import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'

const AdminDashboard = () => {
  const { user } = useAuthContext()
  const { usuarios, citas, loading } = useAdminContext()

  const hoy = new Date().toISOString().split('T')[0]
  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const totalUsuarios = usuarios.length
  const totalVeterinarios = usuarios.filter((u) => u.rol === 'VETERINARIO').length
  const totalClientes = usuarios.filter((u) => u.rol === 'CLIENTE').length
  const citasHoy = citas.filter((c) => c.fecha === hoy).length
  const confirmadas = citas.filter((c) => c.estado === 'CONFIRMADA').length
  const pendientes = citas.filter((c) => c.estado === 'PENDIENTE').length
  const canceladas = citas.filter((c) => c.estado === 'CANCELADA').length

  const ultimosUsuarios = [...usuarios].slice(-5).reverse()

  const rolEstilo = {
    CLIENTE: { background: '#dbeafe', color: '#1e40af' },
    VETERINARIO: { background: '#d1fae5', color: '#065f46' },
    ADMINISTRADOR: { background: '#ede9fe', color: '#5b21b6' },
  }

  if (loading) return <AdminLayout><p>Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>Dashboard</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px', textTransform: 'capitalize' }}>
          {fechaHoy}
        </p>
      </div>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Usuarios', value: totalUsuarios, icon: '👥', color: '#6366f1' },
          { label: 'Clientes', value: totalClientes, icon: '👤', color: '#3b82f6' },
          { label: 'Veterinarios', value: totalVeterinarios, icon: '👨‍⚕️', color: '#10b981' },
          { label: 'Citas Hoy', value: citasHoy, icon: '📅', color: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <span style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Últimos usuarios */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>👥 Últimos usuarios registrados</h3>
          {ultimosUsuarios.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay usuarios registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['Usuario', 'Correo', 'Rol'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 0', textAlign: 'left',
                      fontSize: '11px', color: '#9ca3af', fontWeight: 600,
                    }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ultimosUsuarios.map((u) => (
                  <tr key={u.idUsuario} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: '#e0e7ff', color: '#4338ca',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '12px',
                        }}>
                          {u.nombres?.[0]}{u.apellidos?.[0]}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {u.nombres} {u.apellidos}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 0', fontSize: '13px', color: '#6b7280' }}>
                      {u.correo}
                    </td>
                    <td style={{ padding: '10px 0' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                        ...(rolEstilo[u.rol] ?? { background: '#f3f4f6', color: '#374151' }),
                      }}>
                        {u.rol}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Citas por estado */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px' }}>📊 Citas por estado</h3>
          {[
            { label: 'Confirmadas', value: confirmadas, color: '#10b981', bg: '#d1fae5', total: citas.length },
            { label: 'Pendientes', value: pendientes, color: '#f59e0b', bg: '#fef3c7', total: citas.length },
            { label: 'Canceladas', value: canceladas, color: '#ef4444', bg: '#fee2e2', total: citas.length },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>{item.label}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '99px',
                  background: item.color,
                  width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>TOTAL CITAS</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>{citas.length}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard