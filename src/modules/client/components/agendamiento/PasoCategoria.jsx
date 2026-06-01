const CATEGORIAS = [
  {
    key: 'CONSULTA',
    icono: '🩺',
    titulo: 'Consulta General',
    descripcion: 'Describe el motivo de tu visita y un veterinario te atenderá',
  },
  {
    key: 'VACUNACION',
    icono: '💉',
    titulo: 'Vacunación',
    descripcion: 'Mantén al día el calendario de vacunas de tu mascota',
  },
  {
    key: 'LABORATORIO',
    icono: '🔬',
    titulo: 'Laboratorio',
    descripcion: 'Exámenes, diagnóstico por imagen y procedimientos especializados',
  },
]

const PasoCategoria = ({ seleccion, onSelect }) => (
  <div>
    <p className="ag-section-title">¿Qué tipo de atención necesitas?</p>

    <div className="ag-categoria-grid">
      {CATEGORIAS.map((c) => (
        <div
          key={c.key}
          onClick={() => onSelect(c.key)}
          className={[
            'ag-card',
            'ag-categoria-card',
            seleccion === c.key ? 'ag-card--selected ag-categoria-card--selected' : '',
          ].join(' ').trim()}
        >
          <span className="ag-categoria-card__icono">{c.icono}</span>
          <p className="ag-categoria-card__titulo">{c.titulo}</p>
          <p className="ag-categoria-card__desc">{c.descripcion}</p>
        </div>
      ))}
    </div>
  </div>
)

export default PasoCategoria
