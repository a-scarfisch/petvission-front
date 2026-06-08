import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import ClientLayout from './ClientLayout'
import Skeleton from '@/modules/core/components/Skeleton'
import '@/styles/global.css'

const especieEmoji = (especie) =>
  especie?.toUpperCase() === 'GATO' ? '🐱' : '🐶'

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  return new Date().getFullYear() - new Date(fechaNacimiento).getFullYear()
}

const ClientDashboard = () => {
  const { user } = useAuthContext()
  const { mascotas, citas, loading } = useClientContext()

  const proximasCitas = citas
    .filter((c) => c.estado === 'CONFIRMADA' || c.estado === 'PENDIENTE')
    .slice(0, 3)

  if (loading) return (
    <ClientLayout>
      <div className="pv-banner" style={{ gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <Skeleton height="22px" width="40%" style={{ marginBottom: '10px' }} />
          <Skeleton height="14px" width="60%" />
        </div>
        <Skeleton height="40px" width="130px" radius="10px" />
      </div>
      <div className="pv-stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="pv-stat-card">
            <Skeleton height="13px" width="55%" style={{ marginBottom: '14px' }} />
            <Skeleton height="30px" width="40%" />
          </div>
        ))}
      </div>
      <div className="pv-grid-2">
        {[1, 2].map((i) => (
          <div key={i} className="pv-card">
            <Skeleton height="16px" width="45%" style={{ marginBottom: '18px' }} />
            {[1, 2, 3].map((j) => (
              <div key={j} className="pv-list-row">
                <Skeleton height="40px" width="40px" radius="50%" />
                <div style={{ flex: 1 }}>
                  <Skeleton height="13px" width="65%" style={{ marginBottom: '7px' }} />
                  <Skeleton height="11px" width="45%" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ClientLayout>
  )

  const stats = [
    { label: 'Mis mascotas',  value: mascotas.length,                                      icon: '🐾' },
    { label: 'Total citas',   value: citas.length,                                          icon: '📋' },
    { label: 'Pendientes',    value: citas.filter((c) => c.estado === 'PENDIENTE').length,  icon: '🔔' },
    { label: 'Confirmadas',   value: citas.filter((c) => c.estado === 'CONFIRMADA').length, icon: '✅' },
  ]

  if (mascotas.length === 0) {
    return (
      <ClientLayout>
        <div className="pv-banner">
          <div>
            <p className="pv-banner__title">¡Hola, {user?.nombres}! 👋</p>
            <p className="pv-banner__sub">Bienvenido a PetVission</p>
          </div>
        </div>
        <div className="pv-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🐾</p>
          <p style={{ fontWeight: 700, fontSize: '18px', margin: '0 0 8px' }}>
            Agrega tu primera mascota para comenzar
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
            Una vez registrada podrás agendar citas y ver su historial clínico.
          </p>
          <Link to="/client/mascotas" className="pv-btn-primary">
            + Registrar mascota
          </Link>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      {/* Banner */}
      <div className="pv-banner">
        <div>
          <p className="pv-banner__title">¡Hola, {user?.nombres}! 👋</p>
          <p className="pv-banner__sub">Aquí tienes un resumen del estado de tus mascotas</p>
        </div>
        <Link to="/client/citas/nueva" className="pv-banner__btn">📅 Nueva cita</Link>
      </div>

      {/* Stats */}
      <div className="pv-stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="pv-stat-card">
            <p className="pv-stat-card__label">{s.label}</p>
            <div className="pv-stat-card__row">
              <span className="pv-stat-card__icon">{s.icon}</span>
              <span className="pv-stat-card__value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid inferior */}
      <div className="pv-grid-2">
        {/* Mis mascotas */}
        <div className="pv-card">
          <div className="pv-section-header">
            <p className="pv-section-title">🐾 Mis Mascotas</p>
            <Link to="/client/mascotas" className="pv-section-link">+ Agregar</Link>
          </div>
          {mascotas.length === 0 ? (
            <div className="pv-empty">
              <p className="pv-empty__icon">🐾</p>
              <p className="pv-empty__text">No tienes mascotas registradas aún.</p>
            </div>
          ) : (
            mascotas.map((m) => (
              <div key={m.idMascota} className="pv-list-row">
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#e8f5f0', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  flexShrink: 0,
                }}>
                  {especieEmoji(m.especie)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{m.nombre}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {m.raza ?? m.especie}{calcularEdad(m.fechaNacimiento) != null ? ` · ${calcularEdad(m.fechaNacimiento)} años` : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Próximas citas */}
        <div className="pv-card">
          <div className="pv-section-header">
            <p className="pv-section-title">📅 Próximas Citas</p>
            <Link to="/client/reservas" className="pv-section-link">Ver todas</Link>
          </div>
          {proximasCitas.length === 0 ? (
            <div className="pv-empty">
              <p className="pv-empty__icon">📅</p>
              <p className="pv-empty__text">No tienes citas activas.</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>
                ¿Todo bien? Agenda un control rutinario para mantener a tu mascota saludable.
              </p>
            </div>
          ) : (
            proximasCitas.map((c) => (
              <div key={c.idReserva} className="pv-list-row">
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px' }}>
                    {c.motivo ?? 'Consulta'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {c.fecha} · {c.hora?.slice(0, 5)}
                  </p>
                </div>
                <span className={`pv-badge pv-badge--${c.estado}`}>{c.estado}</span>
              </div>
            ))
          )}
          <Link to="/client/citas/nueva" className="pv-btn-outline" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
            📅 Agendar nueva cita
          </Link>
        </div>
      </div>
    </ClientLayout>
  )
}

export default ClientDashboard
