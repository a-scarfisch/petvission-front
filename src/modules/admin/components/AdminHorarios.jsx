import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const DIA_LABEL = {
  LUNES:     'Lunes',
  MARTES:    'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES:    'Jueves',
  VIERNES:   'Viernes',
  SABADO:    'Sábado',
}

const formatHora = (hora) => hora?.toString().slice(0, 5) ?? '—'

const AdminHorarios = () => {
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    cargar()
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

  const filtradas = plantillas.filter((p) =>
    p.nombreVeterinario?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🕐 Horarios</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Plantillas de horario de todos los veterinarios
        </p>
      </div>

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
                {['Veterinario', 'Día', 'Horario', 'Estado', 'Acción'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.nombreVeterinario}</td>
                  <td>{DIA_LABEL[p.diaSemana] ?? p.diaSemana}</td>
                  <td style={{ fontWeight: 700, color: '#6366f1' }}>
                    {formatHora(p.horaInicio)} – {formatHora(p.horaFin)}
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${p.activo ? 'activo' : 'inactivo'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(p)}
                      disabled={loadingId === p.id}
                      className={p.activo ? 'adm-btn-danger' : 'adm-btn-primary'}
                    >
                      {loadingId === p.id ? '…' : p.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminHorarios
