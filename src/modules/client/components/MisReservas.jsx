import { useState } from 'react'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { useNavigate } from 'react-router-dom'
import ClientLayout from './ClientLayout'
import { cancelarCita, reprogramarCita } from '../services/citasService'

const FILTROS = ['Todas', 'CONFIRMADA', 'PENDIENTE', 'CANCELADA']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const DIAS_CORTOS = ['D','L','M','X','J','V','S']
const TIME_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']

const estadoBadge = {
  CONFIRMADA: { bg: '#d1fae5', color: '#065f46' },
  PENDIENTE:  { bg: '#fef3c7', color: '#92400e' },
  CANCELADA:  { bg: '#fee2e2', color: '#991b1b' },
}

const toDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MisReservas = () => {
  const { citas, updateCita } = useClientContext()
  const navigate = useNavigate()

  const [filtro, setFiltro] = useState('Todas')
  const [modal, setModal] = useState(null) // { type: 'reprog'|'cancel', cita }
  const [loadingId, setLoadingId] = useState(null)
  const [toast, setToast] = useState(null)

  // estado del modal de reprogramación
  const [calMonth, setCalMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const openReprog = (cita) => {
    setCalMonth(new Date())
    setSelectedDate(null)
    setSelectedTime(null)
    setModal({ type: 'reprog', cita })
  }

  const openCancel = (cita) => setModal({ type: 'cancel', cita })
  const closeModal = () => setModal(null)

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

  const citasFiltradas = filtro === 'Todas'
    ? citas
    : citas.filter((c) => c.estado === filtro)

  // ── Calendar helpers ──────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const calYear  = calMonth.getFullYear()
  const calMon   = calMonth.getMonth()
  const daysInMonth  = new Date(calYear, calMon + 1, 0).getDate()
  const firstWeekday = new Date(calYear, calMon, 1).getDay()
  const calDays = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => setCalMonth(new Date(calYear, calMon - 1, 1))
  const nextMonth = () => setCalMonth(new Date(calYear, calMon + 1, 1))

  const isSelected = (d) =>
    selectedDate &&
    selectedDate.getFullYear() === calYear &&
    selectedDate.getMonth() === calMon &&
    selectedDate.getDate() === d

  const isPast = (d) => new Date(calYear, calMon, d) < today

  return (
    <ClientLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toast.isError ? '#fee2e2' : '#d1fae5',
          color: toast.isError ? '#991b1b' : '#065f46',
          padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '14px', fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🗓️ Mis Reservas</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Gestiona, reprograma o cancela tus reservas activas
          </p>
        </div>
        <button
          onClick={() => navigate('/client/citas/nueva')}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: '#2a9d8f', color: '#fff', fontWeight: 600,
            fontSize: '14px', cursor: 'pointer',
          }}
        >
          + Nueva reserva
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 16px', borderRadius: '99px', fontSize: '13px',
              cursor: 'pointer', fontWeight: filtro === f ? 600 : 400,
              background: filtro === f ? '#2a9d8f' : '#fff',
              color: filtro === f ? '#fff' : '#374151',
              border: filtro === f ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {f === 'Todas' ? 'Todas' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
          </button>
        ))}
      </div>

      {/* Lista de reservas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {citasFiltradas.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '48px',
            textAlign: 'center', color: '#9ca3af',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '36px', margin: '0 0 8px' }}>🗓️</p>
            <p>No tienes reservas {filtro !== 'Todas' ? filtro.toLowerCase() + 's' : ''}.</p>
          </div>
        ) : (
          citasFiltradas.map((c) => {
            const { day, mon } = formatFecha(c.fecha)
            const badge = estadoBadge[c.estado] ?? { bg: '#f3f4f6', color: '#374151' }
            const activa = c.estado !== 'CANCELADA'
            return (
              <div key={c.idReserva} className="reserva-card" style={{
                background: '#fff', borderRadius: '12px', padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: '20px',
                opacity: loadingId === c.idReserva ? 0.5 : 1,
              }}>
                {/* Fecha blob */}
                <div style={{
                  minWidth: '56px', textAlign: 'center',
                  background: '#e8f5f0', borderRadius: '10px', padding: '10px 8px', flexShrink: 0,
                }}>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#2a9d8f' }}>{day}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#2a9d8f', textTransform: 'uppercase' }}>{mon}</p>
                </div>

                {/* Hora */}
                <div style={{ minWidth: '48px', flexShrink: 0, textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {c.hora?.slice(0, 5) ?? '—'}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>hora</p>
                </div>

                {/* Info mascota + vet */}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>
                    🐾 {c.nombreMascota ?? 'Mascota'} · {c.motivo ?? 'Consulta'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    👨‍⚕️ {c.nombreVeterinario ?? '—'}
                  </p>
                </div>

                {/* Badge estado */}
                <span style={{
                  padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                  background: badge.bg, color: badge.color, flexShrink: 0,
                }}>
                  {c.estado?.charAt(0) + c.estado?.slice(1).toLowerCase()}
                </span>

                {/* Acciones */}
                {activa && (
                  <div className="reserva-card__acciones" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => openReprog(c)}
                      disabled={loadingId === c.idReserva}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                        border: '1px solid #2a9d8f', background: '#fff',
                        color: '#2a9d8f', fontSize: '13px', fontWeight: 500,
                      }}
                    >
                      🔄 Reprogramar
                    </button>
                    <button
                      onClick={() => openCancel(c)}
                      disabled={loadingId === c.idReserva}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
                        border: '1px solid #ef4444', background: '#fff',
                        color: '#ef4444', fontSize: '13px', fontWeight: 500,
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal Reprogramar ───────────────────────────── */}
      {modal?.type === 'reprog' && (
        <Overlay onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '17px' }}>🔄 Reprogramar reserva</p>

            {/* Mini calendario */}
            <div style={{
              border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', marginBottom: '16px',
            }}>
              {/* Cabecera mes */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button onClick={prevMonth} style={navBtn}>‹</button>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {MESES[calMon]} {calYear}
                </span>
                <button onClick={nextMonth} style={navBtn}>›</button>
              </div>

              {/* Días de la semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                {DIAS_CORTOS.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{d}</div>
                ))}
              </div>

              {/* Días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {calDays.map((d, i) => (
                  <button
                    key={i}
                    disabled={!d || isPast(d)}
                    onClick={() => d && !isPast(d) && setSelectedDate(new Date(calYear, calMon, d))}
                    style={{
                      height: '32px', borderRadius: '6px', border: 'none',
                      fontSize: '13px', cursor: d && !isPast(d) ? 'pointer' : 'default',
                      background: isSelected(d) ? '#2a9d8f' : 'transparent',
                      color: !d || isPast(d) ? '#d1d5db' : isSelected(d) ? '#fff' : '#374151',
                      fontWeight: isSelected(d) ? 700 : 400,
                    }}
                  >
                    {d ?? ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Selecciona un horario
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                        cursor: 'pointer', fontWeight: selectedTime === t ? 600 : 400,
                        border: selectedTime === t ? 'none' : '1px solid #2a9d8f',
                        background: selectedTime === t ? '#2a9d8f' : '#fff',
                        color: selectedTime === t ? '#fff' : '#2a9d8f',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={btnOutline}>Cancelar</button>
              <button
                onClick={handleReprogramar}
                disabled={!selectedDate || !selectedTime}
                style={{
                  ...btnPrimary,
                  opacity: !selectedDate || !selectedTime ? 0.5 : 1,
                  cursor: !selectedDate || !selectedTime ? 'default' : 'pointer',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Modal Cancelar ──────────────────────────────── */}
      {modal?.type === 'cancel' && (
        <Overlay onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <p style={{ fontSize: '32px', margin: '0 0 8px', textAlign: 'center' }}>⚠️</p>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '17px', textAlign: 'center' }}>
              ¿Cancelar esta reserva?
            </p>

            {/* Resumen */}
            <div style={{
              background: '#f9fafb', borderRadius: '10px', padding: '14px 16px',
              marginBottom: '20px', fontSize: '14px', color: '#374151',
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              {[
                ['🐾 Mascota', modal.cita.nombreMascota ?? '—'],
                ['👨‍⚕️ Veterinario', modal.cita.nombreVeterinario ?? '—'],
                ['📅 Fecha', `${modal.cita.fecha ?? '—'} · ${modal.cita.hora?.slice(0, 5) ?? '—'}`],
                ['📋 Motivo', modal.cita.motivo ?? 'Consulta'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 600, minWidth: '120px' }}>{label}</span>
                  <span style={{ color: '#6b7280' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={btnOutline}>Volver</button>
              <button onClick={handleCancelar} style={btnDanger}>Sí, cancelar</button>
            </div>
          </div>
        </Overlay>
      )}
    </ClientLayout>
  )
}

const Overlay = ({ children, onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
  >
    {children}
  </div>
)

const modalBox = {
  background: '#fff', borderRadius: '16px', padding: '28px',
  width: '100%', maxWidth: '420px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}

const navBtn = {
  background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
  width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const btnPrimary = {
  padding: '9px 20px', borderRadius: '8px', border: 'none',
  background: '#2a9d8f', color: '#fff', fontWeight: 600,
  fontSize: '14px', cursor: 'pointer',
}

const btnOutline = {
  padding: '9px 20px', borderRadius: '8px',
  border: '1px solid #e5e7eb', background: '#fff',
  color: '#374151', fontWeight: 500, fontSize: '14px', cursor: 'pointer',
}

const btnDanger = {
  padding: '9px 20px', borderRadius: '8px', border: 'none',
  background: '#ef4444', color: '#fff', fontWeight: 600,
  fontSize: '14px', cursor: 'pointer',
}

export default MisReservas
