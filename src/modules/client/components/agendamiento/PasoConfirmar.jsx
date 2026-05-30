const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`
}

const formatPrecio = (precio) =>
  precio != null ? `$${Number(precio).toLocaleString('es-CL')}` : 'Consultar precio'

const PasoConfirmar = ({ seleccion, error, loading, onConfirmar }) => {
  const esConsulta = seleccion.categoriaReserva === 'CONSULTA'

  const filas = [
    ['🐾 Mascota',      seleccion.mascota?.nombre],
    ['📋 Categoría',    seleccion.categoriaReserva],
    esConsulta
      ? ['🩺 Motivo',   seleccion.motivo]
      : ['🏥 Servicio', seleccion.servicio?.nombre],
    !esConsulta && seleccion.servicio?.precio !== undefined
      ? ['💰 Precio',   formatPrecio(seleccion.servicio?.precio)]
      : null,
    ['👨‍⚕️ Veterinario', `${seleccion.veterinario?.nombres ?? ''} ${seleccion.veterinario?.apellidos ?? ''}`],
    ['📅 Fecha',        formatFecha(seleccion.fecha)],
    ['🕐 Hora',         seleccion.hora?.slice(0, 5)],
  ].filter(Boolean)

  return (
    <div>
      <p className="ag-section-title">Revisa y confirma tu reserva</p>

      <div className="ag-confirm-card">
        {filas.map(([label, value]) => (
          <div key={label} className="ag-confirm-row">
            <span className="ag-confirm-label">{label}</span>
            <span className="ag-confirm-value">{value ?? '—'}</span>
          </div>
        ))}
      </div>

      {error && <p className="ag-error">{error}</p>}

      <div className="ag-confirm-footer">
        <button
          className="ag-btn-primary"
          onClick={onConfirmar}
          disabled={loading}
        >
          {loading ? 'Agendando…' : '✓ Confirmar Cita'}
        </button>
      </div>
    </div>
  )
}

export default PasoConfirmar
