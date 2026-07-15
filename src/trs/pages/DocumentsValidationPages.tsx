import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrs } from '../TrsProvider';
import { validateBarcode } from '../barcode';
import { PASS_TYPE_LABELS } from '../trsTypes';

export function DocumentsPage() {
  const { state } = useTrs();
  const sample = state.passes[0];

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Print-at-home Setup Access Passes — generated on approval with variable barcode rules.</p>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">Issued documents ({state.passes.length + state.reservations.length})</h2>
          {state.passes.length === 0 && state.reservations.length === 0 ? (
            <p className="gl-empty">Approve a request first.</p>
          ) : (
            <div className="gl-gen__table-wrap">
              <table className="gl-gen-table">
                <thead><tr><th>Holder</th><th>Camp</th><th>Type</th><th>Valid from</th><th>Funnel</th></tr></thead>
                <tbody>
                  {state.passes.map((p) => {
                    const rcp = state.recipients.find((r) => r.id === p.recipientId);
                    const reservation = rcp ? state.reservations.find((r) => r.recipientId === rcp.id) : undefined;
                    return (
                      <tr key={p.id}>
                        <td>{p.holderName}</td>
                        <td>{p.campName}</td>
                        <td>{PASS_TYPE_LABELS[p.passType]}</td>
                        <td>{p.validFrom}</td>
                        <td>
                          {reservation && (
                            <Link to={`/pay/${reservation.locator}`} className="gl-btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginRight: '0.25rem' }}>Payment link</Link>
                          )}
                          {rcp && p.passType === 'sap' && (
                            <Link to={`/claim/${rcp.inviteToken}/pass`} className="gl-btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>SAP pass</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {state.reservations.filter((res) => !state.passes.some((p) => p.recipientId === res.recipientId)).map((res) => {
                    const rcp = state.recipients.find((r) => r.id === res.recipientId);
                    return (
                      <tr key={res.id}>
                        <td>{res.ownerFullName}</td>
                        <td>{rcp?.campName}</td>
                        <td>Reduced-price ticket</td>
                        <td>—</td>
                        <td>
                          <Link to={`/pay/${res.locator}`} className="gl-btn-secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Payment link</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {sample && (
          <section className="gl-editor">
            <h2 className="gl-editor__title">SAP template preview</h2>
            <div style={{ maxWidth: '22rem', border: '2px dashed #d8dee2', borderRadius: '8px', padding: '1rem' }}>
              <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: '#5a7385', margin: 0 }}>Not a ticket</p>
              <h3 style={{ font: '700 1rem Montserrat', color: '#c45c26', margin: '0.25rem 0' }}>SETUP ACCESS PASS</h3>
              <p style={{ fontSize: '0.8125rem' }}>{sample.holderName} · {sample.campName}</p>
              <p style={{ fontSize: '0.6875rem', color: '#5a7385' }}>{sample.department} · valid from {sample.validFrom}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function ValidationPage() {
  const { state } = useTrs();
  const [scanDate, setScanDate] = useState('2026-08-26');
  const [scanCode, setScanCode] = useState(state.passes[0]?.barcode ?? '');
  const scanResult = scanCode ? validateBarcode(scanCode, scanDate, state.passes.find((p) => p.barcode === scanCode)) : null;

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Gate scanner — each barcode validates camp, department, and valid-from date.</p>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">Barcode validation</h2>
          {state.passes.length === 0 ? (
            <p className="gl-empty">No passes to scan yet.</p>
          ) : (
            <>
              <div className="gl-details-grid">
                <label className="gl-field">
                  <span className="gl-field__label">Scan date</span>
                  <input type="date" className="gl-input" value={scanDate} onChange={(e) => setScanDate(e.target.value)} />
                </label>
                <label className="gl-field">
                  <span className="gl-field__label">Pass</span>
                  <select className="gl-select" value={scanCode} onChange={(e) => setScanCode(e.target.value)}>
                    {state.passes.map((p) => (
                      <option key={p.id} value={p.barcode}>{p.holderName}</option>
                    ))}
                  </select>
                </label>
              </div>
              {scanResult && (
                <p style={{ marginTop: '0.75rem', fontWeight: 600, color: scanResult.valid ? '#18824c' : '#eb0052' }}>
                  {scanResult.valid ? '✓ ACCESS GRANTED' : `✗ ${scanResult.reasons.join(', ')}`}
                </p>
              )}
              <p className="gl-note">Try 2026-08-25 for &quot;too early&quot; rejection.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
