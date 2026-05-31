import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import ClientLayout from './ClientLayout'
import '@/styles/modules/client-layout.css'

const ClientDashboard = () => {
  const { user } = useAuthContext()
  const { mascotas, citas, loading } = useClientContext()

  const proximasCitas = citas
    .filter((c) => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE')
    .slice(0, 3)

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    return hoy.getFullYear() - nacimiento.getFullYear()
  }

  if (loading) return <ClientLayout><p>Cargando...</p></ClientLayout>

  return (
    <ClientLayout>
      {/* Saludo */}
      <div className="cl-banner">
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>¡Hola, {user?.nombres}! 👋</h2>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '14px' }}>
            Aquí tienes un resumen del estado de tus mascotas
          </p>
        </div>
        <Link to="/client/citas/nueva" className="cl-banner__btn">
          📅 Nueva cita
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Mis mascotas', value: mascotas.length, icon: '🐾' },
          { label: 'Cita próxima', value: proximasCitas.length > 0 ? 1 : 0, icon: '📅' },
          { label: 'Total citas', value: citas.length, icon: '📋' },
          { label: 'Pendientes', value: citas.filter(c => c.estado === 'PENDIENTE').length, icon: '🔔' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: '12px',
            padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <span style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Mis mascotas */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>🐾 Mis Mascotas</h3>
            <Link to="/client/mascotas" style={{ color: '#2a9d8f', fontSize: '13px', textDecoration: 'none' }}>
              + Agregar
            </Link>
          </div>
          {mascotas.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No tienes mascotas registradas aún.</p>
          ) : (
            mascotas.map((m) => (
              <div key={m.idMascota} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0', borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#e8f5f0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  {m.especie?.toUpperCase() === 'GATO' ? '🐱' : '🐶'}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{m.nombre}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {m.raza} · {calcularEdad(m.fechaNacimiento) ?? '?'} años
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Próximas citas */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>📅 Próximas Citas</h3>
            <Link to="/client/citas" style={{ color: '#2a9d8f', fontSize: '13px', textDecoration: 'none' }}>
              Ver todas
            </Link>
          </div>
          {proximasCitas.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>No tienes citas próximas.</p>
          ) : (
            proximasCitas.map((c) => (
              <div key={c.idReserva} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px' }}>{c.motivo ?? 'Consulta'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{c.fecha} · {c.hora}</p>
                <span style={{
                  display: 'inline-block', marginTop: '4px',
                  padding: '2px 8px', borderRadius: '99px', fontSize: '11px',
                  background: c.estado === 'CONFIRMADA' ? '#d1fae5' : '#fef3c7',
                  color: c.estado === 'CONFIRMADA' ? '#065f46' : '#92400e',
                }}>
                  {c.estado}
                </span>
              </div>
            ))
          )}
          <Link to="/client/citas/nueva" style={{
            display: 'block', marginTop: '16px', textAlign: 'center',
            padding: '10px', borderRadius: '8px', border: '1px solid #2a9d8f',
            color: '#2a9d8f', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
          }}>
            📅 Agendar nueva cita
          </Link>
        </div>
      </div>
    </ClientLayout>
  )
}

export default ClientDashboard