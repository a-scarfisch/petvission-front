import { useState } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import ClientLayout from './ClientLayout'
import apiClient from '@/modules/core/lib/apiClient'

const TABS = ['Información', 'Mis Mascotas', 'Seguridad']

const saludColor = {
  SALUDABLE: { bg: '#d1fae5', color: '#065f46' },
  PENDIENTE_VACUNA: { bg: '#fef3c7', color: '#92400e' },
  EN_TRATAMIENTO: { bg: '#fee2e2', color: '#991b1b' },
}

const MiPerfil = () => {
  const { user, saveUser } = useAuthContext()
  const { mascotas } = useClientContext()

  const [activeTab, setActiveTab] = useState('Información')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    nombres: user?.nombres ?? '',
    apellidos: user?.apellidos ?? '',
    telefono: user?.telefono ?? '',
  })

  const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' })
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
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
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
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwError('Las contraseñas nuevas no coinciden')
      return
    }
    if (pwForm.nueva.length < 8) {
      setPwError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    setPwError(null)
    setPwSaving(true)
    try {
      await apiClient.patch(`/usuarios/${user.idUsuario}/cambiar-password`, {
        passwordActual: pwForm.actual,
        passwordNueva: pwForm.nueva,
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
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toast.isError ? '#fee2e2' : '#d1fae5',
          color: toast.isError ? '#991b1b' : '#065f46',
          padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Cabecera */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>👤 Mi Perfil</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Tarjeta de perfil */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
      }}>
        {/* Banner */}
        <div style={{
          height: '100px',
          background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
        }} />

        {/* Info de cabecera */}
        <div style={{ padding: '0 32px 24px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#2a9d8f', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '28px',
            border: '4px solid #fff',
            position: 'absolute', top: '-40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {initials || '?'}
          </div>

          {/* Nombre + acciones */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            paddingTop: '48px',
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '20px', color: '#1a2535' }}>
                {user?.nombres} {user?.apellidos}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#6b7280' }}>{user?.correo}</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab === 'Información' && !isEditing && (
                <button onClick={() => setIsEditing(true)} style={btnOutline}>
                  ✏️ Editar
                </button>
              )}
              {activeTab === 'Información' && isEditing && (
                <>
                  <button onClick={handleCancel} style={btnOutline}>Cancelar</button>
                  <button onClick={handleSave} disabled={saving} style={btnPrimary}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginTop: '24px',
            borderBottom: '1px solid #e5e7eb',
          }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsEditing(false) }}
                style={{
                  padding: '10px 20px', border: 'none', cursor: 'pointer',
                  background: 'none', fontSize: '14px', fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#2a9d8f' : '#6b7280',
                  borderBottom: activeTab === tab ? '2px solid #2a9d8f' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del tab */}
        <div style={{ padding: '0 32px 32px' }}>

          {/* Tab: Información */}
          {activeTab === 'Información' && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>
              <FieldGroup label="Nombres" disabled={!isEditing}
                value={form.nombres}
                onChange={(v) => setForm((f) => ({ ...f, nombres: v }))}
              />
              <FieldGroup label="Apellidos" disabled={!isEditing}
                value={form.apellidos}
                onChange={(v) => setForm((f) => ({ ...f, apellidos: v }))}
              />
              <FieldGroup label="Correo electrónico" disabled value={user?.correo ?? ''} onChange={() => {}} />
              <FieldGroup label="Teléfono" disabled={!isEditing}
                value={form.telefono}
                onChange={(v) => setForm((f) => ({ ...f, telefono: v }))}
              />
              <FieldGroup label="Rol" disabled value={user?.rol ?? ''} onChange={() => {}} />
            </div>
          )}

          {/* Tab: Mis Mascotas */}
          {activeTab === 'Mis Mascotas' && (
            mascotas.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
                <p style={{ fontSize: '36px', margin: '0 0 8px' }}>🐾</p>
                <p>Aún no tienes mascotas registradas.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
              }}>
                {mascotas.map((m) => {
                  const salud = saludColor[m.estadoSalud] ?? { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <div key={m.idMascota} style={{
                      border: '1px solid #e5e7eb', borderRadius: '12px',
                      padding: '16px', textAlign: 'center',
                    }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: '#e8f5f0', margin: '0 auto 10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px',
                      }}>
                        {m.especie === 'PERRO' ? '🐶' : m.especie === 'GATO' ? '🐱' : '🐾'}
                      </div>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>{m.nombre}</p>
                      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}>
                        {m.raza ?? m.especie}
                      </p>
                      <span style={{
                        padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                        background: salud.bg, color: salud.color,
                      }}>
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
            <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>Cambiar contraseña</p>
              <PwField label="Contraseña actual" value={pwForm.actual}
                onChange={(v) => setPwForm((f) => ({ ...f, actual: v }))} />
              <PwField label="Nueva contraseña" value={pwForm.nueva}
                onChange={(v) => setPwForm((f) => ({ ...f, nueva: v }))} />
              <PwField label="Confirmar nueva contraseña" value={pwForm.confirmar}
                onChange={(v) => setPwForm((f) => ({ ...f, confirmar: v }))} />

              {pwError && (
                <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{pwError}</p>
              )}

              <button onClick={handlePwSave} disabled={pwSaving} style={{ ...btnPrimary, width: 'fit-content' }}>
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
      {label}
    </label>
    <input
      type="text"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
        border: '1px solid #e5e7eb',
        background: disabled ? '#f9fafb' : '#fff',
        color: disabled ? '#6b7280' : '#1a2535',
        outline: 'none',
      }}
    />
  </div>
)

const PwField = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
        border: '1px solid #e5e7eb', background: '#fff',
        color: '#1a2535', outline: 'none',
      }}
    />
  </div>
)

const btnPrimary = {
  padding: '9px 20px', borderRadius: '8px', border: 'none',
  background: '#2a9d8f', color: '#fff', fontWeight: 600,
  fontSize: '14px', cursor: 'pointer',
}

const btnOutline = {
  padding: '9px 20px', borderRadius: '8px',
  border: '1px solid #e5e7eb', background: '#fff',
  color: '#374151', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
}

export default MiPerfil
