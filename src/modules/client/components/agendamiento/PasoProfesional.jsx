const PasoProfesional = ({ veterinarios, seleccion, onSelect }) => (
  <div>
    <p className="ag-section-title">¿Con qué profesional deseas la cita?</p>

    {veterinarios.length === 0 ? (
      <div className="ag-empty">
        <span className="ag-empty__icon">👨‍⚕️</span>
        <p>No hay veterinarios disponibles.</p>
      </div>
    ) : (
      <div className="ag-vet-list">
        {veterinarios.map((v) => (
          <div
            key={v.idUsuario}
            onClick={() => onSelect(v)}
            className={[
              'ag-card',
              'ag-vet-card',
              seleccion?.idUsuario === v.idUsuario ? 'ag-card--selected' : '',
            ].join(' ').trim()}
          >
            <div className="ag-vet-card__avatar">
              {(v.nombres?.[0] ?? '').toUpperCase()}
              {(v.apellidos?.[0] ?? '').toUpperCase()}
            </div>
            <div>
              <p className="ag-vet-card__name">{v.nombres} {v.apellidos}</p>
              <p className="ag-vet-card__esp">Veterinario General</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default PasoProfesional
