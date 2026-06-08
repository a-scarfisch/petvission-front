import apiClient from '@/modules/core/lib/apiClient'

export const getHistorialMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/historial/mascota/${idMascota}`)
  return data.data ?? []
}

export const getVacunasMascota = async (idMascota) => {
  const { data } = await apiClient.get(`/vacunacion/mascota/${idMascota}`)
  return data.data ?? []
}

export const getCatalogoVacunas = async (especie) => {
  const especieMap = { PERRO: 'CANINA', GATO: 'FELINA' }
  const params = especie && especieMap[especie] ? { especie: especieMap[especie] } : {}
  const { data } = await apiClient.get('/vacunacion/catalogo', { params })
  return data.data ?? []
}
