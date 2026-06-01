import { useState } from 'react'

const TablaResponsiva = ({
  columnas,
  datos,
  keyField,
  acciones,
  emptyIcon = '📋',
  emptyMessage = 'No hay registros.',
}) => {
  const [abiertos, setAbiertos] = useState(new Set())

  const toggle = (id) =>
    setAbiertos((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const primarias   = columnas.filter((c) => c.primary)
  const secundarias = columnas.filter((c) => !c.primary)

  if (datos.length === 0) {
    return (
      <div className="adm-table-wrapper">
        <div className="adm-empty">
          <p className="adm-empty__icon">{emptyIcon}</p>
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop ── */}
      <div className="adm-table-wrapper tbl-desktop">
        <table className="adm-table">
          <thead>
            <tr>
              {columnas.map((c) => <th key={c.key}>{c.label}</th>)}
              {acciones && <th />}
            </tr>
          </thead>
          <tbody>
            {datos.map((fila) => (
              <tr key={fila[keyField]}>
                {columnas.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(fila) : (fila[c.key] ?? '—')}
                  </td>
                ))}
                {acciones && <td>{acciones(fila)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Móvil ── */}
      <div className="tbl-mobile">
        {datos.map((fila) => {
          const id      = fila[keyField]
          const abierto = abiertos.has(id)

          return (
            <div key={id} className="tbl-card">
              <div className="tbl-card__primary">
                {primarias.map((c) => (
                  <div key={c.key}>
                    {c.render ? c.render(fila) : (fila[c.key] ?? '—')}
                  </div>
                ))}
              </div>

              {secundarias.length > 0 && (
                <button
                  className="tbl-card__toggle"
                  onClick={() => toggle(id)}
                  aria-expanded={abierto}
                >
                  <span>{abierto ? 'Ver menos' : 'Ver más'}</span>
                  <span className={`tbl-card__chevron${abierto ? ' tbl-card__chevron--open' : ''}`}>
                    ▾
                  </span>
                </button>
              )}

              {abierto && (
                <div className="tbl-card__body">
                  {secundarias.map((c) => (
                    <div key={c.key} className="tbl-card__field">
                      <span className="tbl-card__label">{c.label}</span>
                      <span className="tbl-card__value">
                        {c.render ? c.render(fila) : (fila[c.key] ?? '—')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {acciones && (
                <div className="tbl-card__actions">
                  {acciones(fila)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default TablaResponsiva
