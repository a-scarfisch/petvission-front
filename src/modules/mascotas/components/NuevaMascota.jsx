import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { crearMascota } from '../services/mascotasService'
import ClientLayout from '@/modules/client/components/ClientLayout'

const ESPECIES = [
  { valor: 'PERRO', emoji: '🐶', label: 'Perro' },
  { valor: 'GATO',  emoji: '🐱', label: 'Gato'  },
  { valor: 'AVE',   emoji: '🐦', label: 'Ave'   },
  { valor: 'OTRO',  emoji: '🐹', label: 'Otro'  },
]

const SALUD = [
  { valor: 'SALUDABLE',        label: '✔ Saludable',          bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  { valor: 'PENDIENTE_VACUNA', label: '💉 Vacuna pendiente',   bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  { valor: 'EN_TRATAMIENTO',   label: '🩺 En tratamiento',     bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
]

const NuevaMascota = () => {
  const { user } = useAuthContext()
  const { addMascota } = useClientContext()
  const navigate = useNavigate()
  const avatarRef = useRef(null)

  const [form, setForm] = useState({
    nombre: '',
    especie: 'PERRO',
    raza: '',
    sexo: '',
    fechaNacimiento: '',
    peso: '',
    color: '',
    notas: '',
    estadoSalud: 'SALUDABLE',
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    setError(null)
    setLoading(true)
    try {
      const nueva = await crearMascota(user.idUsuario, {
        nombre: form.nombre.trim(),
        especie: form.especie,
        raza: form.raza || null,
        sexo: form.sexo || null,
        fechaNacimiento: form.fechaNacimiento || null,
        peso: form.peso ? parseFloat(form.peso) : null,
        color: form.color || null,
        estadoSalud: form.estadoSalud,
        notas: form.notas || null,
      })
      addMascota(nueva)
      navigate('/client/mascotas')
    } catch {
      setError('No se pudo registrar la mascota. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const especieEmoji = ESPECIES.find((e) => e.valor === form.especie)?.emoji ?? '🐾'

  return (
    <ClientLayout>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/client/mascotas')}
          style={{
            background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
            padding: '8px 14px', cursor: 'pointer', fontSize: '14px', color: '#374151',
          }}
        >
          ← Volver
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🐾 Nueva Mascota</h2>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Registra a tu compañero de vida
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '32px',
          display: 'flex', flexDirection: 'column', gap: '28px',
        }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={() => avatarRef.current?.click()}
              style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#e8f5f0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: avatarPreview ? 0 : '44px',
                border: '3px dashed #2a9d8f',
                overflow: 'hidden', position: 'relative',
              }}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : especieEmoji
              }
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              style={{
                background: 'none', border: 'none', color: '#2a9d8f',
                fontSize: '13px', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {avatarPreview ? 'Cambiar foto' : 'Subir foto (opcional)'}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          {/* Especie */}
          <div>
            <p style={sectionLabel}>Especie</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {ESPECIES.map((e) => (
                <button
                  key={e.valor}
                  type="button"
                  onClick={() => set('especie', e.valor)}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '15px', fontWeight: form.especie === e.valor ? 700 : 400,
                    border: form.especie === e.valor ? '2px solid #2a9d8f' : '2px solid #e5e7eb',
                    background: form.especie === e.valor ? '#e8f5f0' : '#fff',
                    color: form.especie === e.valor ? '#2a9d8f' : '#374151',
                  }}
                >
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Información básica */}
          <div>
            <p style={sectionLabel}>Información básica</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Nombre *">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => set('nombre', e.target.value)}
                  placeholder="Ej: Rocky"
                  style={inputStyle}
                />
              </Field>
              <Field label="Raza">
                <input
                  type="text"
                  value={form.raza}
                  onChange={(e) => set('raza', e.target.value)}
                  placeholder="Ej: Labrador"
                  style={inputStyle}
                />
              </Field>
              <Field label="Fecha de nacimiento">
                <input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => set('fechaNacimiento', e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="Peso (kg)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.peso}
                  onChange={(e) => set('peso', e.target.value)}
                  placeholder="Ej: 8.5"
                  style={inputStyle}
                />
              </Field>
              <Field label="Sexo">
                <select value={form.sexo} onChange={(e) => set('sexo', e.target.value)} style={inputStyle}>
                  <option value="">Seleccionar</option>
                  <option value="MACHO">Macho</option>
                  <option value="HEMBRA">Hembra</option>
                </select>
              </Field>
              <Field label="Color">
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  placeholder="Ej: Café con blanco"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Estado de salud */}
          <div>
            <p style={sectionLabel}>Estado de salud</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {SALUD.map((s) => (
                <button
                  key={s.valor}
                  type="button"
                  onClick={() => set('estadoSalud', s.valor)}
                  style={{
                    padding: '9px 18px', borderRadius: '99px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: form.estadoSalud === s.valor ? 600 : 400,
                    border: `2px solid ${form.estadoSalud === s.valor ? s.border : '#e5e7eb'}`,
                    background: form.estadoSalud === s.valor ? s.bg : '#fff',
                    color: form.estadoSalud === s.valor ? s.color : '#6b7280',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <Field label="Notas adicionales (opcional)">
            <textarea
              value={form.notas}
              onChange={(e) => set('notas', e.target.value)}
              placeholder="Ej: Alérgico al pollo, toma medicamento X..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>

          {/* Error */}
          {error && (
            <p style={{ margin: 0, color: '#ef4444', fontSize: '13px' }}>{error}</p>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/client/mascotas')}
              style={{
                padding: '11px 24px', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: '#fff',
                color: '#374151', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px 28px', borderRadius: '8px', border: 'none',
                background: '#2a9d8f', color: '#fff', fontWeight: 600,
                fontSize: '14px', cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Guardando…' : '✓ Registrar mascota'}
            </button>
          </div>

        </div>
      </form>
    </ClientLayout>
  )
}

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
      {label}
    </label>
    {children}
  </div>
)

const sectionLabel = {
  margin: '0 0 12px', fontSize: '13px', fontWeight: 700,
  color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid #e5e7eb', fontSize: '14px',
  color: '#1a2535', background: '#fff', boxSizing: 'border-box',
  outline: 'none',
}

export default NuevaMascota
