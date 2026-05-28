import { useState } from 'react'
import ClientLayout from './ClientLayout'

const STORAGE_KEY = 'pv_config'

const defaultConfig = {
  notifCita: true,
  notifVacuna: true,
  notifPromos: false,
  privacidadPerfil: true,
  idioma: 'es',
  recordatorioDias: '1',
}

const loadConfig = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig
  } catch {
    return defaultConfig
  }
}

const MiConfiguracion = () => {
  const [config, setConfig] = useState(loadConfig)
  const [saved, setSaved] = useState(false)

  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }))

  const handleGuardar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <ClientLayout>
      {/* Toast */}
      {saved && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: '#d1fae5', color: '#065f46',
          padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 500,
        }}>
          ✓ Configuración guardada
        </div>
      )}

      {/* Cabecera */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>⚙️ Mi Configuración</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Personaliza tus preferencias de notificaciones y cuenta
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>

        {/* Notificaciones */}
        <Section title="🔔 Notificaciones">
          <ToggleRow
            label="Recordatorio de citas"
            description="Recibe un aviso antes de cada cita programada"
            checked={config.notifCita}
            onChange={(v) => set('notifCita', v)}
          />

          {config.notifCita && (
            <div style={{
              paddingLeft: '16px', borderLeft: '3px solid #e8f5f0',
              marginTop: '-4px',
            }}>
              <label style={fieldLabel}>Avisar con</label>
              <select
                value={config.recordatorioDias}
                onChange={(e) => set('recordatorioDias', e.target.value)}
                style={{ ...selectStyle, width: 'auto' }}
              >
                <option value="1">1 día de anticipación</option>
                <option value="2">2 días de anticipación</option>
                <option value="3">3 días de anticipación</option>
              </select>
            </div>
          )}

          <Divider />

          <ToggleRow
            label="Alertas de vacuna pendiente"
            description="Notificación cuando una mascota tenga vacunas por aplicar"
            checked={config.notifVacuna}
            onChange={(v) => set('notifVacuna', v)}
          />

          <Divider />

          <ToggleRow
            label="Novedades y promociones"
            description="Información sobre nuevos servicios y descuentos"
            checked={config.notifPromos}
            onChange={(v) => set('notifPromos', v)}
          />
        </Section>

        {/* Privacidad */}
        <Section title="🔒 Privacidad">
          <ToggleRow
            label="Perfil visible para veterinarios"
            description="Los veterinarios pueden ver tu nombre e historial al atender a tus mascotas"
            checked={config.privacidadPerfil}
            onChange={(v) => set('privacidadPerfil', v)}
          />
        </Section>

        {/* Preferencias */}
        <Section title="🌐 Preferencias">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={fieldLabel}>Idioma</label>
            <select
              value={config.idioma}
              onChange={(e) => set('idioma', e.target.value)}
              style={selectStyle}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </Section>

        {/* Zona de peligro */}
        <Section title="⚠️ Zona de peligro" danger>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                Eliminar cuenta
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9ca3af' }}>
                Esta acción es irreversible. Se eliminarán todos tus datos y mascotas.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                  alert('Funcionalidad no disponible aún. Contacta a soporte.')
                }
              }}
              style={{
                padding: '9px 18px', borderRadius: '8px', border: 'none',
                background: '#fee2e2', color: '#991b1b',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                flexShrink: 0, marginLeft: '16px',
              }}
            >
              Eliminar cuenta
            </button>
          </div>
        </Section>

        {/* Guardar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button onClick={handleGuardar} style={btnPrimary}>
            Guardar cambios
          </button>
        </div>

      </div>
    </ClientLayout>
  )
}

const Section = ({ title, children, danger = false }) => (
  <div style={{
    background: '#fff', borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: danger ? '1px solid #fecaca' : 'none',
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '14px 20px',
      borderBottom: '1px solid #f3f4f6',
      background: danger ? '#fff5f5' : '#fafafa',
    }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: danger ? '#991b1b' : '#374151' }}>
        {title}
      </p>
    </div>
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {children}
    </div>
  </div>
)

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
    <div>
      <p style={{ margin: 0, fontWeight: 500, fontSize: '14px', color: '#1a2535' }}>{label}</p>
      {description && (
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '44px', height: '24px', borderRadius: '99px', border: 'none',
        background: checked ? '#2a9d8f' : '#d1d5db',
        cursor: 'pointer', position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
)

const Divider = () => (
  <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 -20px' }} />
)

const fieldLabel = {
  fontSize: '12px', fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', display: 'block', marginBottom: '6px',
}

const selectStyle = {
  padding: '9px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
  fontSize: '14px', color: '#1a2535', background: '#fff', outline: 'none',
  width: '100%',
}

const btnPrimary = {
  padding: '11px 28px', borderRadius: '8px', border: 'none',
  background: '#2a9d8f', color: '#fff', fontWeight: 600,
  fontSize: '14px', cursor: 'pointer',
}

export default MiConfiguracion
