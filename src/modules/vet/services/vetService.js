import apiClient from '@/modules/core/lib/apiClient'

export const getReservasHoy = async (idVeterinario) => {
  const { data } = await apiClient.get(`/reservas/veterinario/${idVeterinario}/hoy`)
  return data.data ?? []
}

export const getPacientes = async (idVeterinario) => {
  const { data } = await apiClient.get(`/reservas/veterinario/${idVeterinario}/pacientes`)
  return data.data ?? []
}

export const getReservasVeterinario = async (idVeterinario) => {
  const { data } = await apiClient.get(`/reservas/veterinario/${idVeterinario}`)
  return data.data ?? []
}

export const getVacunasCatalogo = async () => {
  const { data } = await apiClient.get('/vacunacion/catalogo')
  return data.data ?? []
}
