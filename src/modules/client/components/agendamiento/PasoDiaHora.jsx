import { useState } from 'react'

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const PasoDiaHora = ({ agenda, seleccion, onSelect }) => {
  const proximos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const [diaActivo, setDiaActivo] = useState(
    () => seleccion?.fecha ?? toDateStr(proximos7[0])
  )

  const slotsDelDia = agenda.filter(
    (s) => s.fecha === diaActivo && s.disponible
  )

  return (
    <div>
      <p className="ag-section-title">Elige día y horario</p>

      <div className="ag-day-nav">
        {proximos7.map((d) => {
          const str = toDateStr(d)
          return (
            <button
              key={str}
              type="button"
              onClick={() => setDiaActivo(str)}
              className={`ag-day-btn${diaActivo === str ? ' ag-day-btn--active' : ''}`}
            >
              <span className="ag-day-btn__name">{DIAS_CORTOS[d.getDay()]}</span>
              <span className="ag-day-btn__num">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      <p className="ag-slots-title">Horarios disponibles</p>

      {slotsDelDia.length === 0 ? (
        <p className="ag-no-slots">No hay horarios disponibles para este día.</p>
      ) : (
        <div className="ag-slots-grid">
          {slotsDelDia.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect({ turnoDetalle: slot, fecha: slot.fecha, hora: slot.horaInicio })}
              className={`ag-slot-btn${seleccion?.turnoDetalle?.id === slot.id ? ' ag-slot-btn--active' : ''}`}
            >
              {slot.horaInicio.slice(0, 5)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PasoDiaHora
