import apiClient from '@/modules/core/lib/apiClient'

export const getHistorialMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/historial/mascota/${idMascota}`)
  return data.data ?? []
}
