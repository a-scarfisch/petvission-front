import apiClient from '@/modules/core/lib/apiClient'

export const getCitasByUsuario = async (idUsuario) => {
  const { data } = await apiClient.get(`/reservas/usuario/${idUsuario}`)
  return data.data ?? []
}

export const getVeterinarios = async () => {
  const { data } = await apiClient.get('/usuarios/veterinarios')
  return data.data ?? []
}

export const getDisponibilidadVeterinario = async () => {
  const { data } = await apiClient.get('/reservas/disponibilidad')
  return data ?? []
}

export const agendarCita = async (citaData) => {
  const { data } = await apiClient.post('/reservas', citaData)
  return data
}

export const confirmarCita = async (idCita) => {
  const { data } = await apiClient.patch(`/reservas/${idCita}/confirmar`)
  return data.data
}

export const cancelarCita = async (idCita) => {
  const { data } = await apiClient.patch(`/reservas/${idCita}/cancelar`)
  return data.data
}

export const reprogramarCita = async (idCita, fecha, hora) => {
  const { data } = await apiClient.patch(`/reservas/${idCita}/reprogramar`, { fecha, hora })
  return data.data
}

export const getDisponibilidadParaReprogramar = async (idVeterinario, fecha) => {
  const { data } = await apiClient.get(`/turnos/veterinario/${idVeterinario}/disponibilidad`, {
    params: { fecha },
  })
  return data.data ?? []
}
