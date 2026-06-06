import { useState } from 'react'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { useNavigate } from 'react-router-dom'
import ClientLayout from './ClientLayout'
import { cancelarCita, reprogramarCita, getDisponibilidadParaReprogramar } from '../services/citasService'
import '@/styles/global.css'
import '@/styles/modules/reservas.css'

const FILTROS      = ['Todas', 'CONFIRMADA', 'PENDIENTE']
const MESES        = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const DIAS_CORTOS  = ['D','L','M','X','J','V','S']

const toDateStr = (d) => {
  const y   = d.getFullYear()
  const m   = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MisReservas = () => {
  const { citas, updateCita } = useClientContext()
  const navigate = useNavigate()

  const [filtro, setFiltro] = useState('Todas')
  const [modal, setModal]   = useState(null) // { type: 'reprog'|'cancel', cita }
  const [loadingId, setLoadingId] = useState(null)
  const [toast, setToast]   = useState(null)

  const [calMonth, setCalMonth]             = useState(() => new Date())
  const [selectedDate, setSelectedDate]     = useState(null)
  const [selectedTime, setSelectedTime]     = useState(null)
  const [slotsDisponibles, setSlotsDisponibles] = useState([])
  const [loadingSlots, setLoadingSlots]     = useState(false)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const openReprog = (cita) => {
    setCalMonth(new Date())
    setSelectedDate(null)
    setSelectedTime(null)
    setSlotsDisponibles([])
    setModal({ type: 'reprog', cita })
  }

  const handleSeleccionarFecha = async (fecha, idVeterinario) => {
    setSelectedDate(fecha)
    setSelectedTime(null)
    setSlotsDisponibles([])
    if (!idVeterinario) return
    setLoadingSlots(true)
    try {
      const slots = await getDisponibilidadParaReprogramar(idVeterinario, toDateStr(fecha))
      setSlotsDisponibles(slots)
    } catch {
      setSlotsDisponibles([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const openCancel  = (cita) => setModal({ type: 'cancel', cita })
  const closeModal  = () => setModal(null)

  const handleCancelar = async () => {
    const { cita } = modal
    setLoadingId(cita.idReserva)
    closeModal()
    try {
      const updated = await cancelarCita(cita.idReserva)
      updateCita(updated)
      showToast('Reserva cancelada correctamente')
    } catch {
      showToast('Error al cancelar la reserva', true)
    } finally {
      setLoadingId(null)
    }
  }

  const handleReprogramar = async () => {
    const { cita } = modal
    setLoadingId(cita.idReserva)
    closeModal()
    try {
      const updated = await reprogramarCita(cita.idReserva, toDateStr(selectedDate), `${selectedTime}:00`)
      updateCita(updated)
      showToast('Reserva reprogramada correctamente')
    } catch {
      showToast('Error al reprogramar la reserva', true)
    } finally {
      setLoadingId(null)
    }
  }

  const formatFecha = (fecha) => {
    if (!fecha) return { day: '—', mon: '' }
    const [, m, d] = fecha.split('-')
    return { day: d, mon: MESES_CORTOS[parseInt(m) - 1] }
  }

  const citasActivas = citas.filter((c) => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA')

  const citasFiltradas = filtro === 'Todas'
    ? citasActivas
    : citasActivas.filter((c) => c.estado === filtro)

  // ── Calendar helpers ──────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const calYear       = calMonth.getFullYear()
  const calMon        = calMonth.getMonth()
  const daysInMonth   = new Date(calYear, calMon + 1, 0).getDate()
  const firstWeekday  = new Date(calYear, calMon, 1).getDay()
  const calDays = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => setCalMonth(new Date(calYear, calMon - 1, 1))
  const nextMonth = () => setCalMonth(new Date(calYear, calMon + 1, 1))

  const isSelected = (d) =>
    selectedDate &&
    selectedDate.getFullYear() === calYear &&
    selectedDate.getMonth()    === calMon  &&
    selectedDate.getDate()     === d

  const isPast = (d) => new Date(calYear, calMon, d) < today

  const diaCls = (d) => {
    if (!d)       return 'res-cal__dia res-cal__dia--empty'
    if (isPast(d)) return 'res-cal__dia res-cal__dia--past'
    if (isSelected(d)) return 'res-cal__dia res-cal__dia--sel'
    return 'res-cal__dia'
  }

  return (
    <ClientLayout>
      {toast && (
        <div className={`res-toast${toast.isError ? ' res-toast--error' : ''}`}>
          {toast.msg}
        </div>
      )}

      {/* Cabecera */}
      <div className="pv-page-header">
        <div>
          <h2 className="pv-page-title">🗓️ Mis Reservas</h2>
          <p className="pv-page-subtitle">Gestiona, reprograma o cancela tus reservas activas</p>
        </div>
        <button className="pv-btn-primary" onClick={() => navigate('/client/citas/nueva')}>
          + Nueva reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="res-filtros">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`res-filtro-btn${filtro === f ? ' res-filtro-btn--active' : ''}`}
          >
            {f === 'Todas' ? 'Todas' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="res-lista">
        {citasFiltradas.length === 0 ? (
          <div className="pv-card pv-empty">
            <p className="pv-empty__icon">🗓️</p>
            <p className="pv-empty__text">
              No tienes reservas{filtro !== 'Todas' ? ` ${filtro.toLowerCase()}s` : ''}.
            </p>
          </div>
        ) : (
          citasFiltradas.map((c) => {
            const { day, mon } = formatFecha(c.fecha)
            return (
              <div
                key={c.idReserva}
                className={`res-card${loadingId === c.idReserva ? ' res-card--loading' : ''}`}
              >
                <div className="res-fecha">
                  <p className="res-fecha__dia">{day}</p>
                  <p className="res-fecha__mes">{mon}</p>
                </div>

                <div className="res-hora">
                  <p className="res-hora__valor">{c.hora?.slice(0, 5) ?? '—'}</p>
                  <p className="res-hora__label">hora</p>
                </div>

                <div className="res-info">
                  <p className="res-info__titulo">🐾 {c.nombreMascota ?? 'Mascota'} · {c.motivo ?? 'Consulta'}</p>
                  <p className="res-info__vet">👨‍⚕️ {c.nombreVeterinario ?? '—'}</p>
                </div>

                <span className={`pv-badge pv-badge--${c.estado}`}>
                  {c.estado?.charAt(0) + c.estado?.slice(1).toLowerCase()}
                </span>

                <div className="res-acciones">
                    <button
                      className="res-btn-reprog"
                      onClick={() => openReprog(c)}
                      disabled={loadingId === c.idReserva}
                    >
                      🔄 Reprogramar
                    </button>
                    <button
                      className="res-btn-cancel"
                      onClick={() => openCancel(c)}
                      disabled={loadingId === c.idReserva}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal Reprogramar ── */}
      {modal?.type === 'reprog' && (
        <div className="res-overlay" onClick={closeModal}>
          <div className="res-modal" onClick={(e) => e.stopPropagation()}>
            <p className="res-modal__titulo">🔄 Reprogramar reserva</p>

            {/* Calendario */}
            <div className="res-cal">
              <div className="res-cal__header">
                <button className="res-cal__nav" onClick={prevMonth}>‹</button>
                <span className="res-cal__mes">{MESES[calMon]} {calYear}</span>
                <button className="res-cal__nav" onClick={nextMonth}>›</button>
              </div>
              <div className="res-cal__wds">
                {DIAS_CORTOS.map((d) => (
                  <div key={d} className="res-cal__wd">{d}</div>
                ))}
              </div>
              <div className="res-cal__dias">
                {calDays.map((d, i) => (
                  <button
                    key={i}
                    className={diaCls(d)}
                    disabled={!d || isPast(d)}
                    onClick={() => d && !isPast(d) && handleSeleccionarFecha(
                      new Date(calYear, calMon, d),
                      modal?.cita?.idVeterinario
                    )}
                  >
                    {d ?? ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots */}
            {selectedDate && (
              <div className="res-slots">
                <p className="res-slots__label">Selecciona un horario</p>
                {loadingSlots ? (
                  <p className="res-slots__loading">Cargando horarios...</p>
                ) : slotsDisponibles.length === 0 ? (
                  <p className="res-slots__msg">No hay horarios disponibles para este día.</p>
                ) : (
                  <div className="res-slots__grid">
                    {slotsDisponibles.map((slot) => {
                      const horaLabel = slot.horaInicio?.slice(0, 5)
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTime(horaLabel)}
                          className={`res-slot-btn${selectedTime === horaLabel ? ' res-slot-btn--sel' : ''}`}
                        >
                          {horaLabel}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="res-modal__footer">
              <button className="res-modal-btn-outline" onClick={closeModal}>Cancelar</button>
              <button
                className="res-modal-btn-primary"
                onClick={handleReprogramar}
                disabled={!selectedDate || !selectedTime}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cancelar ── */}
      {modal?.type === 'cancel' && (
        <div className="res-overlay" onClick={closeModal}>
          <div className="res-modal" onClick={(e) => e.stopPropagation()}>
            <p className="res-modal__icon">⚠️</p>
            <p className="res-modal__titulo res-modal__titulo--center">¿Cancelar esta reserva?</p>

            <div className="res-cancel-info">
              {[
                ['🐾 Mascota',     modal.cita.nombreMascota ?? '—'],
                ['👨‍⚕️ Veterinario', modal.cita.nombreVeterinario ?? '—'],
                ['📅 Fecha',       `${modal.cita.fecha ?? '—'} · ${modal.cita.hora?.slice(0, 5) ?? '—'}`],
                ['📋 Motivo',      modal.cita.motivo ?? 'Consulta'],
              ].map(([label, value]) => (
                <div key={label} className="res-cancel-row">
                  <span className="res-cancel-row__label">{label}</span>
                  <span className="res-cancel-row__val">{value}</span>
                </div>
              ))}
            </div>

            <div className="res-modal__footer">
              <button className="res-modal-btn-outline" onClick={closeModal}>Volver</button>
              <button className="res-modal-btn-danger" onClick={handleCancelar}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}

export default MisReservas
