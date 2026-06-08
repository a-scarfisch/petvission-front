import { useState } from 'react'
import ClientLayout from './ClientLayout'
import '@/styles/global.css'
import '@/styles/modules/config.css'

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
      {saved && <div className="perfil-toast">✓ Configuración guardada</div>}

      <div className="pv-page-header">
        <div>
          <h2 className="pv-page-title">⚙️ Mi Configuración</h2>
          <p className="pv-page-subtitle">Personaliza tus preferencias de notificaciones y cuenta</p>
        </div>
      </div>

      <div className="cfg-stack">

        <Section title="🔔 Notificaciones">
          <ToggleRow
            label="Recordatorio de citas"
            description="Recibe un aviso antes de cada cita programada"
            checked={config.notifCita}
            onChange={(v) => set('notifCita', v)}
          />
          {config.notifCita && (
            <div className="cfg-indent">
              <label className="cfg-field-label">Avisar con</label>
              <select
                value={config.recordatorioDias}
                onChange={(e) => set('recordatorioDias', e.target.value)}
                className="cfg-select cfg-select--inline"
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

        <Section title="🔒 Privacidad">
          <ToggleRow
            label="Perfil visible para veterinarios"
            description="Los veterinarios pueden ver tu nombre e historial al atender a tus mascotas"
            checked={config.privacidadPerfil}
            onChange={(v) => set('privacidadPerfil', v)}
          />
        </Section>

        <Section title="🌐 Preferencias">
          <div className="cfg-field">
            <label className="cfg-field-label">Idioma</label>
            <select
              value={config.idioma}
              onChange={(e) => set('idioma', e.target.value)}
              className="cfg-select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </Section>

        <Section title="⚠️ Zona de peligro" danger>
          <div className="cfg-danger-row">
            <div>
              <p className="cfg-danger-row__title">Eliminar cuenta</p>
              <p className="cfg-danger-row__desc">Esta acción es irreversible. Se eliminarán todos tus datos y mascotas.</p>
            </div>
            <button
              className="cfg-btn-danger"
              onClick={() => {
                if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
                  alert('Funcionalidad no disponible aún. Contacta a soporte.')
                }
              }}
            >
              Eliminar cuenta
            </button>
          </div>
        </Section>

        <div className="cfg-footer">
          <button className="pv-btn-primary" onClick={handleGuardar}>
            Guardar cambios
          </button>
        </div>

      </div>
    </ClientLayout>
  )
}

const Section = ({ title, children, danger = false }) => (
  <div className={`cfg-section${danger ? ' cfg-section--danger' : ''}`}>
    <div className={`cfg-section__header${danger ? ' cfg-section__header--danger' : ''}`}>
      <p className={`cfg-section__title${danger ? ' cfg-section__title--danger' : ''}`}>{title}</p>
    </div>
    <div className="cfg-section__body">{children}</div>
  </div>
)

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="cfg-toggle-row">
    <div>
      <p className="cfg-toggle-row__label">{label}</p>
      {description && <p className="cfg-toggle-row__desc">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`cfg-toggle${checked ? ' cfg-toggle--on' : ''}`}
    >
      <span className="cfg-toggle__thumb" style={{ left: checked ? '23px' : '3px' }} />
    </button>
  </div>
)

const Divider = () => <div className="cfg-divider" />

export default MiConfiguracion
