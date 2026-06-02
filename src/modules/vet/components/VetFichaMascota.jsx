import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import {
  getHistorialMascota,
  getHistorialByReserva,
  crearConsulta,
  actualizarConsulta,
  registrarVacunacion,
} from '../services/historialService'
import { getVacunasCatalogo } from '../services/vetService'
import VetLayout from './VetLayout'

const especieEmoji = (e) => ({ GATO: '🐱', AVE: '🐦', OTRO: '🐹' }[e?.toUpperCase()] ?? '🐶')
const calcularEdad = (fn) => fn ? new Date().getFullYear() - new Date(fn).getFullYear() : null
const formatFecha = (s) => s
  ? new Date(s).toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

const FORM_VACIO = {
  diagnostico: '',
  observaciones: '',
  tratamiento: '',
  indicaciones: '',
  duracion: '',
  receta: '',
  peso: '',
  temperatura: '',
  frecuenciaCardiaca: '',
  frecuenciaRespiratoria: '',
  saturacionOxigeno: '',
  incluirVacuna: false,
  idVacuna: '',
  fechaAplicacion: new Date().toISOString().split('T')[0],
  fechaProxima: '',
  lote: '',
}

const VetFichaMascota = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const mascotaId = searchParams.get('mascotaId')
  const reservaId = searchParams.get('reservaId')

  const [mascota, setMascota] = useState(null)
  const [historialPrevio, setHistorialPrevio] = useState([])
  const [historialReserva, setHistorialReserva] = useState(null) // edición
  const [expandido, setExpandido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [panelActivo, setPanelActivo] = useState(null) // 'consulta' | 'servicio'
  const [form, setForm] = useState(FORM_VACIO)
  const [vacunasCatalogo, setVacunasCatalogo] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState(null)
  const [guardadoOk, setGuardadoOk] = useState(false)

  const [confirmCerrar, setConfirmCerrar] = useState(false)
  const [cerrando, setCerrando] = useState(false)

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const modoEdicion = !!historialReserva

  useEffect(() => {
    if (!mascotaId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [mascRes, histRes] = await Promise.all([
          apiClient.get(`/mascotas/${mascotaId}`),
          getHistorialMascota(mascotaId),
        ])
        setMascota(mascRes.data.data)
        setHistorialPrevio(histRes)

        if (reservaId) {
          const existente = await getHistorialByReserva(reservaId)
          if (existente) {
            setHistorialReserva(existente)
            setForm({
              ...FORM_VACIO,
              diagnostico: existente.diagnostico ?? '',
              observaciones: existente.observaciones ?? '',
              tratamiento: existente.tratamiento ?? '',
              receta: existente.receta ?? '',
              peso: existente.peso != null ? String(existente.peso) : '',
              temperatura: existente.temperatura != null ? String(existente.temperatura) : '',
              frecuenciaCardiaca: existente.frecuenciaCardiaca != null ? String(existente.frecuenciaCardiaca) : '',
              frecuenciaRespiratoria: existente.frecuenciaRespiratoria != null ? String(existente.frecuenciaRespiratoria) : '',
              saturacionOxigeno: existente.saturacionOxigeno != null ? String(existente.saturacionOxigeno) : '',
            })
          }
        }
      } catch (err) {
        setError(handleError(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mascotaId, reservaId])

  const handleAbrirConsulta = async () => {
    setPanelActivo('consulta')
    if (vacunasCatalogo.length === 0) {
      try { setVacunasCatalogo(await getVacunasCatalogo()) } catch { /* silencio */ }
    }
  }

  const handleGuardar = async () => {
    if (!form.diagnostico.trim()) {
      setErrorForm('El diagnóstico es obligatorio')
      return
    }
    setGuardando(true)
    setErrorForm(null)
    setGuardadoOk(false)
    try {
      const payload = {
        idReserva: reservaId ? parseInt(reservaId) : null,
        diagnostico: form.diagnostico.trim(),
        observaciones: form.observaciones || null,
        tratamiento: form.tratamiento || null,
        indicaciones: form.indicaciones || null,
        duracion: form.duracion || null,
        receta: form.receta || null,
        peso: form.peso ? parseFloat(form.peso) : null,
        temperatura: form.temperatura ? parseFloat(form.temperatura) : null,
        frecuenciaCardiaca: form.frecuenciaCardiaca ? parseInt(form.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: form.frecuenciaRespiratoria ? parseInt(form.frecuenciaRespiratoria) : null,
        saturacionOxigeno: form.saturacionOxigeno ? parseInt(form.saturacionOxigeno) : null,
        vacuna: null,
      }

      let historialGuardado
      if (modoEdicion) {
        historialGuardado = await actualizarConsulta(historialReserva.idHistorial, payload)
        setHistorialReserva(historialGuardado)
      } else {
        historialGuardado = await crearConsulta(mascotaId, payload)
        setHistorialReserva(historialGuardado)
        setHistorialPrevio((prev) => [historialGuardado, ...prev])
      }

      if (form.incluirVacuna && form.idVacuna) {
        await registrarVacunacion({
          idMascota: parseInt(mascotaId),
          idVacuna: parseInt(form.idVacuna),
          idHistorial: historialGuardado.idHistorial,
          fechaAplicacion: form.fechaAplicacion || null,
          fechaProxima: form.fechaProxima || null,
          lote: form.lote || null,
        })
      }

      setGuardadoOk(true)
      setTimeout(() => setGuardadoOk(false), 3000)
    } catch (err) {
      setErrorForm(handleError(err))
    } finally {
      setGuardando(false)
    }
  }

  const handleCerrarFicha = async () => {
    setCerrando(true)
    try {
      await apiClient.patch(`/reservas/${reservaId}/completar`)
      navigate('/vet/citas')
    } catch (err) {
      alert(handleError(err))
    } finally {
      setCerrando(false)
      setConfirmCerrar(false)
    }
  }

  if (!mascotaId) return (
    <VetLayout>
      <div className="vet-empty">
        <p className="vet-empty__icon">⚠️</p>
        <p>Parámetros de ruta inválidos.</p>
        <button className="vet-btn-secondary" onClick={() => navigate('/vet/citas')}>
          ← Volver
        </button>
      </div>
    </VetLayout>
  )

  if (loading) return <VetLayout><p className="vet-loading">Cargando ficha...</p></VetLayout>

  if (error) return (
    <VetLayout>
      <div className="vet-empty"><p className="vet-empty__icon">⚠️</p><p>{error}</p></div>
    </VetLayout>
  )

  const edad = calcularEdad(mascota?.fechaNacimiento)

  return (
    <VetLayout>
      {/* Header con botón cerrar ficha */}
      <div className="vet-ficha-header">
        <div>
          <button className="vet-btn-secondary" style={{ fontSize: '13px', marginBottom: '6px' }}
            onClick={() => navigate('/vet/citas')}>
            ← Volver a citas
          </button>
          <h2 className="vet-page-title">🩺 Ficha de atención</h2>
        </div>
        {reservaId && (
          <button
            className="vet-btn-cerrar-ficha"
            onClick={() => setConfirmCerrar(true)}
          >
            ✓ Cerrar ficha
          </button>
        )}
      </div>

      {/* Layout 3 columnas */}
      <div className="vet-ficha-layout">

        {/* ── Col 1: info mascota ── */}
        <div className="vet-ficha-col-left">
          <div className="vet-ficha-avatar-lg">{especieEmoji(mascota?.especie)}</div>
          <h3 className="vet-ficha-nombre">{mascota?.nombre}</h3>
          <p className="vet-ficha-especie">
            {mascota?.especie}{mascota?.raza ? ` · ${mascota.raza}` : ''}
          </p>
          {mascota?.animalGuia && (
            <span className="vet-guia-badge" style={{ marginBottom: '8px' }}>🦮 Animal guía</span>
          )}

          <div className="vet-ficha-datos">
            {mascota?.sexo && <div className="vet-ficha-dato"><span>Sexo</span><strong>{mascota.sexo}</strong></div>}
            {edad !== null && <div className="vet-ficha-dato"><span>Edad</span><strong>{edad} años</strong></div>}
            {mascota?.peso != null && <div className="vet-ficha-dato"><span>Peso</span><strong>{mascota.peso} kg</strong></div>}
            {mascota?.color && <div className="vet-ficha-dato"><span>Color</span><strong>{mascota.color}</strong></div>}
            <div className="vet-ficha-dato">
              <span>Vacunas</span>
              <strong style={{ color: mascota?.vacunasAlDia ? '#059669' : '#dc2626' }}>
                {mascota?.vacunasAlDia ? 'Al día ✓' : 'Pendientes'}
              </strong>
            </div>
          </div>

          <div className="vet-ficha-notas">
            <p className="vet-ficha-notas-label">Notas / Alergias</p>
            <p className="vet-ficha-notas-body">Sin notas registradas</p>
          </div>
        </div>

        {/* ── Col 2: historial + botones ── */}
        <div className="vet-ficha-col-center">
          <div className="vet-ficha-acciones">
            <button
              className={panelActivo === 'consulta' ? 'vet-btn-primary' : 'vet-btn-secondary'}
              onClick={handleAbrirConsulta}
            >
              📋 {modoEdicion ? 'Editar consulta' : 'Agregar consulta'}
            </button>
            <button
              className={panelActivo === 'servicio' ? 'vet-btn-primary' : 'vet-btn-secondary'}
              onClick={() => setPanelActivo('servicio')}
            >
              🔧 Agregar servicio
            </button>
          </div>

          <h4 className="vet-ficha-historial-title">Historial previo</h4>

          {historialPrevio.filter((h) =>
            !historialReserva || h.idHistorial !== historialReserva.idHistorial
          ).length === 0 ? (
            <p className="vet-ficha-historial-vacio">Sin consultas anteriores registradas.</p>
          ) : (
            <div className="vet-ficha-historial-lista">
              {historialPrevio
                .filter((h) => !historialReserva || h.idHistorial !== historialReserva.idHistorial)
                .map((h) => (
                  <div key={h.idHistorial} className="vet-ficha-historial-item">
                    <button
                      className="vet-ficha-historial-item__header"
                      onClick={() => setExpandido(expandido === h.idHistorial ? null : h.idHistorial)}
                    >
                      <span className="vet-ficha-historial-item__fecha">{formatFecha(h.fechaRegistro)}</span>
                      <span className="vet-ficha-historial-item__dx">
                        {h.diagnostico?.length > 60
                          ? h.diagnostico.slice(0, 60) + '…'
                          : h.diagnostico}
                      </span>
                      <span>{expandido === h.idHistorial ? '▲' : '▼'}</span>
                    </button>
                    {expandido === h.idHistorial && (
                      <div className="vet-ficha-historial-item__body">
                        <p><strong>Dr. {h.nombreVeterinario}</strong></p>
                        {h.tratamiento && <p><em>Tratamiento:</em> {h.tratamiento}</p>}
                        {h.receta && <p><em>Receta:</em> {h.receta}</p>}
                        {h.observaciones && <p><em>Obs:</em> {h.observaciones}</p>}
                        {h.peso && <p><em>Peso registrado:</em> {h.peso} kg</p>}
                        {h.vacunas?.length > 0 && (
                          <p><em>Vacunas:</em> {h.vacunas.map((v) => v.nombreVacuna).join(', ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ── Col 3: panel de formulario ── */}
        <div className="vet-ficha-col-right">
          {panelActivo === null && (
            <div className="vet-ficha-panel-vacio">
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📋</p>
              <p>Selecciona "Agregar consulta" o "Agregar servicio" para comenzar.</p>
            </div>
          )}

          {panelActivo === 'servicio' && (
            <div className="vet-ficha-panel">
              <h4 className="vet-ficha-panel-title">🔧 Agregar servicio</h4>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>
                El registro detallado de servicios estará disponible próximamente.
              </p>
            </div>
          )}

          {panelActivo === 'consulta' && (
            <div className="vet-ficha-panel">
              <h4 className="vet-ficha-panel-title">
                {modoEdicion ? '✏️ Editar consulta' : '📋 Nueva consulta'}
              </h4>

              {guardadoOk && (
                <p className="vet-ficha-panel-ok">✓ Guardado correctamente</p>
              )}

              {/* Diagnóstico */}
              <div className="vet-modal__field">
                <label>Diagnóstico *</label>
                <textarea rows={3} value={form.diagnostico}
                  onChange={(e) => setF('diagnostico', e.target.value)}
                  placeholder="Describe el diagnóstico..." />
              </div>

              {/* Observaciones */}
              <div className="vet-modal__field">
                <label>Observaciones</label>
                <textarea rows={2} value={form.observaciones}
                  onChange={(e) => setF('observaciones', e.target.value)}
                  placeholder="Notas internas..." />
              </div>

              {/* Tratamiento */}
              <div className="vet-modal__field">
                <label>Tratamiento</label>
                <textarea rows={2} value={form.tratamiento}
                  onChange={(e) => setF('tratamiento', e.target.value)}
                  placeholder="Describe el tratamiento..." />
              </div>

              {/* Indicaciones + Duración */}
              <div className="vet-modal__grid">
                <div className="vet-modal__field">
                  <label>Indicaciones</label>
                  <textarea rows={2} value={form.indicaciones}
                    onChange={(e) => setF('indicaciones', e.target.value)}
                    placeholder="Para el propietario..." />
                </div>
                <div className="vet-modal__field">
                  <label>Duración</label>
                  <input type="text" value={form.duracion}
                    onChange={(e) => setF('duracion', e.target.value)}
                    placeholder="Ej: 7 días" />
                </div>
              </div>

              {/* Receta */}
              <div className="vet-modal__field">
                <label>Receta</label>
                <textarea rows={2} value={form.receta}
                  onChange={(e) => setF('receta', e.target.value)}
                  placeholder="Medicamentos recetados..." />
              </div>

              <div className="vet-modal__divider" />

              {/* Signos vitales */}
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
                color: '#6b7280', margin: '0 0 10px', letterSpacing: '0.05em' }}>
                Signos vitales
              </p>
              <div className="vet-modal__grid">
                <div className="vet-modal__field">
                  <label>Peso (kg)</label>
                  <input type="number" min="0" step="0.1" value={form.peso}
                    onChange={(e) => setF('peso', e.target.value)} placeholder="Ej: 12.5" />
                </div>
                <div className="vet-modal__field">
                  <label>Temperatura (°C)</label>
                  <input type="number" min="35" max="42" step="0.1" value={form.temperatura}
                    onChange={(e) => setF('temperatura', e.target.value)} placeholder="Ej: 38.5" />
                </div>
                <div className="vet-modal__field">
                  <label>Frec. cardíaca (lpm)</label>
                  <input type="number" min="0" value={form.frecuenciaCardiaca}
                    onChange={(e) => setF('frecuenciaCardiaca', e.target.value)} placeholder="Ej: 80" />
                </div>
                <div className="vet-modal__field">
                  <label>Frec. respiratoria (rpm)</label>
                  <input type="number" min="0" value={form.frecuenciaRespiratoria}
                    onChange={(e) => setF('frecuenciaRespiratoria', e.target.value)} placeholder="Ej: 20" />
                </div>
                <div className="vet-modal__field">
                  <label>Saturación O₂ (%)</label>
                  <input type="number" min="0" max="100" value={form.saturacionOxigeno}
                    onChange={(e) => setF('saturacionOxigeno', e.target.value)} placeholder="Ej: 98" />
                </div>
              </div>

              <div className="vet-modal__divider" />

              {/* Toggle vacuna */}
              <div className="vet-modal__checkbox">
                <input type="checkbox" id="incluirVacuna" checked={form.incluirVacuna}
                  onChange={(e) => setF('incluirVacuna', e.target.checked)} />
                <label htmlFor="incluirVacuna">¿Aplicar vacuna en esta consulta?</label>
              </div>

              {form.incluirVacuna && (
                <div className="vet-modal__grid">
                  <div className="vet-modal__field">
                    <label>Vacuna *</label>
                    <select value={form.idVacuna} onChange={(e) => setF('idVacuna', e.target.value)}>
                      <option value="">Seleccionar...</option>
                      {vacunasCatalogo.map((v) => (
                        <option key={v.idVacuna} value={v.idVacuna}>{v.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="vet-modal__field">
                    <label>Fecha aplicación</label>
                    <input type="date" value={form.fechaAplicacion}
                      onChange={(e) => setF('fechaAplicacion', e.target.value)} />
                  </div>
                  <div className="vet-modal__field">
                    <label>Próxima dosis</label>
                    <input type="date" value={form.fechaProxima}
                      onChange={(e) => setF('fechaProxima', e.target.value)} />
                  </div>
                  <div className="vet-modal__field">
                    <label>Lote</label>
                    <input type="text" value={form.lote}
                      onChange={(e) => setF('lote', e.target.value)} placeholder="LOT-2024-001" />
                  </div>
                </div>
              )}

              {errorForm && <p className="vet-modal__error">{errorForm}</p>}

              <button
                className="vet-btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '12px' }}
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : modoEdicion ? '💾 Actualizar consulta' : '💾 Guardar consulta'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmación cerrar ficha */}
      {confirmCerrar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setConfirmCerrar(false)}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            maxWidth: '380px', width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: '32px', textAlign: 'center', margin: '0 0 8px' }}>✓</p>
            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '17px', margin: '0 0 8px' }}>
              ¿Cerrar ficha y completar la reserva?
            </p>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              La reserva pasará a estado COMPLETADA. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmCerrar(false)}
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #e5e7eb',
                  background: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                Cancelar
              </button>
              <button onClick={handleCerrarFicha} disabled={cerrando}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none',
                  background: '#2a9d8f', color: '#fff', fontWeight: 600,
                  cursor: 'pointer', fontSize: '14px',
                  opacity: cerrando ? 0.6 : 1 }}>
                {cerrando ? 'Cerrando...' : 'Confirmar y cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </VetLayout>
  )
}

export default VetFichaMascota
