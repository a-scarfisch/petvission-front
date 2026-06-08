import { Link } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'
import Skeleton from '@/modules/core/components/Skeleton'

const formatHora = (hora) => {
  if (!hora) return '—'
  if (Array.isArray(hora)) {
    const [h, m = 0] = hora
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return hora.toString().slice(0, 5)
}

const turnoActual = () => {
  const h = new Date().getHours()
  if (h >= 6  && h < 13) return 'MAÑANA'
  if (h >= 13 && h < 20) return 'TARDE'
  return 'NOCHE'
}

const proximaReserva = (reservasHoy) => {
  const ahoraStr = new Date().toTimeString().slice(0, 5)
  const proxima = reservasHoy.find((r) => formatHora(r.hora) > ahoraStr)
  return proxima ? formatHora(proxima.hora) : '—'
}

const STATS = (reservasHoy, pacientes) => [
  { label: 'Reservas hoy',    value: reservasHoy.length,       icon: '📅', color: '#3b82f6' },
  { label: 'Mis pacientes',   value: pacientes.length,          icon: '🐾', color: '#2a9d8f' },
  { label: 'Próxima reserva', value: proximaReserva(reservasHoy), icon: '⏰', color: '#f59e0b' },
  { label: 'Turno actual',    value: turnoActual(),             icon: '🕐', color: '#8b5cf6' },
]

const VetDashboard = () => {
  const { user } = useAuthContext()
  const { reservasHoy, pacientes, loading } = useVetContext()

  const fechaHoy = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  if (loading) return (
    <VetLayout>
      <div className="vet-page-header">
        <div>
          <Skeleton height="24px" width="45%" style={{ marginBottom: '10px' }} />
          <Skeleton height="14px" width="60%" />
        </div>
      </div>
      <div className="vet-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="vet-stat-card">
            <Skeleton height="13px" width="55%" style={{ marginBottom: '14px' }} />
            <Skeleton height="30px" width="40%" />
          </div>
        ))}
      </div>
      <div className="vet-section">
        <div className="vet-section__header" style={{ marginBottom: '16px' }}>
          <Skeleton height="16px" width="30%" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
            <Skeleton height="14px" width="50px" radius="4px" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Skeleton height="28px" width="28px" radius="50%" />
              <Skeleton height="13px" width="80px" />
            </div>
            <Skeleton height="13px" width="90px" />
            <Skeleton height="13px" width="80px" />
            <Skeleton height="22px" width="80px" radius="12px" />
          </div>
        ))}
      </div>
    </VetLayout>
  )

  return (
    <VetLayout>
      <div className="vet-page-header">
        <div>
          <h2 className="vet-page-title">Bienvenido, {user?.nombres}</h2>
          <p className="vet-page-subtitle vet-page-subtitle--capitalize">{fechaHoy}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="vet-stats-grid">
        {STATS(reservasHoy, pacientes).map((s) => (
          <div key={s.label} className="vet-stat-card">
            <p className="vet-stat-card__label">{s.label}</p>
            <div className="vet-stat-card__row">
              <span className="vet-stat-card__icon">{s.icon}</span>
              <span className="vet-stat-card__value" style={{ color: s.color }}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reservas del día */}
      <div className="vet-section">
        <div className="vet-section__header">
          <h3 className="vet-section__title">Reservas del día</h3>
          <Link to="/vet/citas" className="vet-section__link">Ver todas →</Link>
        </div>

        {reservasHoy.length === 0 ? (
          <div className="vet-empty">
            <p className="vet-empty__icon">📅</p>
            <p>No tienes reservas para hoy.</p>
          </div>
        ) : (
          <table className="vet-table">
            <thead>
              <tr>
                {['Hora', 'Paciente', 'Dueño', 'Categoría', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservasHoy.map((r) => (
                <tr key={r.idReserva}>
                  <td className="vet-hora">{formatHora(r.hora)}</td>
                  <td>
                    <div className="vet-mascota-cell">
                      <div className="vet-mascota-avatar">🐾</div>
                      <span className="vet-mascota-nombre">{r.nombreMascota ?? '—'}</span>
                    </div>
                  </td>
                  <td>{r.nombreCliente}</td>
                  <td>{r.categoriaReserva ?? r.motivo ?? '—'}</td>
                  <td>
                    <span className={`vet-estado vet-estado--${r.estado}`}>
                      {r.estado}
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
