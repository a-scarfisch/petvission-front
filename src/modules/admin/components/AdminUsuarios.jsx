import { useState } from 'react'
import { useAdminContext } from '@/modules/admin/states/AdminContext'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const FORM_VACIO = {
  nombres: '', apellidos: '', correo: '',
  telefono: '', contrasena: '', especialidad: '',
}

const ROLES = ['Todos', 'CLIENTE', 'VETERINARIO', 'ADMINISTRADOR']

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>👥 Usuarios</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Gestiona todos los usuarios del sistema
          </p>
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

      <div className="adm-table-wrapper">
        {usuariosFiltrados.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">👥</p>
            <p>No se encontraron usuarios.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.idUsuario}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="adm-avatar">{u.nombres?.[0]}{u.apellidos?.[0]}</div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        {u.nombres} {u.apellidos}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{u.correo}</td>
                  <td style={{ color: '#6b7280' }}>{u.telefono ?? '—'}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${u.rol}`}>{u.rol}</span>
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${u.estado ? 'activo' : 'inactivo'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
