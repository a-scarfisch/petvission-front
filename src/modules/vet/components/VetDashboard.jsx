import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'
import { Link } from 'react-router-dom'

const estadoEstilo = {
  CONFIRMADA: { background: '#d1fae5', color: '#065f46' },
  PENDIENTE: { background: '#fef3c7', color: '#92400e' },
  CANCELADA: { background: '#fee2e2', color: '#991b1b' },
  REPROGRAMADA: { background: '#e0e7ff', color: '#3730a3' },
}

const VetDashboard = () => {
  const { user } = useAuthContext()
  const { citas, loading } = useVetContext()

  const hoy = new Date().toISOString().split('T')[0]
  const citasHoy = citas.filter((c) => c.fecha === hoy)
  const confirmadas = citas.filter((c) => c.estado === 'CONFIRMADA').length
  const pendientes = citas.filter((c) => c.estado === 'PENDIENTE').length
  const canceladas = citas.filter((c) => c.estado === 'CANCELADA').length

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (loading) return <VetLayout><p>Cargando...</p></VetLayout>

  return (
    <VetLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Dashboard del Veterinario</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px', textTransform: 'capitalize' }}>
            {fechaHoy}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Citas Hoy', value: citasHoy.length, icon: '📅', color: '#3b82f6' },
          { label: 'Confirmadas', value: confirmadas, icon: '✅', color: '#10b981' },
          { label: 'Pendientes', value: pendientes, icon: '⏳', color: '#f59e0b' },
          { label: 'Canceladas', value: canceladas, icon: '❌', color: '#ef4444' },
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

      {/* Citas del día */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Citas del Día</h3>
          <Link to="/vet/citas" style={{ color: '#2a9d8f', fontSize: '13px', textDecoration: 'none' }}>
            Ver todas
          </Link>
        </div>

        {citasHoy.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
            <p>No tienes citas para hoy.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Hora', 'Paciente', 'Cliente', 'Motivo', 'Estado'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: '12px', color: '#6b7280', fontWeight: 600,
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasHoy.map((c) => (
                <tr key={c.idCita} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2a9d8f', fontSize: '15px' }}>
                    {formatHora(c.hora)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                    {c.nombreMascota ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                    {c.nombreCliente}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>
                    {c.motivo ?? 'Consulta general'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      ...(estadoEstilo[c.estado] ?? { background: '#f3f4f6', color: '#374151' }),
                    }}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </VetLayout>
  )
}

export default VetDashboard