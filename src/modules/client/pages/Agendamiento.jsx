import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { handleError } from '@/modules/core/lib/errorHandler'
import {
  getServicios,
  getVeterinarios,
  getAgendaVeterinario,
  agendarReserva,
} from '../services/agendamientoService'
import AgendaStepper    from '../components/agendamiento/AgendaStepper'
import PasoPaciente     from '../components/agendamiento/PasoPaciente'
import PasoCategoria    from '../components/agendamiento/PasoCategoria'
import PasoServicio     from '../components/agendamiento/PasoServicio'
import PasoProfesional  from '../components/agendamiento/PasoProfesional'
import PasoDiaHora      from '../components/agendamiento/PasoDiaHora'
import PasoConfirmar    from '../components/agendamiento/PasoConfirmar'
import '@/styles/global.css'
import '@/styles/modules/agendamiento.css'

const PASOS = ['Paciente', 'Categoría', 'Servicio', 'Profesional', 'Día y Hora', 'Confirmar']

const INIT = {
  mascota: null,
  categoriaReserva: null,
  servicio: null,
  motivo: '',
  veterinario: null,
  turnoDetalle: null,
  fecha: null,
  hora: null,
}

const Agendamiento = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { mascotas, addCita } = useClientContext()

  const [paso, setPaso]             = useState(0)
  const [seleccion, setSeleccion]   = useState(INIT)
  const [servicios, setServicios]   = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [agenda, setAgenda]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  // Carga veterinarios al montar
  useEffect(() => {
    getVeterinarios()
      .then(setVeterinarios)
      .catch((err) => setError(handleError(err)))
  }, [])

  // Carga servicios filtrados cuando se elige una categoría que los necesita
  useEffect(() => {
    const cat = seleccion.categoriaReserva
    if (!cat || cat === 'CONSULTA') { setServicios([]); return }
    getServicios(cat)
      .then(setServicios)
      .catch((err) => setError(handleError(err)))
  }, [seleccion.categoriaReserva])

  // Carga agenda cuando se elige veterinario
  useEffect(() => {
    if (!seleccion.veterinario) return
    let cancelled = false
    setAgenda([])
    setSeleccion((prev) => ({ ...prev, turnoDetalle: null, fecha: null, hora: null }))
    getAgendaVeterinario(seleccion.veterinario.idUsuario)
      .then((data) => { if (!cancelled) setAgenda(data) })
      .catch((err) => { if (!cancelled) setError(handleError(err)) })
    return () => { cancelled = true }
  }, [seleccion.veterinario?.idUsuario])

  const setField = (field) => (value) =>
    setSeleccion((prev) => ({ ...prev, [field]: value }))

  // Al cambiar categoría, limpiar servicio y motivo
  const handleSelectCategoria = (cat) =>
    setSeleccion((prev) => ({ ...prev, categoriaReserva: cat, servicio: null, motivo: '' }))

  const puedeContinuar = [
    () => !!seleccion.mascota,
    () => !!seleccion.categoriaReserva,
    () => seleccion.categoriaReserva === 'CONSULTA'
      ? seleccion.motivo?.trim().length > 0
      : !!seleccion.servicio,
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
      const esConsulta = seleccion.categoriaReserva === 'CONSULTA'
      const res = await agendarReserva({
        idUsuario:        user.idUsuario,
        idVeterinario:    seleccion.veterinario.idUsuario,
        idMascota:        seleccion.mascota.idMascota,
        idServicio:       esConsulta ? null : seleccion.servicio.idServicio,
        idTurnoDetalle:   seleccion.turnoDetalle.id,
        categoriaReserva: seleccion.categoriaReserva,
        fecha:            seleccion.fecha,
        hora:             seleccion.hora,
        motivo:           esConsulta ? seleccion.motivo : seleccion.servicio.nombre,
      })
      addCita(res)
      navigate('/client/reservas')
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDiaHora = ({ turnoDetalle, fecha, hora }) =>
    setSeleccion((prev) => ({ ...prev, turnoDetalle, fecha, hora }))

  const ULTIMO_PASO = PASOS.length - 1

  return (
    <div className="ag-page">

      <header className="ag-topbar">
        <button className="ag-topbar__back" onClick={() => navigate('/client/dashboard')}>
          ← Volver al Dashboard
        </button>
        <span className="ag-topbar__brand">🐾 PetVission</span>
      </header>

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
              <PasoCategoria
                seleccion={seleccion.categoriaReserva}
                onSelect={handleSelectCategoria}
              />
            )}
            {paso === 2 && (
              <PasoServicio
                categoriaReserva={seleccion.categoriaReserva}
                mascota={seleccion.mascota}
                servicios={servicios}
                seleccion={seleccion.servicio}
                motivo={seleccion.motivo}
                onSelect={setField('servicio')}
                onMotivo={setField('motivo')}
              />
            )}
            {paso === 3 && (
              <PasoProfesional
                veterinarios={veterinarios}
                seleccion={seleccion.veterinario}
                onSelect={setField('veterinario')}
              />
            )}
            {paso === 4 && (
              <PasoDiaHora
                veterinario={seleccion.veterinario}
                agenda={agenda}
                seleccion={seleccion}
                onSelect={handleSelectDiaHora}
              />
            )}
            {paso === 5 && (
              <PasoConfirmar
                seleccion={seleccion}
                error={error}
                loading={loading}
                onConfirmar={handleConfirmar}
              />
            )}

            {error && paso < ULTIMO_PASO && <p className="ag-error">{error}</p>}
          </div>

          <div className="ag-footer">
            <button className="ag-btn-secondary" onClick={handleVolver}>
              {paso === 0 ? '← Cancelar' : '← Volver'}
            </button>

            {paso < ULTIMO_PASO && (
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
