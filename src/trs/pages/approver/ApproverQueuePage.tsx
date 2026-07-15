import { useState } from 'react';
import { useTrs, Pill } from '../../TrsProvider';
import { PASS_TYPE_LABELS } from '../../trsTypes';

export function ApproverQueuePage() {
  const { state, approveRequest, rejectRequest, getGroupById } = useTrs();
  const [editQty, setEditQty] = useState<Record<string, number>>({});
  const pending = state.requests.filter((r) => r.status === 'pending');

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Step 4 — Approve requests. Reduced-price tickets create <strong>Reservations</strong> (payment links); SAP requests issue passes.</p>
        </div>
      </div>
      <div className="gl-layout">
        {pending.length === 0 ? (
          <p className="gl-empty">No pending requests. Use <strong>Recipients</strong> + <strong>Requests</strong> tabs as Group lead first.</p>
        ) : (
          pending.map((req) => {
            const group = getGroupById(req.groupId);
            const qty = editQty[req.id] ?? req.quantity;
            return (
              <section key={req.id} className="gl-editor">
                <Pill status="pending" />
                <h2 className="gl-editor__title" style={{ marginTop: '0.5rem' }}>{group?.name} — {PASS_TYPE_LABELS[req.passType]}</h2>
                <p className="gl-note">From {req.requestedBy} · {req.recipientIds.length} recipients · requested {req.quantity}</p>
                <label className="gl-field" style={{ maxWidth: '8rem', marginTop: '0.75rem' }}>
                  <span className="gl-field__label">Approve qty</span>
                  <input type="number" className="gl-input" value={qty} onChange={(e) => setEditQty({ ...editQty, [req.id]: Number(e.target.value) })} />
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button type="button" className="gl-btn-primary" onClick={() => approveRequest(req.id, qty)}>Approve</button>
                  <button type="button" className="gl-btn-secondary" onClick={() => rejectRequest(req.id)}>Reject</button>
                </div>
              </section>
            );
          })
        )}
        {state.requests.filter((r) => r.status !== 'pending').length > 0 && (
          <section className="gl-editor">
            <h2 className="gl-editor__title">History</h2>
            <div className="gl-gen__table-wrap">
              <table className="gl-gen-table">
                <thead><tr><th>Group</th><th>Type</th><th>Qty</th><th>Status</th></tr></thead>
                <tbody>
                  {state.requests.filter((r) => r.status !== 'pending').map((req) => (
                    <tr key={req.id}>
                      <td>{getGroupById(req.groupId)?.name}</td>
                      <td>{PASS_TYPE_LABELS[req.passType]}</td>
                      <td>{req.approvedQuantity ?? req.quantity}</td>
                      <td><Pill status={req.status} /></td>
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
