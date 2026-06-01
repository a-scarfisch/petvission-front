import apiClient from '@/modules/core/lib/apiClient'

export const getServicios = async (tipo) => {
  const params = tipo ? { tipo } : {}
  const { data } = await apiClient.get('/servicios/activos', { params })
  return data.data ?? []
}

export const getVeterinarios = async () => {
  const { data } = await apiClient.get('/usuarios/veterinarios')
  return data.data ?? []
}

export const getAgendaVeterinario = async (idVeterinario) => {
  const { data } = await apiClient.get(`/turnos/veterinario/${idVeterinario}/disponibilidad`)
  return data.data ?? []
}

export const agendarReserva = async (payload) => {
  const { data } = await apiClient.post('/reservas', payload)
  return data.data
}
