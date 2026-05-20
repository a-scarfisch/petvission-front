import { useState } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'

const rolEstilo = {
  CLIENTE: { background: '#dbeafe', color: '#1e40af' },
  VETERINARIO: { background: '#d1fae5', color: '#065f46' },
  ADMINISTRADOR: { background: '#ede9fe', color: '#5b21b6' },
}

const AdminUsuarios = () => {
  const { usuarios, loading } = useAdminContext()

  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const ROLES = ['Todos', 'CLIENTE', 'VETERINARIO', 'ADMINISTRADOR']

  const usuariosFiltrados = usuarios
    .filter((u) => filtro === 'Todos' || u.rol === filtro)
    .filter((u) =>
      `${u.nombres} ${u.apellidos} ${u.correo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )

  if (loading) return <AdminLayout><p>Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>👥 Usuarios</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Gestiona todos los usuarios del sistema
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1, padding: '9px 14px', borderRadius: '8px',
            border: '1px solid #e5e7eb', fontSize: '14px',
          }}
        />
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFiltro(r)}
            style={{
              padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
              cursor: 'pointer', fontWeight: filtro === r ? 600 : 400,
              background: filtro === r ? '#6366f1' : '#fff',
              color: filtro === r ? '#fff' : '#374151',
              border: filtro === r ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {usuariosFiltrados.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>👥</p>
            <p>No se encontraron usuarios.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado'].map((h) => (
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
              {usuariosFiltrados.map((u) => (
                <tr key={u.idUsuario} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#e0e7ff', color: '#4338ca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px',
                      }}>
                        {u.nombres?.[0]}{u.apellidos?.[0]}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
                          {u.nombres} {u.apellidos}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>
                    {u.correo}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>
                    {u.telefono ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      ...(rolEstilo[u.rol] ?? { background: '#f3f4f6', color: '#374151' }),
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                      background: u.estado ? '#d1fae5' : '#fee2e2',
                      color: u.estado ? '#065f46' : '#991b1b',
                    }}>
                      {u.estado ? 'Activo' : 'Inactivo'}
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

export default AdminUsuarios