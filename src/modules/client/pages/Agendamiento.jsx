import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { handleError } from '@/modules/core/lib/errorHandler'
import { getServicios, agendarReserva } from '../services/agendamientoService'
import AgendaStepper   from '../components/agendamiento/AgendaStepper'
import PasoPaciente    from '../components/agendamiento/PasoPaciente'
import PasoCategoria   from '../components/agendamiento/PasoCategoria'
import PasoServicio    from '../components/agendamiento/PasoServicio'
import PasoDiaHoraVet  from '../components/agendamiento/PasoDiaHoraVet'
import PasoConfirmar   from '../components/agendamiento/PasoConfirmar'
import PasoExito       from '../components/agendamiento/PasoExito'
import '@/styles/global.css'
import '@/styles/modules/agendamiento.css'

const PASOS = ['Paciente', 'Tipo de Atención', 'Detalle', 'Día y Hora', 'Confirmar']

const INIT = {
  mascota:          null,
  tipoAtencion:     null,   // 'CONSULTA' | 'SERVICIOS'
  categoriaReserva: null,   // 'CONSULTA' | 'LABORATORIO' | 'PROCEDIMIENTO' | 'PELUQUERIA'
  servicio:         null,
  motivoKey:        '',
  observacion:      '',
  veterinario:      null,
  turnoDetalle:     null,
  fecha:            null,
  hora:             null,
}

const Agendamiento = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { mascotas, addCita } = useClientContext()

  const [paso, setPaso]           = useState(0)
  const [seleccion, setSeleccion] = useState(INIT)
  const [servicios, setServicios] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [exito, setExito]         = useState(false)

  const cat = seleccion.categoriaReserva

  // Carga servicios cuando se elige PROCEDIMIENTO o PELUQUERIA
  useEffect(() => {
    if (cat !== 'PROCEDIMIENTO' && cat !== 'PELUQUERIA') {
      setServicios([])
      return
    }
    getServicios(cat)
      .then(setServicios)
      .catch((err) => setError(handleError(err)))
  }, [cat])

  const setField = (field) => (value) =>
    setSeleccion((prev) => ({ ...prev, [field]: value }))

  const handleSelectCategoria = (tipo) => {
    if (tipo === 'CONSULTA') {
      setSeleccion((prev) => ({
        ...prev,
        tipoAtencion: 'CONSULTA',
        categoriaReserva: 'CONSULTA',
        servicio: null,
        motivoKey: '',
        observacion: '',
      }))
    } else {
      setSeleccion((prev) => ({
        ...prev,
        tipoAtencion: 'SERVICIOS',
        categoriaReserva: null,
        servicio: null,
        motivoKey: '',
        observacion: '',
      }))
    }
  }

  const handleSelectSubtipo = (subtipo) => {
    setSeleccion((prev) => ({
      ...prev,
      categoriaReserva: subtipo,
      servicio: null,
    }))
  }

  const handleSelectDiaHora = ({ turnoDetalle, fecha, hora, veterinario }) =>
    setSeleccion((prev) => ({ ...prev, turnoDetalle, fecha, hora, veterinario }))

  const puedeContinuar = [
    () => !!seleccion.mascota,
    () => !!seleccion.tipoAtencion,
    () => {
      if (seleccion.tipoAtencion === 'CONSULTA') return true
      if (!cat) return false
      if (cat === 'LABORATORIO') return true
      return !!seleccion.servicio
    },
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
      const esConsulta    = cat === 'CONSULTA'
      const esLaboratorio = cat === 'LABORATORIO'

      const motivoPartes = esConsulta
        ? [seleccion.motivoKey, seleccion.observacion?.trim()].filter(Boolean)
        : []
      const motivo = esConsulta
        ? (motivoPartes.length ? motivoPartes.join(' — ') : 'Consulta general')
        : esLaboratorio
          ? 'Laboratorio'
          : seleccion.servicio?.nombre

      const res = await agendarReserva({
        idUsuario:        user.idUsuario,
        idVeterinario:    seleccion.veterinario.idUsuario,
        idMascota:        seleccion.mascota.idMascota,
        idServicio:       (esConsulta || esLaboratorio) ? null : seleccion.servicio.idServicio,
        idTurnoDetalle:   seleccion.turnoDetalle.id,
        categoriaReserva: cat,
        fecha:            seleccion.fecha,
        hora:             seleccion.hora,
        motivo,
      })
      addCita(res)
      setExito(true)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  const ULTIMO_PASO = PASOS.length - 1

  if (exito) {
    return (
      <div className="ag-page">
        <header className="ag-topbar">
          <span className="ag-topbar__brand">🐾 PetVission</span>
        </header>
        <main className="ag-body">
          <div className="ag-container">
            <PasoExito seleccion={seleccion} />
          </div>
        </main>
      </div>
    )
  }

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
                seleccion={seleccion.tipoAtencion}
                onSelect={handleSelectCategoria}
              />
            )}
            {paso === 2 && (
              <PasoServicio
                tipoAtencion={seleccion.tipoAtencion}
                categoriaReserva={seleccion.categoriaReserva}
                servicios={servicios}
                seleccion={seleccion.servicio}
                motivoKey={seleccion.motivoKey}
                observacion={seleccion.observacion}
                onSubtipo={handleSelectSubtipo}
                onSelect={setField('servicio')}
                onMotivoKey={setField('motivoKey')}
                onObservacion={setField('observacion')}
              />
            )}
            {paso === 3 && (
              <PasoDiaHoraVet
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
