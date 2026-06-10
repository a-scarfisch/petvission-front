const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`
}

const LABEL_SUBTIPO = {
  LABORATORIO:   'Laboratorio',
  PROCEDIMIENTO: 'Procedimiento',
  PELUQUERIA:    'Peluquería',
}

const PasoConfirmar = ({ seleccion, error, loading, onConfirmar }) => {
  const { categoriaReserva, motivoKey, observacion, veterinario, fecha, hora, mascota } = seleccion

  const esServicio = categoriaReserva !== 'CONSULTA'

  const detalleConsulta = (() => {
    const partes = [motivoKey, observacion?.trim()].filter(Boolean)
    return partes.length ? partes.join(' — ') : 'Sin especificar'
  })()

  const filas = [
    ['🐾 Mascota',         mascota?.nombre],
    ['📋 Tipo de atención', esServicio ? 'Servicio' : 'Consulta General'],
    esServicio
      ? ['🔖 Subtipo', LABEL_SUBTIPO[categoriaReserva] ?? categoriaReserva]
      : ['🩺 Detalle', detalleConsulta],
    esServicio && categoriaReserva === 'LABORATORIO'
      ? ['🩺 Nota', 'El veterinario determinará los estudios necesarios']
      : null,
    ['👨‍⚕️ Veterinario', veterinario ? `${veterinario.nombres ?? ''} ${veterinario.apellidos ?? ''}` : '—'],
    ['📅 Fecha',           formatFecha(fecha)],
    ['🕐 Hora',            hora?.slice(0, 5)],
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
          {loading ? 'Agendando…' : '✓ Confirmar Reserva'}
        </button>
      </div>
    </div>
  )
}

export default PasoConfirmar
