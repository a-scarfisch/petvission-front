const MOTIVOS_CONSULTA = [
  { key: '',                    label: '— Selecciona el motivo (opcional) —' },
  { key: 'Control rutinario',   label: 'Control rutinario / chequeo general' },
  { key: 'Problema digestivo',  label: 'Problema digestivo (vómito, diarrea)' },
  { key: 'Problema de piel',    label: 'Problema de piel o pelaje' },
  { key: 'Problema respiratorio', label: 'Problema respiratorio (tos, estornudos)' },
  { key: 'Problema locomotor',  label: 'Problema locomotor (cojera, dolor)' },
  { key: 'Herida o traumatismo', label: 'Herida o traumatismo' },
  { key: 'Otra consulta',       label: 'Otra consulta' },
]

const SUBTIPOS = [
  { key: 'PROCEDIMIENTO', icono: '🔧', label: 'Procedimiento',  desc: 'Limpieza dental, curaciones, aplicación de medicamentos' },
  { key: 'LABORATORIO',   icono: '🔬', label: 'Laboratorio',    desc: 'Exámenes de sangre, imagenología, diagnóstico avanzado' },
  { key: 'PELUQUERIA',    icono: '✂️', label: 'Peluquería',     desc: 'Baño, corte, uñas y cuidado estético' },
]

const formatCLP = (precio) =>
  precio != null ? `$${Number(precio).toLocaleString('es-CL')}` : 'Consultar precio'

const PasoServicio = ({
  tipoAtencion,
  categoriaReserva,
  servicios,
  seleccion,
  motivoKey,
  observacion,
  onSubtipo,
  onSelect,
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

        <label className="ag-obs-label">Observación adicional <span className="ag-obs-opcional">(opcional)</span></label>
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

      <div className="ag-categoria-grid" style={{ marginBottom: '24px' }}>
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

      {categoriaReserva === 'LABORATORIO' && (
        <div className="ag-card" style={{ textAlign: 'center', padding: '28px 24px', background: '#eff6ff', border: '1.5px solid #bfdbfe' }}>
          <p style={{ fontSize: '36px', margin: '0 0 10px' }}>🔬</p>
          <p style={{ fontWeight: 600, margin: '0 0 8px', color: '#1e40af' }}>El veterinario determinará los estudios necesarios</p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Durante la consulta se solicitarán los exámenes, imágenes o muestras que correspondan según el diagnóstico.
          </p>
        </div>
      )}

      {(categoriaReserva === 'PROCEDIMIENTO' || categoriaReserva === 'PELUQUERIA') && (
        servicios.length === 0 ? (
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
        )
      )}
    </div>
  )
}

export default PasoServicio
