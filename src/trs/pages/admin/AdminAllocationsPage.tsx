import { useState } from 'react';
import { useTrs } from '../../TrsProvider';
import { PASS_TYPE_LABELS, type PassType } from '../../trsTypes';

export function AdminAllocationsPage() {
  const { state, getLedger, setAllocationCap, getGroupById, activeGroupId } = useTrs();
  const group = getGroupById(activeGroupId);
  const ledger = getLedger();
  const [draft, setDraft] = useState<Record<PassType, number>>({
    sap: state.allocations.find((a) => a.passType === 'sap')?.cap ?? 0,
    reduced_ticket: state.allocations.find((a) => a.passType === 'reduced_ticket')?.cap ?? 0,
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="gl-page">
      <div className="gl-page-head">
        <div className="gl-toolbar">
          <p className="gl-toolbar__hint">Step 1 — Grant how many SAPs and reduced tickets this group can request.</p>
          {saved && <p className="gl-toast" role="status">Caps saved</p>}
        </div>
      </div>
      <div className="gl-layout">
        <section className="gl-editor">
          <h2 className="gl-editor__title">Allocation caps — {group?.name}</h2>
          {(['sap', 'reduced_ticket'] as PassType[]).map((passType) => {
            const entry = ledger.find((l) => l.passType === passType);
            const alloc = state.allocations.find((a) => a.passType === passType);
            return (
              <div key={passType} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #eef1f3' }}>
                <h3 style={{ font: '600 0.875rem Montserrat', margin: '0 0 0.5rem' }}>{PASS_TYPE_LABELS[passType]}</h3>
                <div className="gl-details-grid">
                  <label className="gl-field">
                    <span className="gl-field__label">Cap quantity</span>
                    <input type="number" className="gl-input" value={draft[passType]} onChange={(e) => setDraft({ ...draft, [passType]: Number(e.target.value) })} />
                  </label>
                  <label className="gl-field">
                    <span className="gl-field__label">Valid from</span>
                    <input type="date" className="gl-input" value={alloc?.validFrom} readOnly />
                  </label>
                  <label className="gl-field">
                    <span className="gl-field__label">Department</span>
                    <input type="text" className="gl-input" value={alloc?.department} readOnly />
                  </label>
                </div>
                <p className="gl-note">Currently approved: {entry?.approved ?? 0} of {entry?.granted ?? 0}</p>
                <button type="button" className="gl-btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => { setAllocationCap(passType, draft[passType]); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
                  Save cap
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
