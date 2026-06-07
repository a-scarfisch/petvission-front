import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import '@/styles/modules/vet.css'

const ESTADOS = ['Todas', 'PENDIENTE', 'CONFIRMADA', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA', 'REPROGRAMADA']

const estadoLabel = (e) =>
  e === 'EN_ATENCION' ? 'En atención' : e.charAt(0) + e.slice(1).toLowerCase()

const VetCitas = () => {
  const navigate = useNavigate()
  const { citas, loading, updateCita } = useVetContext()
  const [filtro, setFiltro] = useState('Todas')
  const [loadingId, setLoadingId] = useState(null)
  const [reprogramando, setReprogramando] = useState(null)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [nuevaHora, setNuevaHora] = useState('')

  const citasFiltradas = filtro === 'Todas'
    ? citas.filter((c) => c.estado !== 'CANCELADA')
    : citas.filter((c) => c.estado === filtro)

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

  if (loading) return <VetLayout><p className="vet-loading">Cargando...</p></VetLayout>

  return (
    <VetLayout>
      <div className="vet-page-header">
        <div>
          <h2 className="vet-page-title">📅 Mis Citas</h2>
          <p className="vet-page-subtitle">Gestiona todas tus citas</p>
        </div>
      </div>

      <div className="vet-toolbar">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`vet-filtro-btn${filtro === e ? ' vet-filtro-btn--active' : ''}`}
          >
            {e === 'Todas' ? 'Todas' : estadoLabel(e)}
          </button>
        ))}
      </div>

      <div className="vet-lista">
        {citasFiltradas.length === 0 ? (
          <div className="vet-section">
            <div className="vet-empty">
              <p className="vet-empty__icon">📅</p>
              <p>No hay citas {filtro !== 'Todas' ? `con estado ${filtro.toLowerCase()}` : ''}.</p>
            </div>
          </div>
        ) : (
          citasFiltradas.map((c) => (
            <div key={c.idReserva}>
              <div className="vet-cita-card">
                <div className="vet-fecha">
                  <p className="vet-fecha__dia">{c.fecha?.split('-')[2]}</p>
                  <p className="vet-fecha__mes">
                    {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-CL', { month: 'short' })}
                  </p>
                </div>

                <div className="vet-cita-info">
                  <p className="vet-cita-info__titulo">{c.motivo ?? 'Consulta general'}</p>
                  <p className="vet-cita-info__sub">
                    🕐 {c.hora?.slice(0, 5) ?? '—'} · 👤 {c.nombreCliente}
                    {c.nombreMascota && ` · 🐾 ${c.nombreMascota}`}
                  </p>
                </div>

                <span className={`vet-estado vet-estado--${c.estado}`}>
                  {estadoLabel(c.estado)}
                </span>

                <div className="vet-cita-acciones">
                  {c.estado === 'PENDIENTE' && <>
                    {c.idMascota && (
                      <button
                        className="vet-btn-sm vet-btn-sm--primary"
                        onClick={() => handleAbrirFicha(c)}
                        disabled={loadingId === c.idReserva}
                      >
                        {loadingId === c.idReserva ? 'Abriendo...' : '🩺 Atender'}
                      </button>
                    )}
                    <button
                      className="vet-btn-sm vet-btn-sm--danger"
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                    >
                      ✕ Cancelar
                    </button>
                  </>}

                  {c.estado === 'CONFIRMADA' && <>
                    {c.idMascota && (
                      <button
                        className="vet-btn-sm vet-btn-sm--primary"
                        onClick={() => handleAbrirFicha(c)}
                        disabled={loadingId === c.idReserva}
                      >
                        {loadingId === c.idReserva ? 'Abriendo...' : '🩺 Atender'}
                      </button>
                    )}
                    <button
                      className="vet-btn-sm vet-btn-sm--outline"
                      onClick={() => setReprogramando(reprogramando === c.idReserva ? null : c.idReserva)}
                    >
                      📅 Reprogramar
                    </button>
                    <button
                      className="vet-btn-sm vet-btn-sm--danger"
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                    >
                      ✕ Cancelar
                    </button>
                  </>}

                  {c.estado === 'EN_ATENCION' && c.idMascota && <>
                    <button
                      className="vet-btn-sm vet-btn-sm--primary"
                      onClick={() => navigate(`/vet/ficha-mascota?mascotaId=${c.idMascota}&reservaId=${c.idReserva}`)}
                    >
                      📋 Continuar ficha
                    </button>
                    <button
                      className="vet-btn-sm vet-btn-sm--danger"
                      onClick={() => handleCancelar(c.idReserva)}
                      disabled={loadingId === c.idReserva}
                    >
                      ✕ Cancelar
                    </button>
                  </>}

                  {c.estado === 'COMPLETADA' && c.idMascota && (
                    <button
                      className="vet-btn-sm vet-btn-sm--indigo"
                      onClick={() => navigate(`/vet/historial?mascotaId=${c.idMascota}`)}
                    >
                      📋 Ver historial
                    </button>
                  )}
                </div>
              </div>

              {reprogramando === c.idReserva && (
                <div className="vet-reprog-form">
                  <div className="vet-reprog-form__field">
                    <label className="vet-reprog-form__label">Nueva fecha</label>
                    <input
                      type="date"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(e.target.value)}
                      className="vet-reprog-form__input"
                    />
                  </div>
                  <div className="vet-reprog-form__field">
                    <label className="vet-reprog-form__label">Nueva hora</label>
                    <input
                      type="time"
                      value={nuevaHora}
                      onChange={(e) => setNuevaHora(e.target.value)}
                      className="vet-reprog-form__input"
                    />
                  </div>
                  <button
                    className="vet-btn-primary"
                    onClick={() => handleReprogramar(c.idReserva)}
                    disabled={loadingId === c.idReserva || !nuevaFecha || !nuevaHora}
                  >
                    {loadingId === c.idReserva ? 'Guardando...' : 'Confirmar'}
                  </button>
                  <button className="vet-btn-secondary" onClick={() => setReprogramando(null)}>
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
