import { useState } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'
import TablaResponsiva from './TablaResponsiva'

const FORM_VACIO = {
  nombres: '', apellidos: '', correo: '',
  telefono: '', contrasena: '', especialidad: '',
}

const ROLES = ['Todos', 'CLIENTE', 'VETERINARIO', 'ADMINISTRADOR']

const COLUMNAS = [
  {
    key: 'nombres',
    label: 'Usuario',
    primary: true,
    render: (u) => (
      <div className="tbl-card__ident">
        <div className="adm-avatar">{u.nombres?.[0]}{u.apellidos?.[0]}</div>
        <span className="tbl-card__name">{u.nombres} {u.apellidos}</span>
      </div>
    ),
  },
  { key: 'correo', label: 'Correo' },
  { key: 'telefono', label: 'Teléfono', render: (u) => u.telefono ?? '—' },
  {
    key: 'rol',
    label: 'Rol',
    render: (u) => <span className={`adm-badge adm-badge--${u.rol}`}>{u.rol}</span>,
  },
  {
    key: 'estado',
    label: 'Estado',
    primary: true,
    render: (u) => (
      <span className={`adm-badge adm-badge--${u.estado ? 'activo' : 'inactivo'}`}>
        {u.estado ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
]

const AdminUsuarios = () => {
  const { usuarios, loading, addUsuario } = useAdminContext()
  const [filtro, setFiltro]     = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(FORM_VACIO)
  const [saving, setSaving]     = useState(false)
  const [exito, setExito]       = useState('')
  const [error, setError]       = useState('')

  const usuariosFiltrados = usuarios
    .filter((u) => filtro === 'Todos' || u.rol === filtro)
    .filter((u) =>
      `${u.nombres} ${u.apellidos} ${u.correo}`
        .toLowerCase().includes(busqueda.toLowerCase())
    )

  const abrirModal  = () => { setForm(FORM_VACIO); setExito(''); setError(''); setModal(true) }
  const cerrarModal = () => setModal(false)
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await apiClient.post('/admin/veterinarios', form)
      addUsuario(data.data)
      setExito(`Veterinario ${data.data.nombres} creado exitosamente.`)
      setForm(FORM_VACIO)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="adm-page-header adm-page-header--row">
        <div>
          <h2 className="adm-page-header__title">👥 Usuarios</h2>
          <p className="adm-page-header__sub">Gestiona todos los usuarios del sistema</p>
        </div>
        <button className="adm-btn-primary" onClick={abrirModal}>
          ➕ Nuevo veterinario
        </button>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFiltro(r)}
            className={`adm-filtro-btn${filtro === r ? ' adm-filtro-btn--active' : ''}`}
          >
            {r}
          </button>
        ))}
      </div>

      <TablaResponsiva
        columnas={COLUMNAS}
        datos={usuariosFiltrados}
        keyField="idUsuario"
        emptyIcon="👥"
        emptyMessage="No se encontraron usuarios."
      />

      {modal && (
        <div className="adm-modal-overlay" onClick={cerrarModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">➕ Nuevo veterinario</h3>
              <button className="adm-modal__close" onClick={cerrarModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-modal__body">
                {exito && <p className="adm-msg-success">{exito}</p>}
                {error && <p className="adm-msg-error">{error}</p>}
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Nombres *</label>
                    <input className="adm-form-input" name="nombres" value={form.nombres}
                      onChange={handleChange} required />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Apellidos *</label>
                    <input className="adm-form-input" name="apellidos" value={form.apellidos}
                      onChange={handleChange} required />
                  </div>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Correo electrónico *</label>
                  <input className="adm-form-input" type="email" name="correo" value={form.correo}
                    onChange={handleChange} required />
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-form-label">Teléfono</label>
                    <input className="adm-form-input" name="telefono" value={form.telefono}
                      onChange={handleChange} />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-form-label">Especialidad</label>
                    <input className="adm-form-input" name="especialidad" value={form.especialidad}
                      onChange={handleChange} placeholder="Medicina General" />
                  </div>
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Contraseña temporal *</label>
                  <input className="adm-form-input" type="password" name="contrasena"
                    value={form.contrasena} onChange={handleChange} minLength={8} required />
                </div>
              </div>
              <div className="adm-modal__footer">
                <button type="button" className="adm-btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="adm-btn-primary" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear veterinario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsuarios
