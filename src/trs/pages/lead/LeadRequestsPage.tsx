import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrs, Pill } from '../../TrsProvider';
import { PASS_TYPE_LABELS, type PassType } from '../../trsTypes';

export function LeadRequestsPage() {
  const { state, getRemaining, getGroupById, activeGroupId, createRequest } = useTrs();
  const group = getGroupById(activeGroupId);
  const recipients = state.recipients.filter((r) => r.campName === group?.name);
  const [passType, setPassType] = useState<PassType>('sap');
  const [qty, setQty] = useState(5);
  const [done, setDone] = useState(false);

  const remaining = getRemaining(passType);
  const selectedIds = useMemo(() => recipients.slice(0, qty).map((r) => r.id), [recipients, qty]);

  if (recipients.length === 0) {
    return (
      <div className="gl-page">
        <div className="gl-layout">
          <p className="gl-empty">Upload crew first in <Link to="/assets/hubs/trs/recipients">Recipients</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Step 3 — Request passes against your cap. {remaining} SAP remaining.</p>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">New request — {group?.name}</h2>
          {done ? (
            <p className="gl-toast">Submitted — go to <strong>Approvals</strong> tab to review.</p>
          ) : (
            <>
              <div className="gl-details-grid">
                <label className="gl-field">
                  <span className="gl-field__label">Pass type</span>
                  <select className="gl-select" value={passType} onChange={(e) => setPassType(e.target.value as PassType)}>
                    <option value="sap">Setup Access Pass</option>
                    <option value="reduced_ticket">Reduced-price ticket</option>
                  </select>
                </label>
                <label className="gl-field">
                  <span className="gl-field__label">Quantity (max {remaining})</span>
                  <input type="number" className="gl-input" min={1} max={remaining} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                </label>
              </div>
              <p className="gl-note">{selectedIds.length} recipients attached from crew list.</p>
              <button type="button" className="gl-btn-primary" onClick={() => { createRequest(passType, qty, selectedIds); setDone(true); }} disabled={remaining === 0}>
                Submit for approval
              </button>
            </>
          )}
        </section>

        {state.requests.length > 0 && (
          <section className="gl-editor">
            <h2 className="gl-editor__title">Your requests</h2>
            <div className="gl-gen__table-wrap">
              <table className="gl-gen-table">
                <thead><tr><th>Type</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  {state.requests.map((r) => (
                    <tr key={r.id}>
                      <td>{PASS_TYPE_LABELS[r.passType]}</td>
                      <td>{r.quantity}</td>
                      <td><Pill status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
