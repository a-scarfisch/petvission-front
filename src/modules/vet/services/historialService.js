import apiClient from '@/modules/core/lib/apiClient'

export const getHistorialMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/historial/mascota/${idMascota}`)
  return data.data ?? []
}

export const getHistorialByReserva = async (idReserva) => {
  const { data } = await apiClient.get(`/historial/reserva/${idReserva}`)
  return data.data ?? null
}

export const crearConsulta = async (idMascota, consultaData) => {
  const { data } = await apiClient.post(`/historial/mascota/${idMascota}`, consultaData)
  return data.data
}

export const actualizarConsulta = async (idHistorial, consultaData) => {
  const { data } = await apiClient.put(`/historial/${idHistorial}`, consultaData)
  return data.data
}

export const getVacunasMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/vacunacion/mascota/${idMascota}`)
  return data.data ?? []
}

export const registrarVacunacion = async (vacunaData) => {
  const { data } = await apiClient.post('/vacunacion/desde-consulta', vacunaData)
  return data.data
}
