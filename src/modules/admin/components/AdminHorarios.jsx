import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
const DIA_LABEL = {
  LUNES:     'Lunes',
  MARTES:    'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES:    'Jueves',
  VIERNES:   'Viernes',
  SABADO:    'Sábado',
}

const TURNO_CONFIG = {
  MANANA: { label: 'Mañana', icon: '☀️',  hrs: '08:00 – 14:00' },
  TARDE:  { label: 'Tarde',  icon: '🌤️', hrs: '14:00 – 20:00' },
  NOCHE:  { label: 'Noche',  icon: '🌙',  hrs: '20:00 – 00:00' },
}

const formatHora = (hora) => {
  if (!hora) return '—'
  if (Array.isArray(hora)) {
    const [h, m = 0] = hora
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return hora.toString().slice(0, 5)
}

const getHour = (hora) => {
  if (!hora) return -1
  if (Array.isArray(hora)) return hora[0]
  return parseInt(hora.toString().slice(0, 2))
}

const derivarTurno = (horaInicio) => {
  const h = getHour(horaInicio)
  if (h < 0) return null
  if (h >= 6 && h < 14) return 'MANANA'
  if (h >= 14 && h < 20) return 'TARDE'
  return 'NOCHE'
}

const getInitials = (nombre) =>
  (nombre ?? '').split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()

const FORM_VACIO = { idVeterinario: '', diaSemana: '', horaInicio: '', horaFin: '' }

const AdminHorarios = () => {
  const [plantillas, setPlantillas]       = useState([])
  const [veterinarios, setVeterinarios]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [busqueda, setBusqueda]           = useState('')
  const [filtroTurno, setFiltroTurno]     = useState('TODOS')
  const [vista, setVista]                 = useState('tabla')
  const [loadingId, setLoadingId]         = useState(null)
  const [mostrarForm, setMostrarForm]     = useState(false)
  const [form, setForm]                   = useState(FORM_VACIO)
  const [guardando, setGuardando]         = useState(false)
  const [generando, setGenerando]         = useState(false)
  const [msgGeneracion, setMsgGeneracion] = useState(null)
  const [modalVet, setModalVet]           = useState(null)
  const [turnoModal, setTurnoModal]       = useState(null)
  const [cambiando, setCambiando]         = useState(false)

  useEffect(() => {
    Promise.all([cargar(), cargarVets()])
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get('/turnos/horario-plantilla/todas')
      setPlantillas(data.data ?? [])
    } catch (err) {
      console.error('Error cargando plantillas:', handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const cargarVets = async () => {
    try {
      const { data } = await apiClient.get('/usuarios/veterinarios')
      setVeterinarios(data.data ?? [])
    } catch { /* silencio */ }
  }

  const handleToggle = async (p) => {
    setLoadingId(p.id)
    const accion = p.activo ? 'desactivar' : 'activar'
    try {
      const { data } = await apiClient.patch(`/turnos/horario-plantilla/${p.id}/${accion}`)
      setPlantillas((prev) => prev.map((x) => x.id === p.id ? data.data : x))
    } catch (err) {
      alert(handleError(err))
    } finally {
      setLoadingId(null)
    }
  }

  const handleEliminar = async (p) => {
    if (!confirm(`¿Eliminar plantilla de ${p.nombreVeterinario} — ${DIA_LABEL[p.diaSemana]}? Los turnos ya generados no se borran.`)) return
    setLoadingId(p.id)
    try {
      await apiClient.delete(`/turnos/horario-plantilla/${p.id}`)
      setPlantillas((prev) => prev.filter((x) => x.id !== p.id))
    } catch (err) {
      alert(handleError(err))
    } finally {
      setLoadingId(null)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    if (!form.idVeterinario || !form.diaSemana || !form.horaInicio || !form.horaFin) {
      alert('Completa todos los campos')
      return
    }
    setGuardando(true)
    try {
      const { data } = await apiClient.post('/turnos/horario-plantilla', {
        idVeterinario: parseInt(form.idVeterinario),
        diaSemana: form.diaSemana,
        horaInicio: form.horaInicio + ':00',
        horaFin: form.horaFin + ':00',
      })
      setPlantillas((prev) => [...prev, data.data])
      setForm(FORM_VACIO)
      setMostrarForm(false)
    } catch (err) {
      alert(handleError(err))
    } finally {
      setGuardando(false)
    }
  }

  const handleGenerar = async () => {
    setGenerando(true)
    setMsgGeneracion(null)
    try {
      const { data } = await apiClient.post('/turnos/generar?dias=60')
      setMsgGeneracion(`✓ ${data.data?.turnosGenerados ?? 0} nuevos slots generados para los próximos 60 días`)
    } catch (err) {
      setMsgGeneracion('Error: ' + handleError(err))
    } finally {
      setGenerando(false)
    }
  }

  const handleCambiarTurno = async () => {
    if (!turnoModal || !modalVet) return
    setCambiando(true)
    try {
      const { data } = await apiClient.patch(
        `/turnos/horario-plantilla/veterinario/${modalVet.idVet}/turno`,
        { tipoTurno: turnoModal }
      )
      setPlantillas((prev) =>
        prev.map((p) => {
          const updated = (data.data ?? []).find((u) => u.id === p.id)
          return updated ?? p
        })
      )
      setModalVet(null)
      setTurnoModal(null)
    } catch (err) {
      alert(handleError(err))
    } finally {
      setCambiando(false)
    }
  }

  const cerrarModal = () => { setModalVet(null); setTurnoModal(null) }

  // Detecta duplicado mientras el admin llena el form
  const conflicto = (form.idVeterinario && form.diaSemana && form.horaInicio)
    ? plantillas.find((p) => {
        if (String(p.idVeterinario) !== String(form.idVeterinario)) return false
        if (p.diaSemana !== form.diaSemana) return false
        const [fh, fm] = form.horaInicio.split(':').map(Number)
        const [ah, am] = Array.isArray(p.horaInicio) ? p.horaInicio : [parseInt(p.horaInicio), 0]
        return fh === ah && fm === (am ?? 0)
      }) ?? null
    : null

  // ── Derived ──────────────────────────────────────────────────────
  const plantillasFiltradas = plantillas.filter((p) => {
    const matchBusq  = p.nombreVeterinario?.toLowerCase().includes(busqueda.toLowerCase())
    const matchTurno = filtroTurno === 'TODOS' || derivarTurno(p.horaInicio) === filtroTurno
    return matchBusq && matchTurno
  })

  const turnoSummary = ['MANANA', 'TARDE', 'NOCHE'].map((turno) => {
    const seen = new Set()
    const vets = []
    for (const p of plantillas) {
      if (derivarTurno(p.horaInicio) === turno && !seen.has(p.idVeterinario)) {
        seen.add(p.idVeterinario)
        vets.push(p.nombreVeterinario)
      }
    }
    return { turno, vets }
  })

  const porVet = []
  const vetMap = new Map()
  for (const p of plantillasFiltradas) {
    if (!vetMap.has(p.idVeterinario)) {
      const entry = { idVet: p.idVeterinario, nombre: p.nombreVeterinario, plantillas: [] }
      vetMap.set(p.idVeterinario, entry)
      porVet.push(entry)
    }
    vetMap.get(p.idVeterinario).plantillas.push(p)
  }

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="adm-page-header adm-page-header--row" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="adm-page-header__title">🕐 Horarios</h2>
          <p className="adm-page-header__sub">Gestión de turnos y plantillas de horario</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="adm-btn-secondary"
            onClick={() => { setMostrarForm((v) => !v); setForm(FORM_VACIO) }}
          >
            {mostrarForm ? '✕ Cancelar' : '+ Agregar plantilla'}
          </button>
          <button
            className="adm-btn-primary"
            onClick={handleGenerar}
            disabled={generando}
            style={{ minWidth: '180px' }}
          >
            {generando ? 'Generando…' : '⚙ Generar 60 días'}
          </button>
        </div>
      </div>

      {/* Turno summary cards */}
      <div className="adm-turno-grid">
        {turnoSummary.map(({ turno, vets }) => {
          const cfg = TURNO_CONFIG[turno]
          return (
            <div key={turno} className={`adm-turno-card adm-turno-card--${turno}`}>
              <div className="adm-turno-card__header">
                <span className="adm-turno-card__icon">{cfg.icon}</span>
                <span className="adm-turno-card__label">{cfg.label}</span>
              </div>
              <p className="adm-turno-card__count">{vets.length} vets</p>
              <p className="adm-turno-card__hrs">{cfg.hrs}</p>
              <div className="adm-turno-card__vets">
                {vets.slice(0, 3).map((n) => (
                  <span key={n} className="adm-turno-card__vet">· {n}</span>
                ))}
                {vets.length > 3 && (
                  <span className="adm-turno-card__more">y {vets.length - 3} más...</span>
                )}
                {vets.length === 0 && (
                  <span className="adm-turno-card__more">Sin veterinarios asignados</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {msgGeneracion && (
        <div className={msgGeneracion.startsWith('✓') ? 'adm-msg-success' : 'adm-msg-error'}>
          {msgGeneracion}
        </div>
      )}

      {/* Form agregar plantilla */}
      {mostrarForm && (
        <form onSubmit={handleCrear} style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', marginBottom: '20px',
          display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Veterinario</label>
            <select
              value={form.idVeterinario}
              onChange={(e) => setForm((f) => ({ ...f, idVeterinario: e.target.value }))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="">Seleccionar...</option>
              {veterinarios.map((v) => (
                <option key={v.idUsuario} value={v.idUsuario}>
                  {v.nombres} {v.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Día</label>
            <select
              value={form.diaSemana}
              onChange={(e) => setForm((f) => ({ ...f, diaSemana: e.target.value }))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            >
              <option value="">Seleccionar...</option>
              {DIAS.map((d) => <option key={d} value={d}>{DIA_LABEL[d]}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Hora inicio</label>
            <input
              type="time"
              value={form.horaInicio}
              onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Hora fin</label>
            <input
              type="time"
              value={form.horaFin}
              onChange={(e) => setForm((f) => ({ ...f, horaFin: e.target.value }))}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            />
          </div>
          <div style={{ width: '100%' }}>
            {conflicto && (
              <div className="adm-msg-error" style={{ marginBottom: 0, marginTop: 4 }}>
                Ya existe una plantilla para {conflicto.nombreVeterinario} el {DIA_LABEL[conflicto.diaSemana]} a las {formatHora(conflicto.horaInicio)}.
              </div>
            )}
          </div>
          <button type="submit" className="adm-btn-primary" disabled={guardando || !!conflicto} style={{ padding: '8px 20px' }}>
            {guardando ? 'Guardando…' : 'Agregar'}
          </button>
        </form>
      )}

      {/* Toolbar: search + turno filter + vista toggle */}
      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por veterinario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {['TODOS', 'MANANA', 'TARDE', 'NOCHE'].map((t) => (
          <button
            key={t}
            className={`adm-filtro-btn${filtroTurno === t ? ' adm-filtro-btn--active' : ''}`}
            onClick={() => setFiltroTurno(t)}
          >
            {t === 'TODOS' ? 'Todos' : `${TURNO_CONFIG[t].icon} ${TURNO_CONFIG[t].label}`}
          </button>
        ))}
        <div className="adm-vista-toggle" style={{ marginLeft: 'auto' }}>
          <button
            className={`adm-vista-btn${vista === 'tabla' ? ' adm-vista-btn--active' : ''}`}
            onClick={() => setVista('tabla')}
          >
            📋 Tabla
          </button>
          <button
            className={`adm-vista-btn${vista === 'porvet' ? ' adm-vista-btn--active' : ''}`}
            onClick={() => setVista('porvet')}
          >
            👤 Por veterinario
          </button>
        </div>
      </div>

      {/* Vista: Tabla */}
      {vista === 'tabla' && (
        <div className="adm-table-wrapper">
          {plantillasFiltradas.length === 0 ? (
            <div className="adm-empty">
              <p className="adm-empty__icon">🕐</p>
              <p>No hay plantillas de horario registradas.</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  {['Veterinario', 'Día', 'Horario', 'Turno', 'Estado', 'Acciones'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plantillasFiltradas.map((p) => {
                  const turno = derivarTurno(p.horaInicio)
                  const cfg   = TURNO_CONFIG[turno] ?? {}
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="adm-avatar">{getInitials(p.nombreVeterinario)}</div>
                          <span style={{ fontWeight: 600 }}>{p.nombreVeterinario}</span>
                        </div>
                      </td>
                      <td>{DIA_LABEL[p.diaSemana] ?? p.diaSemana}</td>
                      <td style={{ fontWeight: 700 }}>{formatHora(p.horaInicio)} – {formatHora(p.horaFin)}</td>
                      <td>
                        <span className={`adm-chip-turno adm-chip-turno--${turno}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge--${p.activo ? 'activo' : 'inactivo'}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleToggle(p)}
                            disabled={loadingId === p.id}
                            className={p.activo ? 'adm-btn-secondary' : 'adm-btn-primary'}
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            {loadingId === p.id ? '…' : p.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleEliminar(p)}
                            disabled={loadingId === p.id}
                            className="adm-btn-danger"
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vista: Por Veterinario */}
      {vista === 'porvet' && (
        porVet.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">👤</p>
            <p>No hay veterinarios que coincidan.</p>
          </div>
        ) : (
          <div className="adm-vet-grid">
            {porVet.map(({ idVet, nombre, plantillas: ps }) => {
              const turno = derivarTurno(ps[0]?.horaInicio)
              const cfg   = TURNO_CONFIG[turno] ?? {}
              const diasOrdenados = DIAS.filter((d) => ps.some((p) => p.diaSemana === d))
              return (
                <div key={idVet} className="adm-vet-card">
                  <div className="adm-vet-card__header">
                    <div className="adm-avatar">{getInitials(nombre)}</div>
                    <div>
                      <p className="adm-vet-card__name">{nombre}</p>
                      <span className={`adm-chip-turno adm-chip-turno--${turno}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="adm-vet-card__dias">
                    {diasOrdenados.map((dia) => {
                      const p = ps.find((x) => x.diaSemana === dia)
                      return (
                        <div key={dia} className="adm-vet-card__dia">
                          <span className="adm-vet-card__dia-name">{DIA_LABEL[dia]}</span>
                          <span>{formatHora(p.horaInicio)} – {formatHora(p.horaFin)}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="adm-vet-card__footer">
                    <button
                      className="adm-btn-secondary"
                      style={{ width: '100%', textAlign: 'center' }}
                      onClick={() => {
                        setModalVet({ idVet, nombre, turnoActual: turno })
                        setTurnoModal(turno)
                      }}
                    >
                      Cambiar turno
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Modal cambiar turno */}
      {modalVet && (
        <div className="adm-modal-overlay" onClick={cerrarModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">Cambiar turno — {modalVet.nombre}</h3>
              <button className="adm-modal__close" onClick={cerrarModal}>✕</button>
            </div>
            <div className="adm-modal__body">
              <p style={{ marginTop: 0, fontSize: 13, color: '#6b7280' }}>
                Se actualizarán todos los días del veterinario al horario estándar del turno seleccionado.
              </p>
              <div className="adm-turno-opciones">
                {['MANANA', 'TARDE', 'NOCHE'].map((t) => {
                  const cfg = TURNO_CONFIG[t]
                  return (
                    <button
                      key={t}
                      className={`adm-turno-opcion${turnoModal === t ? ' adm-turno-opcion--active' : ''}`}
                      onClick={() => setTurnoModal(t)}
                    >
                      <span className="adm-turno-opcion__icon">{cfg.icon}</span>
                      <span className="adm-turno-opcion__body">
                        <span className="adm-turno-opcion__label">{cfg.label}</span>
                        <span className="adm-turno-opcion__hrs">{cfg.hrs}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button
                className="adm-btn-primary"
                onClick={handleCambiarTurno}
                disabled={cambiando || !turnoModal}
              >
                {cambiando ? 'Guardando…' : 'Confirmar cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminHorarios
