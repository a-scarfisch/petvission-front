const formatCLP = (precio) =>
  precio != null ? `$${Number(precio).toLocaleString('es-CL')}` : 'Consultar precio'

const PasoServicio = ({ categoriaReserva, servicios, seleccion, motivo, onSelect, onMotivo }) => {
  if (categoriaReserva === 'CONSULTA') {
    return (
      <div>
        <p className="ag-section-title">¿Cuál es el motivo de la consulta?</p>
        <textarea
          className="ag-motivo-textarea"
          placeholder="Describe brevemente qué le ocurre a tu mascota..."
          value={motivo ?? ''}
          onChange={(e) => onMotivo(e.target.value)}
          rows={4}
        />
      </div>
    )
  }

  if (categoriaReserva === 'VACUNACION') {
    return (
      <div>
        <p className="ag-section-title">Vacunación</p>
        <div className="ag-card" style={{ textAlign: 'center', padding: '32px 24px', background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💉</p>
          <p style={{ fontWeight: 600, margin: '0 0 8px', color: '#166534' }}>No es necesario elegir la vacuna ahora</p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            El veterinario registrará la vacuna específica durante la consulta según el calendario y las necesidades de tu mascota.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="ag-section-title">Selecciona el servicio</p>

      {servicios.length === 0 ? (
        <div className="ag-empty">
          <span className="ag-empty__icon">🏥</span>
          <p>No hay servicios disponibles.</p>
        </div>
      ) : (
        <div className="ag-servicio-grid">
          {servicios.map((s) => (
            <div
              key={s.idServicio}
              onClick={() => onSelect(s)}
              className={[
                'ag-card',
                'ag-servicio-tile',
                seleccion?.idServicio === s.idServicio ? 'ag-card--selected' : '',
              ].join(' ').trim()}
            >
              <p className="ag-servicio-tile__name">{s.nombre}</p>
              <p className="ag-servicio-tile__desc">{s.descripcion}</p>
              <p className="ag-servicio-tile__price">{formatCLP(s.precio)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PasoServicio
