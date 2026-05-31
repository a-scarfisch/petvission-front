import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientContext } from '@/modules/client/states/ClientContext'
import { eliminarMascota, actualizarMascota } from '../services/mascotasService'
import { handleError } from '@/modules/core/lib/errorHandler'
import ClientLayout from '@/modules/client/components/ClientLayout'
import '@/styles/modules/mascotas.css'

const ESPECIES_GUIA = ['PERRO', 'GATO']

const especieEmoji = (especie) => {
  const map = { GATO: '🐱', AVE: '🐦', OTRO: '🐹' }
  return map[especie?.toUpperCase()] ?? '🐶'
}

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '?'
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  return hoy.getFullYear() - nacimiento.getFullYear()
}

const MascotaList = () => {
  const { mascotas, removeMascota, updateMascota } = useClientContext()
  const navigate = useNavigate()

  const [mascotaEditando, setMascotaEditando] = useState(null)
  const [formEditar, setFormEditar] = useState({})
  const [loadingEditar, setLoadingEditar] = useState(false)
  const [errorEditar, setErrorEditar] = useState(null)

  const setF = (field, value) => setFormEditar((f) => ({ ...f, [field]: value }))

  const handleEditar = (m) => {
    setMascotaEditando(m)
    setErrorEditar(null)
    setFormEditar({
      nombre: m.nombre ?? '',
      especie: m.especie ?? 'PERRO',
      raza: m.raza ?? '',
      sexo: m.sexo ?? '',
      peso: m.peso != null ? String(m.peso) : '',
      fechaNacimiento: m.fechaNacimiento ?? '',
      animalGuia: m.animalGuia ?? false,
    })
  }

  const handleGuardar = async () => {
    if (!formEditar.nombre.trim()) {
      setErrorEditar('El nombre es obligatorio')
      return
    }
    setLoadingEditar(true)
    setErrorEditar(null)
    try {
      const updated = await actualizarMascota(mascotaEditando.idMascota, {
        nombre: formEditar.nombre.trim(),
        especie: formEditar.especie,
        raza: formEditar.raza || null,
        sexo: formEditar.sexo || null,
        peso: formEditar.peso ? parseFloat(formEditar.peso) : null,
        fechaNacimiento: formEditar.fechaNacimiento || null,
        animalGuia: ESPECIES_GUIA.includes(formEditar.especie) ? formEditar.animalGuia : false,
      })
      updateMascota(updated)
      setMascotaEditando(null)
    } catch (err) {
      setErrorEditar(handleError(err))
    } finally {
      setLoadingEditar(false)
    }
  }

  const handleEliminar = async (idMascota, nombre) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${nombre}?`)) return
    try {
      await eliminarMascota(idMascota)
      removeMascota(idMascota)
    } catch (err) {
      alert(handleError(err))
    }
  }

  return (
    <ClientLayout>
      {/* Header */}
      <div className="mascotas-header">
        <div>
          <h2 className="mascotas-header__title">🐾 Mis Mascotas</h2>
          <p className="mascotas-header__subtitle">Toda la información de tus mascotas</p>
        </div>
        <button className="mascotas-btn-nueva" onClick={() => navigate('/client/mascotas/nueva')}>
          + Nueva mascota
        </button>
      </div>

      {mascotas.length === 0 ? (
        <div className="mascotas-empty">
          <p className="mascotas-empty__icon">🐾</p>
          <p>No tienes mascotas registradas aún.</p>
        </div>
      ) : (
        <>
          {/* Tabla — desktop */}
          <div className="mascotas-table-wrapper">
            <table className="mascotas-table">
              <thead>
                <tr>
                  {['Nombre', 'Especie', 'Raza', 'Sexo', 'Edad', 'Peso', 'Acciones'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mascotas.map((m) => (
                  <tr key={m.idMascota}>
                    <td>
                      <div className="mascotas-mascota-cell">
                        <div className="mascotas-avatar">{especieEmoji(m.especie)}</div>
                        <div className="mascotas-nombre-col">
                          <span className="mascotas-mascota-nombre">{m.nombre}</span>
                          {m.animalGuia && (
                            <div className="mascotas-guia-badge">🦮 Animal guía</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{m.especie}</td>
                    <td>{m.raza ?? '—'}</td>
                    <td>{m.sexo ?? '—'}</td>
                    <td>{calcularEdad(m.fechaNacimiento)} años</td>
                    <td>{m.peso ? `${m.peso} kg` : '—'}</td>
                    <td>
                      <div className="mascotas-acciones">
                        <button className="btn-editar" onClick={() => handleEditar(m)}>Editar</button>
                        <button className="btn-eliminar" onClick={() => handleEliminar(m.idMascota, m.nombre)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — móvil */}
          <div className="mascotas-cards">
            {mascotas.map((m) => (
              <div key={m.idMascota} className="mascotas-card">
                <div className="mascotas-card__avatar">{especieEmoji(m.especie)}</div>
                <div className="mascotas-card__nombre">{m.nombre}</div>
                {m.animalGuia && (
                  <div className="mascotas-guia-badge">🦮 Animal guía</div>
                )}
                <div className="mascotas-card__meta">{m.especie}{m.raza ? ` · ${m.raza}` : ''}</div>
                <div className="mascotas-card__chips">
                  {m.sexo && <span className="mascotas-chip">{m.sexo}</span>}
                  <span className="mascotas-chip">{calcularEdad(m.fechaNacimiento)} años</span>
                  {m.peso && <span className="mascotas-chip">{m.peso} kg</span>}
                </div>
                <div className="mascotas-card__actions">
                  <button className="btn-editar" onClick={() => handleEditar(m)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(m.idMascota, m.nombre)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de edición */}
      {mascotaEditando && (
        <div className="mascotas-modal-overlay" onClick={() => setMascotaEditando(null)}>
          <div className="mascotas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mascotas-modal__header">
              <h3 className="mascotas-modal__title">Editar mascota</h3>
              <button className="mascotas-modal__close" onClick={() => setMascotaEditando(null)}>×</button>
            </div>

            <div className="mascotas-modal__body">
              <div className="mascotas-modal__grid">
                <div className="mascotas-modal__field">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formEditar.nombre}
                    onChange={(e) => setF('nombre', e.target.value)}
                    placeholder="Ej: Rocky"
                  />
                </div>

                <div className="mascotas-modal__field">
                  <label>Especie</label>
                  <select
                    value={formEditar.especie}
                    onChange={(e) => {
                      setF('especie', e.target.value)
                      if (!ESPECIES_GUIA.includes(e.target.value)) setF('animalGuia', false)
                    }}
                  >
                    <option value="PERRO">Perro</option>
                    <option value="GATO">Gato</option>
                    <option value="AVE">Ave</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="mascotas-modal__field">
                  <label>Raza</label>
                  <input
                    type="text"
                    value={formEditar.raza}
                    onChange={(e) => setF('raza', e.target.value)}
                    placeholder="Ej: Labrador"
                  />
                </div>

                <div className="mascotas-modal__field">
                  <label>Sexo</label>
                  <select value={formEditar.sexo} onChange={(e) => setF('sexo', e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="MACHO">Macho</option>
                    <option value="HEMBRA">Hembra</option>
                  </select>
                </div>

                <div className="mascotas-modal__field">
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formEditar.peso}
                    onChange={(e) => setF('peso', e.target.value)}
                    placeholder="Ej: 8.5"
                  />
                </div>

                <div className="mascotas-modal__field">
                  <label>Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={formEditar.fechaNacimiento}
                    onChange={(e) => setF('fechaNacimiento', e.target.value)}
                  />
                </div>
              </div>

              {ESPECIES_GUIA.includes(formEditar.especie) && (
                <div className="mascotas-modal__checkbox">
                  <input
                    type="checkbox"
                    id="modal-animalGuia"
                    checked={formEditar.animalGuia}
                    onChange={(e) => setF('animalGuia', e.target.checked)}
                  />
                  <label htmlFor="modal-animalGuia">¿Es animal guía o de apoyo emocional?</label>
                </div>
              )}

              {errorEditar && <p className="mascotas-modal__error">{errorEditar}</p>}
            </div>

            <div className="mascotas-modal__footer">
              <button className="mascotas-modal__btn-cancel" onClick={() => setMascotaEditando(null)}>
                Cancelar
              </button>
              <button className="mascotas-modal__btn-save" onClick={handleGuardar} disabled={loadingEditar}>
                {loadingEditar ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}

export default MascotaList
