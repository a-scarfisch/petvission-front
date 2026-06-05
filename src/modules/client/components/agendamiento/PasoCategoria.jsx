const TIPOS = [
  {
    key: 'CONSULTA',
    icono: '🩺',
    titulo: 'Consulta General',
    descripcion: 'El veterinario revisa a tu mascota y registra el historial clínico',
  },
  {
    key: 'SERVICIOS',
    icono: '✂️',
    titulo: 'Servicios',
    descripcion: 'Peluquería, procedimientos o exámenes de laboratorio',
  },
]

const PasoCategoria = ({ seleccion, onSelect }) => (
  <div>
    <p className="ag-section-title">¿Qué tipo de atención necesita tu mascota?</p>

    <div className="ag-categoria-grid">
      {TIPOS.map((t) => (
        <div
          key={t.key}
          onClick={() => onSelect(t.key)}
          className={[
            'ag-card',
            'ag-categoria-card',
            seleccion === t.key ? 'ag-card--selected ag-categoria-card--selected' : '',
          ].join(' ').trim()}
        >
          <span className="ag-categoria-card__icono">{t.icono}</span>
          <p className="ag-categoria-card__titulo">{t.titulo}</p>
          <p className="ag-categoria-card__desc">{t.descripcion}</p>
        </div>
      ))}
    </div>
  </div>
)

export default PasoCategoria
