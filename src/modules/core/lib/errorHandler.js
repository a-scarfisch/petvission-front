export function handleError(error) {
  if (!error.response) {
    return 'No se pudo conectar con el servidor. Intenta más tarde.'
  }
  const msg = error.response?.data?.message
  if (msg) return msg
  switch (error.response.status) {
    case 400: return 'Los datos enviados no son válidos.'
    case 401: return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    case 403: return 'No tienes permiso para realizar esta acción.'
    case 404: return 'El recurso solicitado no existe.'
    case 409: return 'El turno seleccionado ya no está disponible.'
    case 500: return 'Error interno del servidor. Intenta más tarde.'
    default:  return 'Ocurrió un error inesperado.'
  }
}
