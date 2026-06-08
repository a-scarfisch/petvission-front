import { useState, useEffect } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import AdminLayout from './AdminLayout'
import TablaResponsiva from './TablaResponsiva'

const ESTADOS = ['Todas', 'PENDIENTE', 'CONFIRMADA', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA']

const ESTADO_LABEL = {
  Todas:       'Todas',
  PENDIENTE:   'Pendiente',
  CONFIRMADA:  'Confirmada',
  EN_ATENCION: 'En atención',
  COMPLETADA:  'Completada',
  CANCELADA:   'Cancelada',
}

const formatHora = (hora) => hora?.slice(0, 5) ?? '—'

const COLUMNAS = [
  {
    key: 'fecha',
    label: 'Fecha',
    primary: true,
    render: (c) => (
      <div className="adm-fecha-cell">
        <span className="adm-fecha-dia">{c.fecha?.split('-')[2]}</span>
        <span className="adm-fecha-mes">
          {new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short' })}
        </span>
      </div>
    ),
  },
  {
    key: 'hora',
    label: 'Hora',
    render: (c) => <span className="adm-text-teal">{formatHora(c.hora)}</span>,
  },
  {
    key: 'nombreCliente',
    label: 'Cliente',
    primary: true,
    render: (c) => <span className="tbl-card__name">{c.nombreCliente}</span>,
  },
  { key: 'nombreVeterinario', label: 'Veterinario' },
  { key: 'motivo', label: 'Motivo', render: (c) => c.motivo ?? 'Consulta general' },
  {
    key: 'estado',
    label: 'Estado',
    primary: true,
    render: (c) => (
      <span className={`adm-badge adm-badge--${c.estado}`}>{c.estado}</span>
    ),
  },
]

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
            {ESTADO_LABEL[e]}
          </button>
        ))}
      </div>

      <TablaResponsiva
        columnas={COLUMNAS}
        datos={citasFiltradas}
        keyField="idReserva"
        emptyIcon="📅"
        emptyMessage="No se encontraron citas."
      />
    </AdminLayout>
  )
}

export default AdminCitas
