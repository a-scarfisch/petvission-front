import apiClient from '@/modules/core/lib/apiClient'

export const getHistorialMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/historial/mascota/${idMascota}`)
  return data.data ?? []
}

export const crearConsulta = async (idMascota, consultaData) => {
  const { data } = await apiClient.post(`/historial/mascota/${idMascota}`, consultaData)
  return data.data
}
