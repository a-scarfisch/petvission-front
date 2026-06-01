import { useState, useEffect } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'

const ESTADOS = ['Todas', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'REPROGRAMADA']

const AdminCitas = () => {
  const { citas, loading, recargar } = useAdminContext()
  const [filtro, setFiltro]     = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { recargar() }, [recargar])

  const citasFiltradas = citas
    .filter((c) => filtro === 'Todas' || c.estado === filtro)
    .filter((c) =>
      `${c.nombreCliente} ${c.nombreVeterinario} ${c.motivo}`
        .toLowerCase().includes(busqueda.toLowerCase())
    )

  const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

  if (loading) return <AdminLayout><p>Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="adm-page-header">
        <h2 className="adm-page-header__title">📅 Citas</h2>
        <p className="adm-page-header__sub">Todas las citas del sistema</p>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por cliente, veterinario o motivo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`adm-filtro-btn${filtro === e ? ' adm-filtro-btn--active' : ''}`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="adm-table-wrapper">
        {citasFiltradas.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">📅</p>
            <p>No se encontraron citas.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Fecha', 'Hora', 'Cliente', 'Veterinario', 'Motivo', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((c) => (
                <tr key={c.idReserva}>
                  <td>
                    <div className="adm-fecha-cell">
                      <span className="adm-fecha-dia">{c.fecha?.split('-')[2]}</span>
                      <span className="adm-fecha-mes">
                        {new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td><span className="adm-text-teal">{formatHora(c.hora)}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{c.nombreCliente}</span></td>
                  <td>{c.nombreVeterinario}</td>
                  <td style={{ color: '#6b7280' }}>{c.motivo ?? 'Consulta general'}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${c.estado}`}>{c.estado}</span>
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

export default AdminCitas
