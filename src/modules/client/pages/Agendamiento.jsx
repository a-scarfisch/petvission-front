import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import {
  getServicios,
  getVeterinarios,
  getAgendaVeterinario,
  agendarReserva,
} from '../services/agendamientoService'
import AgendaStepper  from '../components/agendamiento/AgendaStepper'
import PasoPaciente   from '../components/agendamiento/PasoPaciente'
import PasoServicio   from '../components/agendamiento/PasoServicio'
import PasoProfesional from '../components/agendamiento/PasoProfesional'
import PasoDiaHora    from '../components/agendamiento/PasoDiaHora'
import PasoConfirmar  from '../components/agendamiento/PasoConfirmar'
import '@/styles/global.css'
import '@/styles/modules/agendamiento.css'

const PASOS = ['Paciente', 'Servicio', 'Profesional', 'Día y Hora', 'Confirmar']
const CHIPS = [
  '🍽️ ¿No come bien?',
  '💉 ¿Necesita vacunas?',
  '🩺 Control de rutina',
  '🐛 Desparasitación',
  '🔬 Problemas de piel',
]

const INIT = {
  mascota: null, servicio: null, veterinario: null,
  turnoDetalle: null, fecha: null, hora: null,
}

const Agendamiento = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { mascotas, addCita } = useClientContext()

  const [paso, setPaso]               = useState(0)
  const [seleccion, setSeleccion]     = useState(INIT)
  const [servicios, setServicios]     = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [agenda, setAgenda]           = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // Carga inicial: servicios y veterinarios
  useEffect(() => {
    Promise.all([getServicios(), getVeterinarios()])
      .then(([srv, vets]) => { setServicios(srv); setVeterinarios(vets) })
      .catch(() => setError('Error al cargar datos. Recarga la página.'))
  }, [])

  // Carga agenda cuando se elige veterinario
  useEffect(() => {
    if (!seleccion.veterinario) return
    setAgenda([])
    setSeleccion((prev) => ({ ...prev, turnoDetalle: null, fecha: null, hora: null }))
    getAgendaVeterinario(seleccion.veterinario.idUsuario)
      .then(setAgenda)
      .catch(() => setError('Error al cargar la agenda del veterinario.'))
  }, [seleccion.veterinario?.idUsuario])

  const setField = (field) => (value) =>
    setSeleccion((prev) => ({ ...prev, [field]: value }))

  const puedeContinuar = [
    () => !!seleccion.mascota,
    () => !!seleccion.servicio,
    () => !!seleccion.veterinario,
    () => !!seleccion.turnoDetalle,
  ][paso]?.() ?? true

  const handleVolver = () => {
    setError(null)
    if (paso === 0) navigate('/client/dashboard')
    else setPaso((p) => p - 1)
  }

  const handleContinuar = () => {
    setError(null)
    setPaso((p) => p + 1)
  }

  const handleConfirmar = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await agendarReserva({
        idUsuario:      user.idUsuario,
        idVeterinario:  seleccion.veterinario.idUsuario,
        idMascota:      seleccion.mascota.idMascota,
        idServicio:     seleccion.servicio.idServicio,
        idTurnoDetalle: seleccion.turnoDetalle.id,
        fecha:          seleccion.fecha,
        hora:           seleccion.hora,
        motivo:         seleccion.servicio.nombre,
      })
      addCita(res.data ?? res)
      navigate('/client/citas')
    } catch {
      setError('No se pudo agendar la reserva. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDiaHora = ({ turnoDetalle, fecha, hora }) =>
    setSeleccion((prev) => ({ ...prev, turnoDetalle, fecha, hora }))

  return (
    <div className="ag-page">

      {/* Top bar */}
      <header className="ag-topbar">
        <button className="ag-topbar__back" onClick={() => navigate('/client/dashboard')}>
          ← Volver al Dashboard
        </button>
        <span className="ag-topbar__brand">🐾 PetVission</span>
      </header>

      {/* Banner de síntomas */}
      <div className="ag-banner">
        <span className="ag-banner__title">¿Qué le pasa a tu mascota?</span>
        <div className="ag-banner__chips">
          {CHIPS.map((c) => <span key={c} className="ag-chip">{c}</span>)}
        </div>
      </div>

      {/* Contenido */}
      <main className="ag-body">
        <div className="ag-container">

          <AgendaStepper paso={paso} pasos={PASOS} />

          <div className="ag-content-card">
            {paso === 0 && (
              <PasoPaciente
                mascotas={mascotas}
                seleccion={seleccion.mascota}
                onSelect={setField('mascota')}
              />
            )}
            {paso === 1 && (
              <PasoServicio
                servicios={servicios}
                seleccion={seleccion.servicio}
                onSelect={setField('servicio')}
              />
            )}
            {paso === 2 && (
              <PasoProfesional
                veterinarios={veterinarios}
                seleccion={seleccion.veterinario}
                onSelect={setField('veterinario')}
              />
            )}
            {paso === 3 && (
              <PasoDiaHora
                veterinario={seleccion.veterinario}
                agenda={agenda}
                seleccion={seleccion}
                onSelect={handleSelectDiaHora}
              />
            )}
            {paso === 4 && (
              <PasoConfirmar
                seleccion={seleccion}
                error={error}
                loading={loading}
                onConfirmar={handleConfirmar}
              />
            )}

            {error && paso < 4 && <p className="ag-error">{error}</p>}
          </div>

          {/* Navegación de pasos */}
          <div className="ag-footer">
            <button className="ag-btn-secondary" onClick={handleVolver}>
              {paso === 0 ? '← Cancelar' : '← Volver'}
            </button>

            {paso < 4 && (
              <button
                className="ag-btn-primary"
                onClick={handleContinuar}
                disabled={!puedeContinuar}
              >
                Continuar →
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default Agendamiento
