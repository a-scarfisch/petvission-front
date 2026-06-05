import { useState } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import ClientLayout from './ClientLayout'
import apiClient from '@/modules/core/lib/apiClient'
import '@/styles/global.css'
import '@/styles/modules/perfil.css'

const TABS = ['Información', 'Mis Mascotas', 'Seguridad']

const saludColor = {
  SALUDABLE:        { bg: '#d1fae5', color: '#065f46' },
  PENDIENTE_VACUNA: { bg: '#fef3c7', color: '#92400e' },
  EN_TRATAMIENTO:   { bg: '#fee2e2', color: '#991b1b' },
}

const MiPerfil = () => {
  const { user, saveUser } = useAuthContext()
  const { mascotas } = useClientContext()

  const [activeTab, setActiveTab] = useState('Información')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    nombres:   user?.nombres   ?? '',
    apellidos: user?.apellidos ?? '',
    telefono:  user?.telefono  ?? '',
  })

  const [pwForm, setPwForm]   = useState({ actual: '', nueva: '', confirmar: '' })
  const [pwError, setPwError] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  const initials = `${user?.nombres?.[0] ?? ''}${user?.apellidos?.[0] ?? ''}`.toUpperCase()

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await apiClient.put(`/usuarios/${user.idUsuario}`, {
        nombres:   form.nombres,
        apellidos: form.apellidos,
        telefono:  form.telefono,
      })
      saveUser({ ...user, ...data.data })
      setIsEditing(false)
      showToast('Perfil actualizado correctamente')
    } catch {
      showToast('Error al guardar los cambios', true)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ nombres: user?.nombres ?? '', apellidos: user?.apellidos ?? '', telefono: user?.telefono ?? '' })
    setIsEditing(false)
  }

  const handlePwSave = async () => {
    if (pwForm.nueva !== pwForm.confirmar) { setPwError('Las contraseñas nuevas no coinciden'); return }
    if (pwForm.nueva.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres'); return }
    setPwError(null)
    setPwSaving(true)
    try {
      await apiClient.patch(`/usuarios/${user.idUsuario}/cambiar-password`, {
        passwordActual: pwForm.actual,
        passwordNueva:  pwForm.nueva,
      })
      setPwForm({ actual: '', nueva: '', confirmar: '' })
      showToast('Contraseña actualizada correctamente')
    } catch {
      setPwError('Contraseña actual incorrecta')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <ClientLayout>
      {/* Toast */}
      {toast && (
        <div className={`perfil-toast${toast.isError ? ' perfil-toast--error' : ''}`}>
          {toast.msg}
        </div>
      )}

      {/* Header de página */}
      <div className="pv-page-header">
        <div>
          <h2 className="pv-page-title">👤 Mi Perfil</h2>
          <p className="pv-page-subtitle">Gestiona tu información personal y configuración de cuenta</p>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="pv-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Banner */}
        <div className="perfil-banner" />

        {/* Cabecera */}
        <div className="perfil-head">
          <div className="perfil-avatar">{initials || '?'}</div>

          <div className="perfil-head__info">
            <div>
              <p className="perfil-head__name">{user?.nombres} {user?.apellidos}</p>
              <p className="perfil-head__email">{user?.correo}</p>
            </div>
            <div className="perfil-head__actions">
              {activeTab === 'Información' && !isEditing && (
                <button className="pv-btn-outline" onClick={() => setIsEditing(true)}>✏️ Editar</button>
              )}
              {activeTab === 'Información' && isEditing && (
                <>
                  <button className="pv-btn-outline" onClick={handleCancel}>Cancelar</button>
                  <button className="pv-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="perfil-tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`perfil-tab${activeTab === tab ? ' perfil-tab--active' : ''}`}
                onClick={() => { setActiveTab(tab); setIsEditing(false) }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="perfil-body">

          {/* Tab: Información */}
          {activeTab === 'Información' && (
            <div className="perfil-grid">
              <FieldGroup label="Nombres" disabled={!isEditing}
                value={form.nombres} onChange={(v) => setForm((f) => ({ ...f, nombres: v }))} />
              <FieldGroup label="Apellidos" disabled={!isEditing}
                value={form.apellidos} onChange={(v) => setForm((f) => ({ ...f, apellidos: v }))} />
              <FieldGroup label="Correo electrónico" disabled value={user?.correo ?? ''} onChange={() => {}} />
              <FieldGroup label="Teléfono" disabled={!isEditing}
                value={form.telefono} onChange={(v) => setForm((f) => ({ ...f, telefono: v }))} />
            </div>
          )}

          {/* Tab: Mis Mascotas */}
          {activeTab === 'Mis Mascotas' && (
            mascotas.length === 0 ? (
              <div className="pv-empty">
                <p className="pv-empty__icon">🐾</p>
                <p className="pv-empty__text">Aún no tienes mascotas registradas.</p>
              </div>
            ) : (
              <div className="perfil-mascotas-grid">
                {mascotas.map((m) => {
                  const salud = saludColor[m.estadoSalud] ?? { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <div key={m.idMascota} className="perfil-mascota-card">
                      <div className="perfil-mascota-card__avatar">
                        {m.especie === 'PERRO' ? '🐶' : m.especie === 'GATO' ? '🐱' : '🐾'}
                      </div>
                      <p className="perfil-mascota-card__nombre">{m.nombre}</p>
                      <p className="perfil-mascota-card__meta">{m.raza ?? m.especie}</p>
                      <span className="pv-badge" style={{ background: salud.bg, color: salud.color }}>
                        {m.estadoSalud ?? 'Sin estado'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Tab: Seguridad */}
          {activeTab === 'Seguridad' && (
            <div className="perfil-seguridad">
              <p className="perfil-seguridad__titulo">Cambiar contraseña</p>
              <PwField label="Contraseña actual"         value={pwForm.actual}    onChange={(v) => setPwForm((f) => ({ ...f, actual: v }))} />
              <PwField label="Nueva contraseña"          value={pwForm.nueva}     onChange={(v) => setPwForm((f) => ({ ...f, nueva: v }))} />
              <PwField label="Confirmar nueva contraseña" value={pwForm.confirmar} onChange={(v) => setPwForm((f) => ({ ...f, confirmar: v }))} />
              {pwError && <p className="perfil-pw-error">{pwError}</p>}
              <button className="pv-btn-primary" onClick={handlePwSave} disabled={pwSaving}>
                {pwSaving ? 'Guardando…' : 'Actualizar contraseña'}
              </button>
            </div>
          )}

        </div>
      </div>
    </ClientLayout>
  )
}

const FieldGroup = ({ label, value, disabled, onChange }) => (
  <div className="perfil-field">
    <label className="perfil-field__label">{label}</label>
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`perfil-field__input${disabled ? ' perfil-field__input--disabled' : ''}`}
    />
  </div>
)

const PwField = ({ label, value, onChange }) => (
  <div className="perfil-field">
    <label className="perfil-field__label">{label}</label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="perfil-field__input"
    />
  </div>
)

export default MiPerfil
