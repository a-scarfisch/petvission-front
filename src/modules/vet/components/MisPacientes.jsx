import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVetContext } from '@/modules/vet/states/VetContext'
import VetLayout from './VetLayout'

const FILTROS = ['Todos', 'PERRO', 'GATO']

const especieEmoji = (especie) => {
  const map = { GATO: '🐱', AVE: '🐦', OTRO: '🐹' }
  return map[especie?.toUpperCase()] ?? '🐶'
}

const MisPacientes = () => {
  const { pacientes, loading } = useVetContext()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = pacientes
    .filter((p) => filtro === 'Todos' || p.especie?.toUpperCase() === filtro)
    .filter((p) => {
      const q = busqueda.toLowerCase()
      return (
        !q ||
        p.nombreMascota?.toLowerCase().includes(q) ||
        p.nombreDueno?.toLowerCase().includes(q)
      )
    })

  if (loading) return <VetLayout><p className="vet-loading">Cargando...</p></VetLayout>

  return (
    <VetLayout>
      <div className="vet-page-header">
        <div>
          <h2 className="vet-page-title">👥 Mis Pacientes</h2>
          <p className="vet-page-subtitle">
            {pacientes.length} mascotas atendidas en total
          </p>
        </div>
      </div>

      <div className="vet-toolbar">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`vet-filtro-btn${filtro === f ? ' vet-filtro-btn--active' : ''}`}
          >
            {f === 'Todos' ? 'Todos' : f === 'PERRO' ? '🐶 Perros' : '🐱 Gatos'}
          </button>
        ))}
        <input
          className="vet-search"
          type="text"
          placeholder="Buscar por nombre o dueño..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="vet-section">
        {filtrados.length === 0 ? (
          <div className="vet-empty">
            <p className="vet-empty__icon">🐾</p>
            <p>No se encontraron pacientes.</p>
          </div>
        ) : (
          <table className="vet-table">
            <thead>
              <tr>
                {['Paciente', 'Especie / Raza', 'Dueño', 'Última visita', 'Estado'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.idMascota}
                  onClick={() => navigate(`/vet/historial?mascotaId=${p.idMascota}`)}
                  className="vet-row-clickable"
                >
                  <td>
                    <div className="vet-mascota-cell">
                      <div className="vet-mascota-avatar">{especieEmoji(p.especie)}</div>
                      <div className="vet-mascota-nombre-col">
                        <span className="vet-mascota-nombre">
                          {p.nombreMascota}
                          {p.animalGuia && (
                            <span className="vet-guia-icon" title="Animal guía o de apoyo emocional">🦮</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{p.especie}{p.raza ? ` · ${p.raza}` : ''}</td>
                  <td>{p.nombreDueno}</td>
                  <td>{p.ultimaVisita ?? '—'}</td>
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

export default MisPacientes
