import { useState } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import AdminLayout from './AdminLayout'

const AdminSeguridad = () => {
  const { user } = useAuthContext()

  const [qrDataUrl, setQrDataUrl]   = useState(null)
  const [secret, setSecret]         = useState(null)
  const [codigo, setCodigo]         = useState('')
  const [loadingSetup, setLoadingSetup] = useState(false)
  const [loadingEnable, setLoadingEnable] = useState(false)
  const [loadingDisable, setLoadingDisable] = useState(false)
  const [mensaje, setMensaje]       = useState(null)
  const [error, setError]           = useState(null)

  // Derivamos el estado 2FA desde el user en contexto
  // Si el backend lo incluyera en el JWT / user stored, lo leemos de ahí
  // Si no, usamos un estado local que se actualiza al operar
  const [totpActivo, setTotpActivo] = useState(false)
  const [yaVerificado, setYaVerificado] = useState(false)

  const limpiar = () => { setMensaje(null); setError(null) }

  const handleSetup = async () => {
    limpiar()
    setLoadingSetup(true)
    try {
      const { data } = await apiClient.post('/auth/2fa/setup')
      setQrDataUrl(data.data.qrDataUrl)
      setSecret(data.data.secret)
      setCodigo('')
      setYaVerificado(false)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoadingSetup(false)
    }
  }

  const handleEnable = async (e) => {
    e.preventDefault()
    if (codigo.length < 6) return
    limpiar()
    setLoadingEnable(true)
    try {
      await apiClient.post('/auth/2fa/enable', { codigo })
      setTotpActivo(true)
      setYaVerificado(true)
      setQrDataUrl(null)
      setSecret(null)
      setCodigo('')
      setMensaje('2FA activado correctamente. En el próximo login se te pedirá el código.')
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoadingEnable(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('¿Desactivar el 2FA? Perderás la protección adicional en el login.')) return
    limpiar()
    setLoadingDisable(true)
    try {
      await apiClient.delete('/auth/2fa/disable')
      setTotpActivo(false)
      setQrDataUrl(null)
      setSecret(null)
      setMensaje('2FA desactivado.')
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoadingDisable(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🔐 Seguridad</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Autenticación en dos factores (2FA) para tu cuenta de administrador
        </p>
      </div>

      {mensaje && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
          background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '14px',
        }}>
          ✓ {mensaje}
        </div>
      )}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
          background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        padding: '28px', maxWidth: '520px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: totpActivo || yaVerificado ? '#f0fdf4' : '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
          }}>
            {totpActivo || yaVerificado ? '✅' : '🔓'}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>
              {totpActivo || yaVerificado ? '2FA activo' : '2FA inactivo'}
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
              {totpActivo || yaVerificado
                ? 'Tu cuenta requiere código al iniciar sesión'
                : 'Agrega una capa extra de seguridad al login'}
            </p>
          </div>
        </div>

        {!(totpActivo || yaVerificado) && !qrDataUrl && (
          <button
            className="adm-btn-primary"
            onClick={handleSetup}
            disabled={loadingSetup}
          >
            {loadingSetup ? 'Generando QR...' : '⚙ Activar 2FA'}
          </button>
        )}

        {qrDataUrl && !yaVerificado && (
          <div>
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px' }}>
              <strong>1.</strong> Escanea este QR con <strong>Google Authenticator</strong>, <strong>Authy</strong> u otra app compatible.
            </p>
            <img
              src={qrDataUrl}
              alt="QR código 2FA"
              style={{ display: 'block', width: '180px', height: '180px', margin: '0 0 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            {secret && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 16px', wordBreak: 'break-all' }}>
                Clave manual: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{secret}</code>
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px' }}>
              <strong>2.</strong> Ingresa el código de 6 dígitos para confirmar:
            </p>
            <form onSubmit={handleEnable} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                autoFocus
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '18px', width: '120px', letterSpacing: '4px', textAlign: 'center' }}
              />
              <button
                type="submit"
                className="adm-btn-primary"
                disabled={loadingEnable || codigo.length < 6}
              >
                {loadingEnable ? 'Verificando...' : 'Confirmar'}
              </button>
            </form>
          </div>
        )}

        {(totpActivo || yaVerificado) && (
          <button
            className="adm-btn-danger"
            onClick={handleDisable}
            disabled={loadingDisable}
            style={{ marginTop: '8px' }}
          >
            {loadingDisable ? 'Desactivando...' : '🔓 Desactivar 2FA'}
          </button>
        )}
      </div>

      <div style={{
        marginTop: '20px', padding: '14px 16px', background: '#fffbeb',
        border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: '#92400e', maxWidth: '520px',
      }}>
        <strong>Importante:</strong> Si pierdes acceso a tu app autenticadora, deberás contactar al soporte técnico para recuperar el acceso a tu cuenta.
      </div>
    </AdminLayout>
  )
}

export default AdminSeguridad
