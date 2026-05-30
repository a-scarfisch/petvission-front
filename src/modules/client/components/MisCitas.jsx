import { useState } from 'react'
import { useClientContext } from '@/modules/client/states/ClientContext'
import ClientLayout from './ClientLayout'
import apiClient from '@/modules/core/lib/apiClient'

const ESTADOS = ['Todas', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA']

const estadoEstilo = {
  CONFIRMADA: { background: '#d1fae5', color: '#065f46' },
  PENDIENTE: { background: '#fef3c7', color: '#92400e' },
  CANCELADA: { background: '#fee2e2', color: '#991b1b' },
}

const MisCitas = () => {
  const { citas, updateCita } = useClientContext()
  const [filtro, setFiltro] = useState('Todas')
  const [loadingId, setLoadingId] = useState(null)

  const citasFiltradas = filtro === 'Todas'
    ? citas
    : citas.filter((c) => c.estado === filtro)

  const handleCancelar = async (idReserva) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return
    setLoadingId(idReserva)
    try {
      const { data } = await apiClient.patch(`/reservas/${idReserva}/cancelar`)
      updateCita(data.data)
    } catch (err) {
      alert('Error al cancelar la cita')
    } finally {
      setLoadingId(null)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return '—'
    const [year, month, day] = fecha.split('-')
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    return `${day} ${meses[parseInt(month) - 1]} ${year}`
  }

  const formatHora = (hora) => {
    if (!hora) return '—'
    return hora.slice(0, 5) // "10:00:00" → "10:00"
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>📅 Mis Citas</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Gestiona y revisa todas las citas de tus mascotas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
              cursor: 'pointer', fontWeight: filtro === e ? 600 : 400,
              background: filtro === e ? '#2a9d8f' : '#fff',
              color: filtro === e ? '#fff' : '#374151',
              border: filtro === e ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Listado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {citasFiltradas.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '48px',
            textAlign: 'center', color: '#9ca3af',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
            <p>No tienes citas {filtro !== 'Todas' ? filtro.toLowerCase() + 's' : ''}.</p>
          </div>
        ) : (
          citasFiltradas.map((c) => (
            <div key={c.idReserva} style={{
              background: '#fff', borderRadius: '12px', padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: '20px',
            }}>
              {/* Fecha */}
              <div style={{
                minWidth: '56px', textAlign: 'center',
                background: '#e8f5f0', borderRadius: '10px', padding: '10px 8px',
              }}>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#2a9d8f' }}>
                  {c.fecha?.split('-')[2]}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#2a9d8f', textTransform: 'uppercase' }}>
                  {formatFecha(c.fecha).split(' ')[1]}
                </p>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>
                  {c.motivo ?? 'Consulta'}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  🕐 {formatHora(c.hora)} · 👨‍⚕️ {c.nombreVeterinario} · 👤 {c.nombreCliente}
                </p>
              </div>

              {/* Estado */}
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                ...(estadoEstilo[c.estado] ?? { background: '#f3f4f6', color: '#374151' }),
              }}>
                {c.estado}
              </span>

              {/* Acciones */}
              {c.estado !== 'CANCELADA' && (
                <button
                  onClick={() => handleCancelar(c.idReserva)}
                  disabled={loadingId === c.idReserva}
                  style={{
                    background: 'none', border: '1px solid #ef4444',
                    color: '#ef4444', padding: '7px 14px',
                    borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                    opacity: loadingId === c.idReserva ? 0.6 : 1,
                  }}
                >
                  {loadingId === c.idReserva ? 'Cancelando...' : '✕ Cancelar'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </ClientLayout>
  )
}

export default MisCitas