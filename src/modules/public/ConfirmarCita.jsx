import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import apiClient from '@/modules/core/lib/apiClient'
import '@/styles/global.css'

export default function ConfirmarCita() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [estado, setEstado] = useState('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!token) {
      setEstado('error')
      setMensaje('El enlace de confirmación no contiene un token válido.')
      return
    }

    apiClient.post(`/reservas/${id}/confirmar`, null, { params: { token } })
      .then(res => {
        setEstado('exito')
        setMensaje(res.data?.data || '¡Cita confirmada!')
      })
      .catch(err => {
        setEstado('error')
        const status = err.response?.status
        const msg = err.response?.data?.message
        if (status === 409) setMensaje(msg || 'Esta cita ya fue confirmada previamente.')
        else if (status === 404) setMensaje('El enlace no es válido o no pertenece a esta cita.')
        else setMensaje(msg || 'Ocurrió un error al confirmar la cita. Intentá de nuevo más tarde.')
      })
  }, [id, token])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f7fb',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
      }}>

        {estado === 'cargando' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ margin: '0 0 8px', color: '#374151', fontSize: '20px' }}>Confirmando tu cita...</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Un momento, por favor.</p>
          </>
        )}

        {estado === 'exito' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#e8f5e9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px',
            }}>✅</div>
            <h2 style={{ margin: '0 0 8px', color: '#2e7d32', fontSize: '22px' }}>¡Cita confirmada!</h2>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
              {mensaje}
            </p>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐾</div>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 28px' }}>
              PetVision — Clínica Veterinaria
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                background: 'var(--teal)',
                color: '#fff',
                textDecoration: 'none',
                padding: '12px 32px',
                borderRadius: '50px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              Ir a mi cuenta
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: '36px',
            }}>❌</div>
            <h2 style={{ margin: '0 0 8px', color: '#b91c1c', fontSize: '22px' }}>No se pudo confirmar</h2>
            <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
              {mensaje}
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                background: '#f3f4f6',
                color: '#374151',
                textDecoration: 'none',
                padding: '12px 32px',
                borderRadius: '50px',
                fontSize: '15px',
                fontWeight: '600',
              }}
            >
              Volver al inicio
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
