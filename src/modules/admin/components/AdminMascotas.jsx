import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const FILTROS = ['Todas', 'PERRO', 'GATO', 'Inactivas']

const especieEmoji = (especie) => {
  const map = { GATO: '🐱', AVE: '🐦', OTRO: '🐹' }
  return map[especie?.toUpperCase()] ?? '🐶'
}

const AdminMascotas = () => {
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await apiClient.get('/mascotas/todas')
        setMascotas(data.data ?? [])
      } catch (err) {
        console.error('Error cargando mascotas:', handleError(err))
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const filtradas = mascotas
    .filter((m) => {
      if (filtro === 'PERRO')    return m.especie?.toUpperCase() === 'PERRO'
      if (filtro === 'GATO')     return m.especie?.toUpperCase() === 'GATO'
      if (filtro === 'Inactivas') return !m.estado
      return true
    })
    .filter((m) =>
      `${m.nombre} ${m.nombreUsuario}`.toLowerCase().includes(busqueda.toLowerCase())
    )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🐾 Mascotas</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Todas las mascotas registradas en el sistema ({mascotas.length})
        </p>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por nombre o dueño..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`adm-filtro-btn${filtro === f ? ' adm-filtro-btn--active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="adm-table-wrapper">
        {filtradas.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">🐾</p>
            <p>No se encontraron mascotas.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Mascota', 'Especie', 'Raza', 'Dueño', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((m) => (
                <tr key={m.idMascota}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="adm-avatar" style={{ background: '#e8f5f0', color: '#2a9d8f', fontSize: '17px' }}>
                        {especieEmoji(m.especie)}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                        {m.animalGuia && (
                          <span className="adm-badge adm-badge--activo" style={{ marginLeft: '6px', fontSize: '11px' }}>
                            🦮 Guía
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{m.especie}</td>
                  <td>{m.raza ?? '—'}</td>
                  <td>{m.nombreUsuario}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${m.estado ? 'activo' : 'inactivo'}`}>
                      {m.estado ? 'Activo' : 'Inactivo'}
                    </span>
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

export default AdminMascotas
