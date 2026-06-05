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

const formatHora = (hora) => hora?.toString().slice(0, 5) ?? '—'

const turnoLabel = (horaInicio) => {
  if (!horaInicio) return ''
  const h = parseInt(horaInicio.toString().slice(0, 2))
  if (h >= 6 && h < 14) return { label: 'Mañana', color: '#f59e0b' }
  if (h >= 14 && h < 20) return { label: 'Tarde', color: '#6366f1' }
  return { label: 'Noche', color: '#1e3a5f' }
}

const FORM_VACIO = { idVeterinario: '', diaSemana: '', horaInicio: '', horaFin: '' }

const AdminHorarios = () => {
  const [plantillas, setPlantillas]   = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [loadingId, setLoadingId]     = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm]               = useState(FORM_VACIO)
  const [guardando, setGuardando]     = useState(false)
  const [generando, setGenerando]     = useState(false)
  const [msgGeneracion, setMsgGeneracion] = useState(null)

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

  const filtradas = plantillas.filter((p) =>
    p.nombreVeterinario?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🕐 Horarios</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Plantillas de horario de todos los veterinarios
          </p>
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

      {msgGeneracion && (
        <div style={{
          padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
          background: msgGeneracion.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
          color: msgGeneracion.startsWith('✓') ? '#166534' : '#b91c1c',
          border: `1px solid ${msgGeneracion.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {msgGeneracion}
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleCrear} style={{
          background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
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

          <button
            type="submit"
            className="adm-btn-primary"
            disabled={guardando}
            style={{ padding: '8px 20px' }}
          >
            {guardando ? 'Guardando…' : 'Agregar'}
          </button>
        </form>
      )}

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por veterinario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="adm-table-wrapper">
        {filtradas.length === 0 ? (
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
              {filtradas.map((p) => {
                const turno = turnoLabel(p.horaInicio)
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.nombreVeterinario}</td>
                    <td>{DIA_LABEL[p.diaSemana] ?? p.diaSemana}</td>
                    <td style={{ fontWeight: 700, color: '#374151' }}>
                      {formatHora(p.horaInicio)} – {formatHora(p.horaFin)}
                    </td>
                    <td>
                      <span style={{
                        background: turno.color + '22',
                        color: turno.color,
                        fontWeight: 600,
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                      }}>
                        {turno.label}
                      </span>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge--${p.activo ? 'activo' : 'inactivo'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminHorarios
