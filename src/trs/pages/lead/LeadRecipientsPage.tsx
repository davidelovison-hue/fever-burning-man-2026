import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrs, Pill } from '../../TrsProvider';
import { parseCsv, validRows, type CsvRow } from '../../csvParser';

const SAMPLE_CSV = `Full Name,Email,Playa Name,Build Role
Builder One,builder1@example.com,Dust Bunny,Framing
Builder Two,builder2@example.com,Sparkle Pony,Kitchen
Builder Three,,Moon Dust,Missing email
Builder One,builder1@example.com,Duplicate,Duplicate row`;

export function LeadRecipientsPage() {
  const { state, importCsvRecipients, getGroupById, activeGroupId } = useTrs();
  const group = getGroupById(activeGroupId);
  const recipients = state.recipients.filter((r) => r.campName === group?.name);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<CsvRow[]>([]);
  const [committed, setCommitted] = useState(false);

  const loadSample = () => {
    setCsvText(SAMPLE_CSV);
    setParsed(parseCsv(SAMPLE_CSV, group?.name ?? ''));
  };

  const commit = () => {
    importCsvRecipients(validRows(parsed).map((r) => ({
      email: r.email, fullName: r.fullName, playaName: r.playaName, buildRole: r.buildRole,
    })));
    setCommitted(true);
  };

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Step 2 — Bulk upload crew with validation. Custom fields: playa name, build role, camp.</p>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">CSV upload — {group?.name}</h2>
          <textarea className="gl-textarea" value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={5} placeholder="Paste CSV…" />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" className="gl-btn-secondary" onClick={loadSample}>Load sample</button>
            <button type="button" className="gl-btn-primary" onClick={() => setParsed(parseCsv(csvText || SAMPLE_CSV, group?.name ?? ''))}>Validate</button>
          </div>
          {parsed.length > 0 && (
            <>
              <div className="gl-gen__table-wrap" style={{ marginTop: '1rem' }}>
                <table className="gl-gen-table">
                  <thead><tr><th>Row</th><th>Name</th><th>Email</th><th>Playa</th><th>Status</th></tr></thead>
                  <tbody>
                    {parsed.map((row) => (
                      <tr key={row.rowIndex} className={row.errors.length ? 'gl-row-error' : ''}>
                        <td>{row.rowIndex}</td><td>{row.fullName}</td><td>{row.email}</td><td>{row.playaName || '—'}</td>
                        <td>{row.errors.length ? row.errors.join('; ') : 'OK'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="gl-btn-primary" style={{ marginTop: '0.75rem' }} onClick={commit} disabled={validRows(parsed).length === 0}>
                {committed ? 'Committed ✓' : `Commit ${validRows(parsed).length} rows`}
              </button>
            </>
          )}
        </section>

        {recipients.length > 0 && (
          <section className="gl-editor">
            <h2 className="gl-editor__title">Crew list ({recipients.length})</h2>
            <div className="gl-gen__table-wrap">
              <table className="gl-gen-table">
                <thead><tr><th>Name</th><th>Email</th><th>Playa name</th><th>Status</th></tr></thead>
                <tbody>
                  {recipients.map((r) => (
                    <tr key={r.id}>
                      <td>{r.fullName}</td><td>{r.email}</td><td>{r.playaName || '—'}</td><td><Pill status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="gl-note" style={{ marginTop: '0.75rem' }}>
              Next: <Link to="/assets/hubs/trs/requests">Submit request →</Link>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
