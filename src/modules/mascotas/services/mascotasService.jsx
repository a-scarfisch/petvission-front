import apiClient from '@/modules/core/lib/apiClient'

export const getMascotasByUsuario = async (idUsuario) => {
  const { data } = await apiClient.get(`/mascotas/usuario/${idUsuario}`)
  return data.data ?? []
}

export const crearMascota = async (idUsuario, mascotaData) => {
  const { data } = await apiClient.post(`/mascotas/usuario/${idUsuario}`, mascotaData)
  return data.data
}

export const actualizarMascota = async (id, mascotaData) => {
  const { data } = await apiClient.put(`/mascotas/${id}`, mascotaData)
  return data.data
}

export const eliminarMascota = async (id) => {
  const { data } = await apiClient.delete(`/mascotas/${id}`)
  return data.data
}