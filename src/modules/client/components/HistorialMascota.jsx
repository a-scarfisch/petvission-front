import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useClientContext } from '@/modules/client/states/ClientContext'
import {
  getHistorialMascota,
  getVacunasMascota,
  getCatalogoVacunas,
} from '../services/historialClienteService'
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

const TABS = ['Historial Clínico', 'Vacunación']

const HistorialMascota = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mascotas } = useClientContext()

  const mascotaId = searchParams.get('mascotaId')
  const mascota = mascotas.find((m) => String(m.idMascota) === mascotaId) ?? null

  const [activeTab, setActiveTab] = useState('Historial Clínico')

  const [historial, setHistorial] = useState([])
  const [loadingHistorial, setLoadingHistorial] = useState(true)
  const [errorHistorial, setErrorHistorial] = useState(null)

  const [vacunas, setVacunas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [loadingVacunas, setLoadingVacunas] = useState(false)
  const [errorVacunas, setErrorVacunas] = useState(null)

  useEffect(() => {
    if (!mascotaId) return
    setLoadingHistorial(true)
    setErrorHistorial(null)
    getHistorialMascota(mascotaId)
      .then(setHistorial)
      .catch((err) => setErrorHistorial(handleError(err)))
      .finally(() => setLoadingHistorial(false))
  }, [mascotaId])

  useEffect(() => {
    if (!mascotaId || activeTab !== 'Vacunación') return
    if (vacunas.length > 0 || catalogo.length > 0) return // ya cargado

    setLoadingVacunas(true)
    setErrorVacunas(null)
    Promise.all([
      getVacunasMascota(mascotaId),
      getCatalogoVacunas(mascota?.especie),
    ])
      .then(([vacsData, catData]) => {
        setVacunas(vacsData)
        setCatalogo(catData)
      })
      .catch((err) => setErrorVacunas(handleError(err)))
      .finally(() => setLoadingVacunas(false))
  }, [activeTab, mascotaId, mascota?.especie])

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
          <h2 className="historial-page-title">
            {activeTab === 'Historial Clínico' ? '📋 Historial Clínico' : '💉 Vacunación'}
          </h2>
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

      {/* Tabs */}
      <div className="historial-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`historial-tab-btn${activeTab === tab ? ' historial-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'Historial Clínico' ? '📋' : '💉'} {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Historial Clínico ── */}
      {activeTab === 'Historial Clínico' && (
        loadingHistorial ? (
          <p className="historial-loading">Cargando historial...</p>
        ) : errorHistorial ? (
          <div className="historial-empty">
            <p className="historial-empty__icon">⚠️</p>
            <p>{errorHistorial}</p>
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
        )
      )}

      {/* ── Tab: Vacunación ── */}
      {activeTab === 'Vacunación' && (
        loadingVacunas ? (
          <p className="historial-loading">Cargando vacunas...</p>
        ) : errorVacunas ? (
          <div className="historial-empty">
            <p className="historial-empty__icon">⚠️</p>
            <p>{errorVacunas}</p>
          </div>
        ) : (
          <div className="historial-vacunacion">

            {/* Vacunas aplicadas */}
            <div className="historial-seccion">
              <h3 className="historial-seccion__titulo">Vacunas aplicadas</h3>

              {vacunas.length === 0 ? (
                <div className="historial-empty" style={{ padding: '32px' }}>
                  <p className="historial-empty__icon" style={{ fontSize: '28px' }}>💉</p>
                  <p style={{ fontSize: '14px' }}>No hay vacunas registradas aún.</p>
                </div>
              ) : (
                <div className="historial-vacunas-lista">
                  {vacunas.map((v) => (
                    <div key={v.idVacunacion} className="historial-vacuna-card">
                      <div className="historial-vacuna-card__icon">💉</div>
                      <div className="historial-vacuna-card__body">
                        <p className="historial-vacuna-card__nombre">{v.nombreVacuna}</p>
                        <p className="historial-vacuna-card__meta">
                          Aplicada: {formatFecha(v.fechaAplicacion)}
                          {v.nombreVeterinario && ` · Dr. ${v.nombreVeterinario}`}
                        </p>
                        {v.proximaDosis && (
                          <p className="historial-vacuna-card__proxima">
                            Próxima dosis: {formatFecha(v.proximaDosis)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catálogo recomendado */}
            <div className="historial-seccion">
              <h3 className="historial-seccion__titulo">
                Catálogo recomendado
                {mascota?.especie && (
                  <span className="historial-seccion__badge">
                    {mascota.especie === 'PERRO' ? '🐶 Canino' : mascota.especie === 'GATO' ? '🐱 Felino' : mascota.especie}
                  </span>
                )}
              </h3>

              {catalogo.length === 0 ? (
                <div className="historial-empty" style={{ padding: '32px' }}>
                  <p style={{ fontSize: '14px' }}>No hay vacunas en el catálogo para esta especie.</p>
                </div>
              ) : (
                <div className="historial-catalogo-grid">
                  {catalogo.map((c) => {
                    const yaAplicada = vacunas.some((v) => v.nombreVacuna === c.nombre)
                    return (
                      <div
                        key={c.idVacuna}
                        className={`historial-catalogo-item${yaAplicada ? ' historial-catalogo-item--aplicada' : ''}`}
                      >
                        <div className="historial-catalogo-item__header">
                          <span className="historial-catalogo-item__nombre">{c.nombre}</span>
                          {yaAplicada && (
                            <span className="historial-catalogo-item__check">✓ Aplicada</span>
                          )}
                        </div>
                        {c.descripcion && (
                          <p className="historial-catalogo-item__desc">{c.descripcion}</p>
                        )}
                        {c.dosis && (
                          <p className="historial-catalogo-item__dosis">Dosis: {c.dosis}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )
      )}
    </ClientLayout>
  )
}

export default HistorialMascota
