import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'

const ESTADOS = ['Todas', 'PENDIENTE', 'CONFIRMADA', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA']

const estadoEstilo = {
  CONFIRMADA:  { background: '#d1fae5', color: '#065f46' },
  PENDIENTE:   { background: '#fef3c7', color: '#92400e' },
  EN_ATENCION: { background: '#dbeafe', color: '#1e40af' },
  CANCELADA:   { background: '#fee2e2', color: '#991b1b' },
  REPROGRAMADA:{ background: '#e0e7ff', color: '#3730a3' },
  COMPLETADA:  { background: '#f3f4f6', color: '#374151' },
}

const btnPrimario = {
  background: '#2a9d8f', border: 'none', color: '#fff',
  padding: '7px 14px', borderRadius: '8px',
  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
}

const btnSecundario = (color = '#2a9d8f') => ({
  background: 'none', border: `1px solid ${color}`, color,
  padding: '7px 14px', borderRadius: '8px',
  cursor: 'pointer', fontSize: '13px',
})

const VetCitas = () => {
  const navigate = useNavigate()
  const { citas, loading, updateCita } = useVetContext()
  const [filtro, setFiltro] = useState('Todas')
  const [loadingId, setLoadingId] = useState(null)
  const [reprogramando, setReprogramando] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  const citasFiltradas = filtro === 'Todas'
    ? citas
    : citas.filter((c) => c.estado === filtro)

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  const handleAbrirFicha = async (cita) => {
    setLoadingId(cita.idReserva)
    try {
      const { data } = await apiClient.patch(`/reservas/${cita.idReserva}/iniciarAtencion`)
      updateCita(data.data)
      navigate(`/vet/ficha-mascota?mascotaId=${cita.idMascota}&reservaId=${cita.idReserva}`)
    } catch (err) {
      alert(handleError(err))
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancelar = async (idReserva) => {
    setLoadingId(idReserva)
    try {
      const { data } = await apiClient.patch(`/reservas/${idReserva}/cancelar`)
      updateCita(data.data)
    } catch (err) {
      alert(handleError(err))
    } finally {
      setLoadingId(null)
    }
  }

  const handleReprogramar = async (idReserva) => {
    if (!nuevaFecha || !nuevaHora) return
    setLoadingId(idReserva)
    try {
      const { data } = await apiClient.patch(`/reservas/${idReserva}/reprogramar`, {
        nuevaFecha,
        nuevaHora: `${nuevaHora}:00`,
      })
      updateCita(data.data)
      setReprogramando(null)
      setNuevaFecha('')
      setNuevaHora('')
    } catch {
      alert('Error al reprogramar la cita')
    } finally {
      setLoadingId(null)
    }
  }

  if (loading) return <VetLayout><p>Cargando...</p></VetLayout>

  return (
    <VetLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>📅 Mis Citas</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Gestiona todas tus citas
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
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
            {e === 'EN_ATENCION' ? 'En atención' : e.charAt(0) + e.slice(1).toLowerCase()}
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
            <p>No hay citas {filtro !== 'Todas' ? `con estado ${filtro.toLowerCase()}` : ''}.</p>
          </div>
        ) : (
          citasFiltradas.map((c) => (
            <div key={c.idReserva}>
              <div className="reserva-card" style={{
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
                    {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-CL', { month: 'short' })}
                  </p>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>
                    {c.motivo ?? 'Consulta general'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    🕐 {formatHora(c.hora)} · 👤 {c.nombreCliente}
                    {c.nombreMascota && ` · 🐾 ${c.nombreMascota}`}
                  </p>
                </div>

                {/* Estado */}
                <span style={{
                  padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                  ...(estadoEstilo[c.estado] ?? { background: '#f3f4f6', color: '#374151' }),
                }}>
                  {c.estado === 'EN_ATENCION' ? 'En atención' : c.estado}
                </span>

                {/* Acciones PENDIENTE */}
                {c.estado === 'PENDIENTE' && (
                  <div className="reserva-card__acciones" style={{ display: 'flex', gap: '8px' }}>
                    {c.idMascota && (
                      <button
                        onClick={() => handleAbrirFicha(c)}
                        disabled={loadingId === c.idReserva}
                        style={{ ...btnPrimario, opacity: loadingId === c.idReserva ? 0.6 : 1 }}
                      >
                        {loadingId === c.idReserva ? 'Abriendo...' : '🩺 Atender'}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                      style={{ ...btnSecundario('#ef4444'), opacity: loadingId === c.idReserva ? 0.6 : 1 }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                )}

                {/* Acciones CONFIRMADA */}
                {c.estado === 'CONFIRMADA' && (
                  <div className="reserva-card__acciones" style={{ display: 'flex', gap: '8px' }}>
                    {c.idMascota && (
                      <button
                        onClick={() => handleAbrirFicha(c)}
                        disabled={loadingId === c.idReserva}
                        style={{ ...btnPrimario, opacity: loadingId === c.idReserva ? 0.6 : 1 }}
                      >
                        {loadingId === c.idReserva ? 'Abriendo...' : '🩺 Atender'}
                      </button>
                    )}
                    <button
                      onClick={() => setReprogramando(reprogramando === c.idReserva ? null : c.idReserva)}
                      style={btnSecundario()}
                    >
                      📅 Reprogramar
                    </button>
                    <button
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                      style={{ ...btnSecundario('#ef4444'), opacity: loadingId === c.idReserva ? 0.6 : 1 }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                )}

                {/* Acciones EN_ATENCION */}
                {c.estado === 'EN_ATENCION' && c.idMascota && (
                  <div className="reserva-card__acciones" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/vet/ficha-mascota?mascotaId=${c.idMascota}&reservaId=${c.idReserva}`)}
                      style={btnPrimario}
                    >
                      📋 Continuar ficha
                    </button>
                    <button
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                      style={{ ...btnSecundario('#ef4444'), opacity: loadingId === c.idReserva ? 0.6 : 1 }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                )}

                {/* Acciones COMPLETADA */}
                {c.estado === 'COMPLETADA' && c.idMascota && (
                  <div className="reserva-card__acciones" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/vet/historial?mascotaId=${c.idMascota}`)}
                      style={btnSecundario('#6366f1')}
                    >
                      📋 Ver historial
                    </button>
                  </div>
                )}
              </div>

              {/* Form reprogramar */}
              {reprogramando === c.idReserva && (
                <div style={{
                  background: '#f9fafb', borderRadius: '0 0 12px 12px',
                  padding: '16px 24px', border: '1px solid #e5e7eb',
                  borderTop: 'none', display: 'flex', gap: '12px', alignItems: 'flex-end',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Nueva fecha
                    </label>
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Nueva hora
                    </label>
                    <input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    />
                  </div>
                  <button
                    onClick={() => handleReprogramar(c.idReserva)}
                    disabled={loadingId === c.idReserva || !nuevaFecha || !nuevaHora}
                    style={{
                      ...btnPrimario,
                      padding: '9px 20px',
                      opacity: !nuevaFecha || !nuevaHora ? 0.5 : 1,
                    }}
                  >
                    {loadingId === c.idReserva ? 'Guardando...' : 'Confirmar'}
                  </button>
                  <button
                    onClick={() => setReprogramando(null)}
                    style={{
                      background: 'none', border: '1px solid #d1d5db',
                      padding: '9px 16px', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </VetLayout>
  )
}

export default VetCitas
