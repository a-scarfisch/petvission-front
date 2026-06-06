import { useState, useEffect } from 'react'
import { getDisponibilidadTodos } from '../../services/agendamientoService'

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fmtHora = (h) =>
  typeof h === 'string' ? h.slice(0, 5) : String(h).slice(0, 5)

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

  // Agrupa slots por veterinario
  const porVet = slots.reduce((acc, slot) => {
    const id = slot.veterinario.idUsuario
    if (!acc[id]) acc[id] = { vet: slot.veterinario, slots: [] }
    acc[id].slots.push(slot)
    return acc
  }, {})

  const slotSeleccionado = seleccion?.turnoDetalle?.id

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

      <div className="ag-slots-panel">
        {loading ? (
          <p className="ag-slots-estado">Cargando horarios…</p>
        ) : slots.length === 0 ? (
          <p className="ag-slots-estado">No hay horarios disponibles para este día.</p>
        ) : (
          Object.values(porVet).map(({ vet, slots: vetSlots }) => (
            <div key={vet.idUsuario} className="ag-slots-vet-group">
              <p className="ag-slots-vet-name">
                {vet.nombres} {vet.apellidos}
              </p>
              <div className="ag-slots-hours">
                {vetSlots.map((slot) => {
                  const activo = slotSeleccionado === slot.idTurnoDetalle
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
                      className={`ag-hour-btn${activo ? ' ag-hour-btn--active' : ''}`}
                    >
                      {fmtHora(slot.horaInicio)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PasoDiaHoraVet
