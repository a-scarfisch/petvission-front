import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import VetLayout from './VetLayout'
import apiClient from '@/modules/core/lib/apiClient'

const VetHorarios = () => {
  const { user } = useAuthContext()
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ fecha: '', hora: '' })

  useEffect(() => {
    fetchHorarios()
  }, [])

  const fetchHorarios = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/horarios/veterinario/${user.idUsuario}`)
      setHorarios(data.data ?? [])
    } catch {
      setError('Error al cargar horarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const { data } = await apiClient.post('/horarios', {
        idVeterinario: user.idUsuario,
        fecha: form.fecha,
        hora: `${form.hora}:00`,
      })
      setHorarios((prev) => [...prev, data.data])
      setShowForm(false)
      setForm({ fecha: '', hora: '' })
    } catch {
      setError('Error al crear el horario')
    }
  }

  const handleDesactivar = async (id) => {
    if (!confirm('¿Desactivar este horario?')) return
    try {
      const { data } = await apiClient.patch(`/horarios/${id}/desactivar`)
      setHorarios((prev) =>
        prev.map((h) => h.id === id ? data.data : h)
      )
    } catch {
      alert('Error al desactivar el horario')
    }
  }

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  return (
    <VetLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🕐 Mis Horarios</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Gestiona tus bloques de disponibilidad
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#2a9d8f', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}
        >
          + Agregar horario
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '24px',
          marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Nuevo bloque de horario</h3>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#374151' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#374151' }}>
                  Hora
                </label>
                <input
                  type="time"
                  value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#2a9d8f', color: '#fff', border: 'none',
                  padding: '9px 24px', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                }}
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none', border: '1px solid #d1d5db',
                  padding: '9px 16px', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px',
                }}
              >
                Cancelar
              </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          </form>
        </div>
      )}

      {/* Listado */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '24px', color: '#6b7280' }}>Cargando horarios...</p>
        ) : horarios.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🕐</p>
            <p>No tienes horarios registrados.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Fecha', 'Hora', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', color: '#6b7280', fontWeight: 600,
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600 }}>{h.fecha}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#2a9d8f', fontWeight: 700 }}>
                    {formatHora(h.hora)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      background: h.disponible ? '#d1fae5' : '#fee2e2',
                      color: h.disponible ? '#065f46' : '#991b1b',
                    }}>
                      {h.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {h.disponible && (
                      <button
                        onClick={() => handleDesactivar(h.id)}
                        style={{
                          background: 'none', border: '1px solid #ef4444',
                          color: '#ef4444', padding: '6px 12px',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                        }}
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </VetLayout>
  )
}

export default VetHorarios