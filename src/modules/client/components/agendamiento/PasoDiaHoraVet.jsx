import { useState, useEffect } from 'react'
import { getDisponibilidadTodos } from '../../services/agendamientoService'

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const PasoDiaHoraVet = ({ seleccion, onSelect }) => {
  const proximos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const [diaActivo, setDiaActivo] = useState(
    () => seleccion?.fecha ?? toDateStr(proximos7[0])
  )
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSlots([])
    getDisponibilidadTodos(diaActivo)
      .then((data) => { if (!cancelled) setSlots(data) })
      .catch(() => { if (!cancelled) setSlots([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [diaActivo])

  return (
    <div>
      <p className="ag-section-title">Elige día y veterinario disponible</p>

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

      {loading ? (
        <p className="ag-no-slots">Cargando horarios…</p>
      ) : slots.length === 0 ? (
        <p className="ag-no-slots">No hay horarios disponibles para este día.</p>
      ) : (
        <div className="ag-slots-vet-grid">
          {slots.map((slot) => {
            const activo = seleccion?.turnoDetalle?.id === slot.idTurnoDetalle
            return (
              <button
                key={slot.idTurnoDetalle}
                type="button"
                onClick={() => onSelect({
                  turnoDetalle: { id: slot.idTurnoDetalle },
                  fecha: diaActivo,
                  hora: slot.horaInicio,
                  veterinario: slot.veterinario,
                })}
                className={`ag-slot-vet-btn${activo ? ' ag-slot-vet-btn--active' : ''}`}
              >
                <span className="ag-slot-vet-btn__hora">
                  {typeof slot.horaInicio === 'string'
                    ? slot.horaInicio.slice(0, 5)
                    : String(slot.horaInicio).slice(0, 5)}
                </span>
                <span className="ag-slot-vet-btn__vet">
                  {slot.veterinario.nombres} {slot.veterinario.apellidos}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PasoDiaHoraVet
