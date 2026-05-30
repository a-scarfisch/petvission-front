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
