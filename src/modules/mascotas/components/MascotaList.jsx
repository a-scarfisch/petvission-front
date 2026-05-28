import { useClientContext } from '@/modules/client/states/ClientContext'
import { eliminarMascota } from '../services/mascotasService'
import { useNavigate } from 'react-router-dom'
import ClientLayout from '@/modules/client/components/ClientLayout'

const MascotaList = () => {
  const { mascotas, removeMascota } = useClientContext()
  const navigate = useNavigate()

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '?'
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    return hoy.getFullYear() - nacimiento.getFullYear()
  }

  const handleEliminar = async (idMascota) => {
    if (!confirm('¿Estás seguro de eliminar esta mascota?')) return
    try {
      await eliminarMascota(idMascota)
      removeMascota(idMascota)
    } catch (err) {
      alert('Error al eliminar la mascota')
    }
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>🐾 Mis Mascotas</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Toda la información de tus mascotas
          </p>
        </div>
        <button
          onClick={() => navigate('/client/mascotas/nueva')}
          style={{
            background: '#2a9d8f', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}
        >
          + Nueva mascota
        </button>
      </div>

      {/* Listado */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {mascotas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🐾</p>
            <p>No tienes mascotas registradas aún.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Nombre', 'Especie', 'Raza', 'Sexo', 'Edad', 'Peso', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.idMascota} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#e8f5f0', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                      }}>
                        {m.especie?.toUpperCase() === 'GATO' ? '🐱' : '🐶'}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{m.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{m.especie}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{m.raza ?? '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{m.sexo ?? '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                    {calcularEdad(m.fechaNacimiento)} años
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                    {m.peso ? `${m.peso} kg` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleEliminar(m.idMascota)}
                      style={{
                        background: 'none', border: '1px solid #ef4444',
                        color: '#ef4444', padding: '6px 12px',
                        borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ClientLayout>
  )
}

export default MascotaList