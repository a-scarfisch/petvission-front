import { useState, useEffect } from 'react'
import { useAuthContext } from '@/modules/auth/states/AuthContext'
import { handleError } from '@/modules/core/lib/errorHandler'
import apiClient from '@/modules/core/lib/apiClient'
import VetLayout from './VetLayout'

const DIA_LABEL = {
  LUNES:     'Lunes',
  MARTES:    'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES:    'Jueves',
  VIERNES:   'Viernes',
  SABADO:    'Sábado',
}

const DIA_ORDER = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']

const formatHora = (hora) => hora?.toString().slice(0, 5) ?? '—'

const VetHorarios = () => {
  const { user } = useAuthContext()
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.idUsuario) return
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.get(
          `/turnos/horario-plantilla/veterinario/${user.idUsuario}`
        )
        const sorted = (data.data ?? []).sort(
          (a, b) => DIA_ORDER.indexOf(a.diaSemana) - DIA_ORDER.indexOf(b.diaSemana)
        )
        setPlantillas(sorted)
      } catch (err) {
        setError(handleError(err))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user])

  return (
    <VetLayout>
      <div className="vet-page-header">
        <div>
          <h2 className="vet-page-title">🕐 Mi Horario</h2>
          <p className="vet-page-subtitle">Horario asignado por la clínica</p>
        </div>
      </div>

      <div className="vet-section">
        {loading ? (
          <p className="vet-loading">Cargando horario...</p>
        ) : error ? (
          <div className="vet-empty">
            <p className="vet-empty__icon">⚠️</p>
            <p>{error}</p>
          </div>
        ) : plantillas.length === 0 ? (
          <div className="vet-empty">
            <p className="vet-empty__icon">🕐</p>
            <p>Tu horario aún no ha sido configurado. Contacta al administrador.</p>
          </div>
        ) : (
          <table className="vet-table">
            <thead>
              <tr>
                {['Día', 'Horario', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plantillas.map((p) => (
                <tr key={p.id}>
                  <td className="vet-td-bold">
                    {DIA_LABEL[p.diaSemana] ?? p.diaSemana}
                  </td>
                  <td className="vet-hora">
                    {formatHora(p.horaInicio)} – {formatHora(p.horaFin)}
                  </td>
                  <td>
                    <span className={`vet-estado vet-estado--${p.activo ? 'CONFIRMADA' : 'CANCELADA'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </VetLayout>
  )
}

export default VetHorarios
