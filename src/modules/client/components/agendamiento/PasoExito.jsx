import { useNavigate } from 'react-router-dom'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`
}

const mensajeRecordatorio = (fechaStr) => {
  if (!fechaStr) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const [y, m, d] = fechaStr.split('-').map(Number)
  const citaDate = new Date(y, m - 1, d)
  const diff = Math.round((citaDate - hoy) / (1000 * 60 * 60 * 24))

  if (diff === 0) return 'Tu cita es hoy — confírmala directamente en Mis Reservas cuando llegues.'
  if (diff <= 3)  return 'Te enviaremos un recordatorio el día previo a tu cita.'
  return 'Te enviaremos un recordatorio por correo 3 días antes de tu cita.'
}

const PasoExito = ({ seleccion }) => {
  const navigate = useNavigate()
  const recordatorio = mensajeRecordatorio(seleccion?.fecha)

  return (
    <div className="ag-exito">
      <div className="ag-exito__icono">✅</div>
      <h2 className="ag-exito__titulo">¡Reserva agendada!</h2>
      <p className="ag-exito__sub">
        Tu cita quedó registrada para el{' '}
        <strong>{formatFecha(seleccion?.fecha)}</strong> a las{' '}
        <strong>{seleccion?.hora?.slice(0, 5)}</strong> con{' '}
        <strong>{seleccion?.veterinario?.nombres} {seleccion?.veterinario?.apellidos}</strong>.
      </p>

      {recordatorio && (
        <div className="ag-exito__recordatorio">
          <span>🔔</span>
          <p>{recordatorio}</p>
        </div>
      )}

      <div className="ag-exito__acciones">
        <button className="ag-btn-primary" onClick={() => navigate('/client/reservas')}>
          Ver mis reservas
        </button>
        <button className="ag-btn-secondary" onClick={() => navigate('/client/dashboard')}>
          Ir al inicio
        </button>
      </div>
    </div>
  )
}

export default PasoExito
