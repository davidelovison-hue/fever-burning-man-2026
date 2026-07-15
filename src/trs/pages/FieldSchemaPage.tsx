import { useState } from 'react';
import { useTrs } from '../TrsProvider';

export function FieldSchemaPage() {
  const { state, setFieldSchema, role } = useTrs();
  const [fields, setFields] = useState(state.fieldSchema);
  const canEdit = role === 'admin';

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Configurable tracking fields per program — used in CSV import and recipient claim forms.</p>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">Field schema — Theme camps</h2>
          {fields.map((field, i) => (
            <div key={field.id} className="gl-details-grid" style={{ marginBottom: '0.75rem' }}>
              <label className="gl-field">
                <span className="gl-field__label">Label</span>
                <input className="gl-input" value={field.label} readOnly={!canEdit} onChange={(e) => { const n = [...fields]; n[i] = { ...field, label: e.target.value }; setFields(n); }} />
              </label>
              <label className="gl-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={field.required} disabled={!canEdit} onChange={(e) => { const n = [...fields]; n[i] = { ...field, required: e.target.checked }; setFields(n); }} />
                <span className="gl-field__label" style={{ margin: 0 }}>Required</span>
              </label>
            </div>
          ))}
          {canEdit && (
            <button type="button" className="gl-btn-primary" onClick={() => setFieldSchema(fields)}>Save schema</button>
          )}
        </section>
      </div>
    </div>
  );
}
