const ESPECIE_EMOJI = { PERRO: '🐶', GATO: '🐱' }

const PasoPaciente = ({ mascotas, seleccion, onSelect }) => (
  <div>
    <p className="ag-section-title">¿Para cuál de tus mascotas es la cita?</p>

    {mascotas.length === 0 ? (
      <div className="ag-empty">
        <span className="ag-empty__icon">🐾</span>
        <p>No tienes mascotas registradas aún.</p>
      </div>
    ) : (
      <div className="ag-mascota-grid">
        {mascotas.map((m) => {
          const selected = seleccion?.idMascota === m.idMascota
          return (
            <div
              key={m.idMascota}
              onClick={() => onSelect(m)}
              className={[
                'ag-card',
                'ag-mascota-card',
                selected ? 'ag-card--selected ag-mascota-card--selected' : '',
              ].join(' ').trim()}
            >
              <div className="ag-mascota-card__emoji">
                {ESPECIE_EMOJI[m.especie?.toUpperCase()] ?? '🐾'}
              </div>
              <p className="ag-mascota-card__name">{m.nombre}</p>
              <p className="ag-mascota-card__meta">
                {m.especie}{m.raza ? ` · ${m.raza}` : ''}
              </p>
            </div>
          )
        })}
      </div>
    )}
  </div>
)

export default PasoPaciente
