import { useState, useEffect } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'
import TablaResponsiva from './TablaResponsiva'

const COLUMNAS = [
  {
    key: 'nombres',
    label: 'Veterinario',
    primary: true,
    render: (v) => (
      <div className="tbl-card__ident">
        <div className="adm-avatar">{v.nombres?.[0]}{v.apellidos?.[0]}</div>
        <span className="tbl-card__name">{v.nombres} {v.apellidos}</span>
      </div>
    ),
  },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono', render: (v) => v.telefono ?? '—' },
  {
    key: 'estado',
    label: 'Estado',
    primary: true,
    render: (v) => (
      <span className={`adm-badge adm-badge--${v.estado ? 'activo' : 'inactivo'}`}>
        {v.estado ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
]

const AdminVeterinarios = () => {
  const [vets, setVets]         = useState([])
  const [loading, setLoading]   = useState(true)
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
      .toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="adm-page-header">
        <h2 className="adm-page-header__title">👨‍⚕️ Veterinarios</h2>
        <p className="adm-page-header__sub">
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

      <TablaResponsiva
        columnas={COLUMNAS}
        datos={filtrados}
        keyField="idUsuario"
        emptyIcon="👨‍⚕️"
        emptyMessage="No se encontraron veterinarios."
      />
    </AdminLayout>
  )
}

export default AdminVeterinarios
