const CATEGORIA_ICONO = {
  CONSULTA:    '🩺',
  VACUNACION:  '💉',
  ESTETICA:    '✂️',
  CIRUGIA:     '🔬',
  LABORATORIO: '🧪',
}

const formatCLP = (precio) =>
  precio != null
    ? `$${Number(precio).toLocaleString('es-CL')}`
    : ''

const PasoServicio = ({ servicios, seleccion, onSelect }) => (
  <div>
    <p className="ag-section-title">¿Qué tipo de servicio necesitas?</p>

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
            <span className="ag-servicio-tile__icon">
              {CATEGORIA_ICONO[s.categoria?.toUpperCase()] ?? '🏥'}
            </span>
            <p className="ag-servicio-tile__name">{s.nombre}</p>
            <p className="ag-servicio-tile__price">{formatCLP(s.precio)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default PasoServicio
