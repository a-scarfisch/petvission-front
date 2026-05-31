import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { getReservasHoy, getPacientes, getReservasVeterinario } from '../services/vetService'
import { handleError } from '@/modules/core/lib/errorHandler'

const VetContext = createContext(null)

export const VetProvider = ({ children }) => {
  const { user } = useAuthContext()
  const [reservasHoy, setReservasHoy] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.idUsuario) return

    const fetchAll = async () => {
      try {
        const [hoy, pacs, todas] = await Promise.all([
          getReservasHoy(user.idUsuario),
          getPacientes(user.idUsuario),
          getReservasVeterinario(user.idUsuario),
        ])
        setReservasHoy(hoy)
        setPacientes(pacs)
        setCitas(todas)
      } catch (err) {
        console.error('Error cargando datos del veterinario:', handleError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user])

  const updateCita = (updated) => setCitas((prev) =>
    prev.map((c) => c.idReserva === updated.idReserva ? updated : c)
  )

  const removeCita = (idReserva) => setCitas((prev) =>
    prev.filter((c) => c.idReserva !== idReserva)
  )

  return (
    <VetContext.Provider value={{ reservasHoy, pacientes, citas, loading, updateCita, removeCita }}>
      {children}
    </VetContext.Provider>
  )
}

export const useVetContext = () => useContext(VetContext)
