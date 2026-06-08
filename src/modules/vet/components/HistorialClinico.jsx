import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { handleError } from '@/modules/core/lib/errorHandler'
import apiClient from '@/modules/core/lib/apiClient'
import { getHistorialMascota, crearConsulta } from '../services/historialService'
import { getVacunasCatalogo } from '../services/vetService'
import VetLayout from './VetLayout'

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

const FORM_INICIAL = {
  diagnostico: '',
  tratamiento: '',
  indicaciones: '',
  duracion: '',
  observaciones: '',
  receta: '',
  peso: '',
  incluirVacuna: false,
  idVacuna: '',
  proximaDosis: '',
  lote: '',
}

const HistorialClinico = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mascotaId = searchParams.get('mascotaId')

  const [mascota, setMascota] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loadingPage, setLoadingPage] = useState(true)
  const [errorPage, setErrorPage] = useState(null)

  const [mostrarModal, setMostrarModal] = useState(false)
  const [form, setForm] = useState(FORM_INICIAL)
  const [vacunasCatalogo, setVacunasCatalogo] = useState([])
  const [loadingModal, setLoadingModal] = useState(false)
  const [errorModal, setErrorModal] = useState(null)

  const setF = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    if (!mascotaId) return
    const load = async () => {
      setLoadingPage(true)
      setErrorPage(null)
      try {
        const [mascRes, histRes] = await Promise.all([
          apiClient.get(`/mascotas/${mascotaId}`),
          getHistorialMascota(mascotaId),
        ])
        setMascota(mascRes.data.data)
        setHistorial(histRes)
      } catch (err) {
        setErrorPage(handleError(err))
      } finally {
        setLoadingPage(false)
      }
    }
    load()
  }, [mascotaId])

  const handleAbrirModal = async () => {
    setForm(FORM_INICIAL)
    setErrorModal(null)
    setMostrarModal(true)
    if (vacunasCatalogo.length === 0) {
      try {
        const cat = await getVacunasCatalogo()
        setVacunasCatalogo(cat)
      } catch (err) {
        console.error('Error cargando catálogo de vacunas:', handleError(err))
      }
    }
  }

  const handleGuardar = async () => {
    if (!form.diagnostico.trim()) {
      setErrorModal('El diagnóstico es obligatorio')
      return
    }
    setLoadingModal(true)
    setErrorModal(null)
    try {
      const payload = {
        diagnostico: form.diagnostico.trim(),
        tratamiento: form.tratamiento || null,
        indicaciones: form.indicaciones || null,
        duracion: form.duracion || null,
        observaciones: form.observaciones || null,
        receta: form.receta || null,
        peso: form.peso ? parseFloat(form.peso) : null,
        vacuna: form.incluirVacuna && form.idVacuna
          ? {
              idVacuna: parseInt(form.idVacuna),
              proximaDosis: form.proximaDosis || null,
              lote: form.lote || null,
            }
          : null,
      }
      const nuevo = await crearConsulta(mascotaId, payload)
      setHistorial((prev) => [nuevo, ...prev])
      setMostrarModal(false)
    } catch (err) {
      setErrorModal(handleError(err))
    } finally {
      setLoadingModal(false)
    }
  }

  if (!mascotaId) {
    return (
      <VetLayout>
        <div className="vet-empty">
          <p className="vet-empty__icon">🐾</p>
          <p>No se especificó una mascota.</p>
          <button className="vet-btn-primary" onClick={() => navigate('/vet/pacientes')}>
            Volver a Pacientes
          </button>
        </div>
      </VetLayout>
    )
  }

  if (loadingPage) return <VetLayout><p className="vet-loading">Cargando historial...</p></VetLayout>

  if (errorPage) {
    return (
      <VetLayout>
        <div className="vet-empty">
          <p className="vet-empty__icon">⚠️</p>
          <p>{errorPage}</p>
        </div>
      </VetLayout>
    )
  }

  const edad = mascota ? calcularEdad(mascota.fechaNacimiento) : null

  return (
    <VetLayout>
      {/* Header */}
      <div className="vet-page-header">
        <div>
          <button
            className="vet-btn-secondary vet-btn-volver"
            onClick={() => navigate('/vet/pacientes')}
          >
            ← Volver a Pacientes
          </button>
          <h2 className="vet-page-title">📋 Historial Clínico</h2>
        </div>
        <button className="vet-btn-primary" onClick={handleAbrirModal}>
          + Nueva consulta
        </button>
      </div>

      {/* Ficha mascota */}
      {mascota && (
        <div className="vet-ficha">
          <div className="vet-ficha__avatar">{especieEmoji(mascota.especie)}</div>
          <div>
            <div className="vet-ficha-header-row">
              <h3 className="vet-ficha__nombre">{mascota.nombre}</h3>
              {mascota.animalGuia && <span className="vet-guia-icon" title="Animal guía o de apoyo emocional">🦮</span>}
            </div>
            <p className="vet-ficha__meta">
              {mascota.especie}{mascota.raza ? ` · ${mascota.raza}` : ''} · Dueño: {mascota.nombreUsuario}
            </p>
            <div className="vet-ficha__chips">
              {mascota.sexo && <span className="vet-chip">{mascota.sexo}</span>}
              {edad !== null && <span className="vet-chip">{edad} años</span>}
              {mascota.peso && <span className="vet-chip">{mascota.peso} kg</span>}
              <span className={`vet-estado vet-estado--${mascota.estado ? 'CONFIRMADA' : 'CANCELADA'}`}>
                {mascota.estado ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline historial */}
      {historial.length === 0 ? (
        <div className="vet-section">
          <div className="vet-empty">
            <p className="vet-empty__icon">📋</p>
            <p>No hay registros en el historial clínico.</p>
          </div>
        </div>
      ) : (
        <div className="vet-timeline">
          {historial.map((h) => (
            <div key={h.idHistorial} className="vet-timeline-item">
              <div className="vet-timeline-item__meta">
                <span className="vet-timeline-item__fecha">{formatFecha(h.fechaRegistro)}</span>
                <span className="vet-timeline-item__vet">Dr. {h.nombreVeterinario}</span>
              </div>

              <p className="vet-timeline-item__titulo">Diagnóstico</p>
              <p className="vet-timeline-item__body">{h.diagnostico}</p>

              {h.tratamientos?.length > 0 && h.tratamientos.map((t) => (
                <div key={t.idTratamiento} className="vet-timeline-item__section">
                  <p className="vet-timeline-item__section-label">Tratamiento</p>
                  <p className="vet-timeline-item__body">{t.descripcion}</p>
                  {t.indicaciones && (
                    <p className="vet-timeline-item__body vet-timeline-item__body--muted">
                      Indicaciones: {t.indicaciones}
                    </p>
                  )}
                  {t.duracion && (
                    <p className="vet-timeline-item__body vet-timeline-item__body--muted">
                      Duración: {t.duracion}
                    </p>
                  )}
                </div>
              ))}

              {h.receta && (
                <div className="vet-timeline-item__section">
                  <p className="vet-timeline-item__section-label">Receta</p>
                  <p className="vet-timeline-item__body">{h.receta}</p>
                </div>
              )}

              {h.observaciones && (
                <div className="vet-timeline-item__section">
                  <p className="vet-timeline-item__section-label">Observaciones</p>
                  <p className="vet-timeline-item__body">{h.observaciones}</p>
                </div>
              )}

              {h.peso && (
                <div className="vet-timeline-item__section">
                  <p className="vet-timeline-item__section-label">Peso registrado</p>
                  <p className="vet-timeline-item__body">{h.peso} kg</p>
                </div>
              )}

              {h.vacunas?.length > 0 && (
                <div className="vet-timeline-item__section">
                  <p className="vet-timeline-item__section-label">Vacunas aplicadas</p>
                  <div className="vet-vacunas-row">
                    {h.vacunas.map((v) => (
                      <span key={v.idVacunacion} className="vet-vacuna-tag">
                        💉 {v.nombreVacuna}
                        {v.lote && ` · lote: ${v.lote}`}
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

      {/* Modal nueva consulta */}
      {mostrarModal && (
        <div className="vet-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="vet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vet-modal__header">
              <h3 className="vet-modal__title">Nueva consulta</h3>
              <button className="vet-modal__close" onClick={() => setMostrarModal(false)}>×</button>
            </div>

            <div className="vet-modal__body">
              <div className="vet-modal__field">
                <label>Diagnóstico *</label>
                <textarea
                  rows={3}
                  value={form.diagnostico}
                  onChange={(e) => setF('diagnostico', e.target.value)}
                  placeholder="Describe el diagnóstico..."
                />
              </div>

              <div className="vet-modal__divider" />

              <div className="vet-modal__field">
                <label>Tratamiento</label>
                <textarea
                  rows={2}
                  value={form.tratamiento}
                  onChange={(e) => setF('tratamiento', e.target.value)}
                  placeholder="Describe el tratamiento..."
                />
              </div>

              <div className="vet-modal__grid">
                <div className="vet-modal__field">
                  <label>Indicaciones</label>
                  <textarea
                    rows={2}
                    value={form.indicaciones}
                    onChange={(e) => setF('indicaciones', e.target.value)}
                    placeholder="Indicaciones al propietario..."
                  />
                </div>
                <div className="vet-modal__field">
                  <label>Duración</label>
                  <input
                    type="text"
                    value={form.duracion}
                    onChange={(e) => setF('duracion', e.target.value)}
                    placeholder="Ej: 7 días"
                  />
                </div>
              </div>

              <div className="vet-modal__grid">
                <div className="vet-modal__field">
                  <label>Receta (opcional)</label>
                  <textarea
                    rows={2}
                    value={form.receta}
                    onChange={(e) => setF('receta', e.target.value)}
                    placeholder="Medicamentos recetados..."
                  />
                </div>
                <div className="vet-modal__field">
                  <label>Peso actual (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.peso}
                    onChange={(e) => setF('peso', e.target.value)}
                    placeholder="Ej: 12.5"
                  />
                </div>
              </div>

              <div className="vet-modal__field">
                <label>Observaciones (opcional)</label>
                <textarea
                  rows={2}
                  value={form.observaciones}
                  onChange={(e) => setF('observaciones', e.target.value)}
                  placeholder="Notas internas de la consulta..."
                />
              </div>

              <div className="vet-modal__divider" />

              <div className="vet-modal__checkbox">
                <input
                  type="checkbox"
                  id="incluirVacuna"
                  checked={form.incluirVacuna}
                  onChange={(e) => setF('incluirVacuna', e.target.checked)}
                />
                <label htmlFor="incluirVacuna">¿Incluir vacuna en esta consulta?</label>
              </div>

              {form.incluirVacuna && (
                <div className="vet-modal__grid">
                  <div className="vet-modal__field">
                    <label>Vacuna *</label>
                    <select
                      value={form.idVacuna}
                      onChange={(e) => setF('idVacuna', e.target.value)}
                    >
                      <option value="">Seleccionar vacuna</option>
                      {vacunasCatalogo.map((v) => (
                        <option key={v.idVacuna} value={v.idVacuna}>{v.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="vet-modal__field">
                    <label>Próxima dosis</label>
                    <input
                      type="date"
                      value={form.proximaDosis}
                      onChange={(e) => setF('proximaDosis', e.target.value)}
                    />
                  </div>
                  <div className="vet-modal__field">
                    <label>Lote (opcional)</label>
                    <input
                      type="text"
                      value={form.lote}
                      onChange={(e) => setF('lote', e.target.value)}
                      placeholder="Ej: LOT-2024-001"
                    />
                  </div>
                </div>
              )}

              {errorModal && <p className="vet-modal__error">{errorModal}</p>}
            </div>

            <div className="vet-modal__footer">
              <button className="vet-btn-secondary" onClick={() => setMostrarModal(false)}>
                Cancelar
              </button>
              <button className="vet-btn-primary" onClick={handleGuardar} disabled={loadingModal}>
                {loadingModal ? 'Guardando…' : 'Guardar consulta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </VetLayout>
  )
}

export default HistorialClinico
