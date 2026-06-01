import { useState, useEffect, useRef } from 'react'
import apiClient from '@/modules/core/lib/apiClient'
import { handleError } from '@/modules/core/lib/errorHandler'
import AdminLayout from './AdminLayout'

const FILTROS = ['Todas', 'PERRO', 'GATO', 'Inactivas']

const especieEmoji = (especie) => {
  const map = { GATO: '🐱', AVE: '🐦', OTRO: '🐹' }
  return map[especie?.toUpperCase()] ?? '🐶'
}

const AdminMascotas = () => {
  const [mascotas, setMascotas]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [filtro, setFiltro]                   = useState('Todas')
  const [busqueda, setBusqueda]               = useState('')

  // Modal reasignar
  const [mascotaSel, setMascotaSel]           = useState(null)
  const [clientes, setClientes]               = useState([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [busquedaCli, setBusquedaCli]         = useState('')
  const [clienteSel, setClienteSel]           = useState(null)
  const [saving, setSaving]                   = useState(false)
  const [errorModal, setErrorModal]           = useState('')
  const clientesCargados                      = useRef(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await apiClient.get('/mascotas/todas')
        setMascotas(data.data ?? [])
      } catch (err) {
        console.error('Error cargando mascotas:', handleError(err))
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const abrirReasignar = async (mascota) => {
    setMascotaSel(mascota)
    setBusquedaCli('')
    setClienteSel(null)
    setErrorModal('')

    if (!clientesCargados.current) {
      setLoadingClientes(true)
      try {
        const { data } = await apiClient.get('/usuarios/clientes')
        setClientes(data.data ?? [])
        clientesCargados.current = true
      } catch (err) {
        setErrorModal(handleError(err))
      } finally {
        setLoadingClientes(false)
      }
    }
  }

  const cerrarModal = () => setMascotaSel(null)

  const handleReasignar = async () => {
    if (!clienteSel) return
    setSaving(true)
    setErrorModal('')
    try {
      const { data } = await apiClient.patch(
        `/mascotas/${mascotaSel.idMascota}/reasignar`,
        { idNuevoUsuario: clienteSel.idUsuario }
      )
      setMascotas((prev) =>
        prev.map((m) => m.idMascota === mascotaSel.idMascota ? data.data : m)
      )
      cerrarModal()
    } catch (err) {
      setErrorModal(handleError(err))
    } finally {
      setSaving(false)
    }
  }

  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombres} ${c.apellidos} ${c.correo}`
      .toLowerCase().includes(busquedaCli.toLowerCase())
  )

  const filtradas = mascotas
    .filter((m) => {
      if (filtro === 'PERRO')     return m.especie?.toUpperCase() === 'PERRO'
      if (filtro === 'GATO')      return m.especie?.toUpperCase() === 'GATO'
      if (filtro === 'Inactivas') return !m.estado
      return true
    })
    .filter((m) =>
      `${m.nombre} ${m.nombreUsuario}`.toLowerCase().includes(busqueda.toLowerCase())
    )

  if (loading) return <AdminLayout><p className="adm-empty">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🐾 Mascotas</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Todas las mascotas registradas en el sistema ({mascotas.length})
        </p>
      </div>

      <div className="adm-toolbar">
        <input
          className="adm-search"
          type="text"
          placeholder="Buscar por nombre o dueño..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`adm-filtro-btn${filtro === f ? ' adm-filtro-btn--active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="adm-table-wrapper">
        {filtradas.length === 0 ? (
          <div className="adm-empty">
            <p className="adm-empty__icon">🐾</p>
            <p>No se encontraron mascotas.</p>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                {['Mascota', 'Especie', 'Raza', 'Dueño', 'Estado', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((m) => (
                <tr key={m.idMascota}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="adm-avatar" style={{ background: '#e8f5f0', color: '#2a9d8f', fontSize: '17px' }}>
                        {especieEmoji(m.especie)}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                        {m.animalGuia && (
                          <span className="adm-badge adm-badge--activo" style={{ marginLeft: '6px', fontSize: '11px' }}>
                            🦮 Guía
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{m.especie}</td>
                  <td>{m.raza ?? '—'}</td>
                  <td>{m.nombreUsuario}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${m.estado ? 'activo' : 'inactivo'}`}>
                      {m.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="adm-btn-secondary" onClick={() => abrirReasignar(m)}>
                      ✏️ Reasignar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mascotaSel && (
        <div className="adm-modal-overlay" onClick={cerrarModal}>
          <div className="adm-modal adm-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3 className="adm-modal__title">✏️ Reasignar dueño</h3>
              <button className="adm-modal__close" onClick={cerrarModal}>✕</button>
            </div>
            <div className="adm-modal__body">
              {errorModal && <p className="adm-msg-error">{errorModal}</p>}

              <div className="adm-form-row" style={{ marginBottom: '16px' }}>
                <div>
                  <p className="adm-form-label">Mascota</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{mascotaSel.nombre}</p>
                </div>
                <div>
                  <p className="adm-form-label">Dueño actual</p>
                  <p style={{ margin: 0, color: '#6b7280' }}>{mascotaSel.nombreUsuario}</p>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Buscar nuevo dueño (clientes)</label>
                <input
                  className="adm-form-input"
                  type="text"
                  placeholder="Nombre o correo..."
                  value={busquedaCli}
                  onChange={(e) => { setBusquedaCli(e.target.value); setClienteSel(null) }}
                />
              </div>

              {loadingClientes ? (
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>Cargando clientes...</p>
              ) : busquedaCli.length > 0 && (
                <div className="adm-select-list">
                  {clientesFiltrados.length === 0 ? (
                    <div className="adm-select-item" style={{ color: '#9ca3af', cursor: 'default' }}>
                      Sin resultados
                    </div>
                  ) : clientesFiltrados.map((c) => (
                    <div
                      key={c.idUsuario}
                      className={`adm-select-item${clienteSel?.idUsuario === c.idUsuario ? ' adm-select-item--active' : ''}`}
                      onClick={() => setClienteSel(c)}
                    >
                      <span style={{ fontWeight: 600 }}>{c.nombres} {c.apellidos}</span>
                      <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '12px' }}>{c.correo}</span>
                    </div>
                  ))}
                </div>
              )}

              {clienteSel && (
                <p className="adm-msg-success" style={{ marginTop: '12px' }}>
                  Nuevo dueño seleccionado: <strong>{clienteSel.nombres} {clienteSel.apellidos}</strong>
                </p>
              )}
            </div>

            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={cerrarModal}>Cancelar</button>
              <button
                className="adm-btn-primary"
                onClick={handleReasignar}
                disabled={!clienteSel || saving}
              >
                {saving ? 'Guardando...' : 'Confirmar reasignación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminMascotas
