import { useTrs, Pill } from '../../TrsProvider';
import { PASS_TYPE_LABELS } from '../../trsTypes';

export function AdminOverviewPage() {
  const { state, getLedger, getGroupById, activeGroupId, resetDemo } = useTrs();
  const ledger = getLedger();
  const group = getGroupById(activeGroupId);

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Track granted, approved, and issued passes across groups.</p>
          <button type="button" className="gl-btn-secondary" onClick={resetDemo}>Reset demo</button>
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">{group?.name} — ledger</h2>
          <div className="gl-gen__table-wrap">
            <table className="gl-gen-table">
              <thead>
                <tr><th>Pass type</th><th>Granted</th><th>Requested</th><th>Approved</th><th>Issued</th><th>Remaining</th><th>Pending</th></tr>
              </thead>
              <tbody>
                {ledger.map((entry) => {
                  const pending = state.requests.filter((r) => r.passType === entry.passType && r.status === 'pending').length;
                  return (
                    <tr key={entry.passType}>
                      <td>{PASS_TYPE_LABELS[entry.passType]}</td>
                      <td>{entry.granted}</td>
                      <td>{entry.requested}</td>
                      <td>{entry.approved}</td>
                      <td>{entry.issued}</td>
                      <td>{entry.granted - entry.approved}</td>
                      <td>{pending > 0 ? <Pill status="pending" /> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
