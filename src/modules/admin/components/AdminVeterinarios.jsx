import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const AdminVeterinarios = () => {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await apiClient.get('/usuarios/veterinarios')
        setVets(data.data ?? [])
      } catch (err) {
        console.error('Error cargando veterinarios:', handleError(err))
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const filtrados = vets.filter((v) =>
    `${v.nombres} ${v.apellidos} ${v.correo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>👨‍⚕️ Veterinarios</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Gestión del equipo médico ({vets.length} veterinarios)
        </p>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="adm-table-wrapper">
        {filtrados.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">👨‍⚕️</p>
            <p>No se encontraron veterinarios.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Veterinario', 'Correo', 'Teléfono', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((v) => (
                <tr key={v.idUsuario}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="adm-avatar">{v.nombres?.[0]}{v.apellidos?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{v.nombres} {v.apellidos}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{v.correo}</td>
                  <td style={{ color: '#6b7280' }}>{v.telefono ?? '—'}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${v.estado ? 'activo' : 'inactivo'}`}>
                      {v.estado ? 'Activo' : 'Inactivo'}
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

export default AdminVeterinarios
