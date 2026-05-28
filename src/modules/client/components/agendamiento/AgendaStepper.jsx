import React from 'react'

const AgendaStepper = ({ paso, pasos }) => (
  <div className="ag-stepper">
    {pasos.map((p, i) => (
      <React.Fragment key={p}>
        <div className={[
          'ag-step',
          i === paso ? 'ag-step--active' : '',
          i < paso  ? 'ag-step--done'   : '',
        ].join(' ').trim()}>
          <div className="ag-step__circle">
            {i < paso ? '✓' : i + 1}
          </div>
          <span className="ag-step__label">{p}</span>
        </div>

        {i < pasos.length - 1 && (
          <div className={`ag-step__connector${i < paso ? ' ag-step__connector--done' : ''}`} />
        )}
      </React.Fragment>
    ))}
  </div>
)

export default AgendaStepper
