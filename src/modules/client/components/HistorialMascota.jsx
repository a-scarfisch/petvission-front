import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { getHistorialMascota } from '../services/historialClienteService'
import { handleError } from '@/modules/core/lib/errorHandler'
import ClientLayout from './ClientLayout'
import '@/styles/modules/historial.css'

const especieEmoji = (especie) => {
  const map = { GATO: '🐱', AVE: '🐦', OTRO: '🐹' }
  return map[especie?.toUpperCase()] ?? '🐶'
}

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  return new Date().getFullYear() - new Date(fechaNacimiento).getFullYear()
}

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—'
  return new Date(fechaStr).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const HistorialMascota = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mascotas } = useClientContext()

  const mascotaId = searchParams.get('mascotaId')
  const mascota = mascotas.find((m) => String(m.idMascota) === mascotaId) ?? null

  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mascotaId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getHistorialMascota(mascotaId)
        setHistorial(data)
      } catch (err) {
        setError(handleError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mascotaId])

  if (!mascotaId) {
    return (
      <ClientLayout>
        <div className="historial-empty">
          <p className="historial-empty__icon">🐾</p>
          <p>No se especificó una mascota.</p>
          <button className="historial-btn-back" onClick={() => navigate('/client/mascotas')}>
            ← Volver a Mis Mascotas
          </button>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div className="historial-page-header">
        <div>
          <button className="historial-btn-back" onClick={() => navigate('/client/mascotas')}>
            ← Volver a Mis Mascotas
          </button>
          <h2 className="historial-page-title">📋 Historial Clínico</h2>
        </div>
      </div>

      {/* Ficha mascota */}
      {mascota && (
        <div className="historial-ficha">
          <div className="historial-ficha__avatar">{especieEmoji(mascota.especie)}</div>
          <div>
            <h3 className="historial-ficha__nombre">{mascota.nombre}</h3>
            <p className="historial-ficha__meta">
              {mascota.especie}{mascota.raza ? ` · ${mascota.raza}` : ''}
            </p>
            <div className="historial-ficha__chips">
              {mascota.sexo && <span className="historial-chip">{mascota.sexo}</span>}
              {calcularEdad(mascota.fechaNacimiento) !== null && (
                <span className="historial-chip">{calcularEdad(mascota.fechaNacimiento)} años</span>
              )}
              {mascota.peso && <span className="historial-chip">{mascota.peso} kg</span>}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <p className="historial-loading">Cargando historial...</p>
      ) : error ? (
        <div className="historial-empty">
          <p className="historial-empty__icon">⚠️</p>
          <p>{error}</p>
        </div>
      ) : historial.length === 0 ? (
        <div className="historial-empty">
          <p className="historial-empty__icon">📋</p>
          <p>No hay registros en el historial clínico.</p>
        </div>
      ) : (
        <div className="historial-timeline">
          {historial.map((h) => (
            <div key={h.idHistorial} className="historial-timeline-item">
              <div className="historial-timeline-item__meta">
                <span className="historial-timeline-item__fecha">{formatFecha(h.fechaRegistro)}</span>
                <span className="historial-timeline-item__vet">Dr. {h.nombreVeterinario}</span>
              </div>

              <p className="historial-timeline-item__label">Diagnóstico</p>
              <p className="historial-timeline-item__body">{h.diagnostico}</p>

              {h.tratamientos?.length > 0 && h.tratamientos.map((t) => (
                <div key={t.idTratamiento} className="historial-timeline-item__section">
                  <p className="historial-timeline-item__label">Tratamiento</p>
                  <p className="historial-timeline-item__body">{t.descripcion}</p>
                  {t.indicaciones && (
                    <p className="historial-timeline-item__body" style={{ color: '#6b7280', marginTop: '4px' }}>
                      Indicaciones: {t.indicaciones}
                    </p>
                  )}
                  {t.duracion && (
                    <p className="historial-timeline-item__body" style={{ color: '#6b7280' }}>
                      Duración: {t.duracion}
                    </p>
                  )}
                </div>
              ))}

              {h.receta && (
                <div className="historial-timeline-item__section">
                  <p className="historial-timeline-item__label">Receta</p>
                  <p className="historial-timeline-item__body">{h.receta}</p>
                </div>
              )}

              {h.observaciones && (
                <div className="historial-timeline-item__section">
                  <p className="historial-timeline-item__label">Observaciones</p>
                  <p className="historial-timeline-item__body">{h.observaciones}</p>
                </div>
              )}

              {h.peso && (
                <div className="historial-timeline-item__section">
                  <p className="historial-timeline-item__label">Peso registrado</p>
                  <p className="historial-timeline-item__body">{h.peso} kg</p>
                </div>
              )}

              {h.vacunas?.length > 0 && (
                <div className="historial-timeline-item__section">
                  <p className="historial-timeline-item__label">Vacunas aplicadas</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {h.vacunas.map((v) => (
                      <span key={v.idVacunacion} className="historial-vacuna-tag">
                        💉 {v.nombreVacuna}
                        {v.proximaDosis && ` · próxima: ${v.proximaDosis}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  )
}

export default HistorialMascota
