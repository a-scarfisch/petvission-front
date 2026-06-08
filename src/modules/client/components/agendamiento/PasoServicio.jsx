const MOTIVOS_CONSULTA = [
  { key: '',                      label: '— Selecciona el motivo (opcional) —' },
  { key: 'Control rutinario',     label: 'Control rutinario / chequeo general' },
  { key: 'Problema digestivo',    label: 'Problema digestivo (vómito, diarrea)' },
  { key: 'Problema de piel',      label: 'Problema de piel o pelaje' },
  { key: 'Problema respiratorio', label: 'Problema respiratorio (tos, estornudos)' },
  { key: 'Problema locomotor',    label: 'Problema locomotor (cojera, dolor)' },
  { key: 'Herida o traumatismo',  label: 'Herida o traumatismo' },
  { key: 'Otra consulta',         label: 'Otra consulta' },
]

const SUBTIPOS = [
  { key: 'PROCEDIMIENTO', icono: '🔧', label: 'Procedimiento', desc: 'Limpieza dental, curaciones, aplicación de medicamentos' },
  { key: 'LABORATORIO',   icono: '🔬', label: 'Laboratorio',   desc: 'Exámenes de sangre, imagenología, diagnóstico avanzado' },
  { key: 'PELUQUERIA',    icono: '✂️', label: 'Peluquería',    desc: 'Baño, corte, uñas y cuidado estético' },
]

const PasoServicio = ({
  tipoAtencion,
  categoriaReserva,
  motivoKey,
  observacion,
  onSubtipo,
  onMotivoKey,
  onObservacion,
}) => {
  if (tipoAtencion === 'CONSULTA') {
    return (
      <div>
        <p className="ag-section-title">¿Cuál es el motivo de la consulta?</p>

        <select
          className="ag-select"
          value={motivoKey ?? ''}
          onChange={(e) => onMotivoKey(e.target.value)}
        >
          {MOTIVOS_CONSULTA.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>

        <label className="ag-obs-label">
          Observación adicional <span className="ag-obs-opcional">(opcional)</span>
        </label>
        <textarea
          className="ag-motivo-textarea ag-obs-textarea"
          placeholder="Agrega detalles breves si lo necesitas..."
          value={observacion ?? ''}
          onChange={(e) => {
            if (e.target.value.length <= 150) onObservacion(e.target.value)
          }}
          rows={3}
          maxLength={150}
        />
        <p className="ag-obs-counter">{(observacion ?? '').length}/150</p>
      </div>
    )
  }

  return (
    <div>
      <p className="ag-section-title">¿Qué tipo de servicio necesitas?</p>
      <div className="ag-categoria-grid">
        {SUBTIPOS.map((s) => (
          <div
            key={s.key}
            onClick={() => onSubtipo(s.key)}
            className={[
              'ag-card',
              'ag-categoria-card',
              categoriaReserva === s.key ? 'ag-card--selected ag-categoria-card--selected' : '',
            ].join(' ').trim()}
          >
            <span className="ag-categoria-card__icono">{s.icono}</span>
            <p className="ag-categoria-card__titulo">{s.label}</p>
            <p className="ag-categoria-card__desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasoServicio
