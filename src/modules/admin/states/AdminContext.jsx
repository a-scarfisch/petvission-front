import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'

const AdminContext = createContext(null)

export const AdminProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  const recargar = useCallback(async () => {
    setLoading(true)
    try {
      const [usuariosRes, citasRes] = await Promise.all([
        apiClient.get('/usuarios'),
        apiClient.get('/reservas'),
      ])
      setUsuarios(usuariosRes.data.data ?? [])
      setCitas(citasRes.data.data ?? [])
    } catch (err) {
      console.error('Error cargando datos del admin:', handleError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const updateUsuario = (updated) => setUsuarios((prev) =>
    prev.map((u) => u.idUsuario === updated.idUsuario ? updated : u)
  )

  return (
    <AdminContext.Provider value={{ usuarios, citas, loading, updateUsuario, recargar }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdminContext = () => useContext(AdminContext)
