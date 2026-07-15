import { Fragment, useMemo, useState } from 'react';
import { FzSideDrawer } from '../../fz/components/FzSideDrawer';
import { useTrs } from '../TrsProvider';
import { TrsPageShell } from '../layout/TrsPageShell';
import {
  CAMP_STATUS_LABELS,
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  TICKET_TYPES,
  TICKET_TYPE_LABELS,
  type Camp,
  type CampInput,
  type CampStatus,
  type DepartmentId,
  type TicketTypeId,
} from '../trsTypes';

type Section = 'manage' | 'allocate' | 'overview';

const EMPTY_CAMP: CampInput = {
  name: '',
  leadEmail: '',
  department: 'placement',
  playaName: '',
  status: 'active',
};

function StatusPill({ status }: { status: CampStatus }) {
  const cls =
    status === 'active'
      ? 'trs-pill trs-pill--approved'
      : status === 'pending_review'
        ? 'trs-pill trs-pill--pending'
        : 'trs-pill trs-pill--rejected';
  return <span className={cls}>{CAMP_STATUS_LABELS[status]}</span>;
}

function RemainingCount({ value }: { value: number }) {
  return (
    <strong className={`trs-remaining ${value === 0 ? 'trs-remaining--zero' : 'trs-remaining--ok'}`}>
      {value}
    </strong>
  );
}

function campToInput(camp: Camp): CampInput {
  return {
    name: camp.name,
    leadEmail: camp.leadEmail,
    department: camp.department,
    playaName: camp.playaName ?? '',
    status: camp.status,
  };
}

function CampDrawerFields({
  draft,
  onChange,
}: {
  draft: CampInput;
  onChange: (next: CampInput) => void;
}) {
  return (
    <div className="fz-drawer-section">
      <h3 className="fz-drawer-section__title">Camp details</h3>

      <label className="fz-drawer-field">
        <span className="fz-drawer-field__label">Name <span>*</span></span>
        <p className="fz-drawer-field__hint">Official camp name as registered with the organization.</p>
        <input
          className="fz-input"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          placeholder="Camp name"
        />
      </label>

      <label className="fz-drawer-field">
        <span className="fz-drawer-field__label">Lead contact email <span>*</span></span>
        <p className="fz-drawer-field__hint">Primary contact for ticket requests and approvals.</p>
        <input
          className="fz-input"
          type="email"
          value={draft.leadEmail}
          onChange={(e) => onChange({ ...draft, leadEmail: e.target.value })}
          placeholder="lead@camp.com"
        />
      </label>

      <label className="fz-drawer-field">
        <span className="fz-drawer-field__label">Department affiliation <span>*</span></span>
        <select
          className="fz-select"
          value={draft.department}
          onChange={(e) => onChange({ ...draft, department: e.target.value as DepartmentId })}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </label>

      <label className="fz-drawer-field">
        <span className="fz-drawer-field__label">Playa name / nickname</span>
        <p className="fz-drawer-field__hint">Optional playa identity shown on distribution records.</p>
        <input
          className="fz-input"
          value={draft.playaName ?? ''}
          onChange={(e) => onChange({ ...draft, playaName: e.target.value })}
          placeholder="Optional"
        />
      </label>

      <label className="fz-drawer-field">
        <span className="fz-drawer-field__label">Status <span>*</span></span>
        <select
          className="fz-select"
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value as CampStatus })}
        >
          <option value="active">Active</option>
          <option value="pending_review">Pending review</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
    </div>
  );
}

function ManageCampsSection({ readOnly = false }: { readOnly?: boolean }) {
  const { state, createCamp, updateCamp, deactivateCamp } = useTrs();
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CampInput>(EMPTY_CAMP);

  const editingCamp = editingId ? state.camps.find((c) => c.id === editingId) : undefined;

  const openCreate = () => {
    setDraft(EMPTY_CAMP);
    setEditingId(null);
    setDrawerMode('create');
  };

  const openEdit = (camp: Camp) => {
    setDraft(campToInput(camp));
    setEditingId(camp.id);
    setDrawerMode('edit');
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingId(null);
    setDraft(EMPTY_CAMP);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.leadEmail.trim()) return;
    if (drawerMode === 'create') {
      createCamp(draft);
    } else if (drawerMode === 'edit' && editingId) {
      updateCamp(editingId, draft);
    }
    closeDrawer();
  };

  const handleDeactivate = () => {
    if (!editingId) return;
    deactivateCamp(editingId);
    closeDrawer();
  };

  const valid = Boolean(draft.name.trim() && draft.leadEmail.trim());

  return (
    <>
      <div className="trs-section-head">
        <div>
          <h3 className="trs-section-head__title">Manage camps</h3>
          <p className="trs-section-head__desc">
            {readOnly
              ? 'View camp records with contact and department info. Editing is restricted to admins.'
              : 'Create camp records with contact and department info. Ticket caps are set separately.'}
          </p>
        </div>
        {!readOnly && (
          <button type="button" className="fz-btn-primary" onClick={openCreate}>
            Add camp
          </button>
        )}
      </div>

      <div className="trs-table-wrap">
        <table className="trs-table trs-table--camps">
          <thead>
            <tr>
              <th className="trs-col-camp">Camp</th>
              <th className="trs-col-email">Lead email</th>
              <th className="trs-col-dept">Department</th>
              <th className="trs-col-playa">Playa name</th>
              <th className="trs-col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.camps.length === 0 ? (
              <tr>
                <td colSpan={5} className="trs-empty">No camps yet. Click &quot;Add camp&quot; to create one.</td>
              </tr>
            ) : (
              state.camps.map((camp) => (
                <tr
                  key={camp.id}
                  className={readOnly ? undefined : 'trs-table__clickable'}
                  onClick={readOnly ? undefined : () => openEdit(camp)}
                >
                  <td className="trs-col-camp"><strong>{camp.name}</strong></td>
                  <td className="trs-col-email">{camp.leadEmail}</td>
                  <td className="trs-col-dept">{DEPARTMENT_LABELS[camp.department]}</td>
                  <td className="trs-col-playa">{camp.playaName || '—'}</td>
                  <td className="trs-col-status"><StatusPill status={camp.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <FzSideDrawer
          open={drawerMode !== null}
          title={drawerMode === 'edit' ? `Edit camp · ${editingCamp?.name ?? ''}` : 'New camp'}
          onClose={closeDrawer}
          onSave={handleSave}
          saveLabel="Save"
          saveDisabled={!valid}
        >
          <CampDrawerFields draft={draft} onChange={setDraft} />
          {drawerMode === 'edit' && editingCamp?.status !== 'inactive' && (
            <div className="fz-drawer-section fz-drawer-section--danger">
              <h3 className="fz-drawer-section__title">Danger zone</h3>
              <p className="fz-drawer-field__hint">Deactivate this camp to stop new ticket requests. Existing allocations are preserved.</p>
              <button type="button" className="fz-btn-secondary trs-btn-danger" onClick={handleDeactivate}>
                Deactivate camp
              </button>
            </div>
          )}
        </FzSideDrawer>
      )}
    </>
  );
}

function AllocateTicketsSection({ readOnly = false }: { readOnly?: boolean }) {
  const { state, allocateTickets, setAllocationCap, getUsageForCamp } = useTrs();
  const activeCamps = state.camps.filter((c) => c.status !== 'inactive');
  const [campFilter, setCampFilter] = useState('');
  const [drawerMode, setDrawerMode] = useState<'allocate' | 'edit' | null>(null);
  const [campId, setCampId] = useState(activeCamps[0]?.id ?? '');
  const [ticketType, setTicketType] = useState<TicketTypeId>('comp');
  const [quantity, setQuantity] = useState(10);
  const [editCap, setEditCap] = useState(0);
  const [minCap, setMinCap] = useState(0);

  const allocationRows = useMemo(() => {
    const camps = campFilter
      ? activeCamps.filter((c) => c.id === campFilter)
      : activeCamps;
    return camps.flatMap((camp) => {
      const usage = getUsageForCamp(camp.id).filter((u) => u.cap > 0);
      return usage.map((u) => ({ camp, usage: u }));
    });
  }, [activeCamps, campFilter, state.camps, state.requests]);

  const openAllocate = () => {
    setCampId(activeCamps[0]?.id ?? '');
    setTicketType('comp');
    setQuantity(10);
    setDrawerMode('allocate');
  };

  const openEdit = (camp: Camp, type: TicketTypeId, cap: number, used: number, pending: number) => {
    setCampId(camp.id);
    setTicketType(type);
    setEditCap(cap);
    setMinCap(used + pending);
    setDrawerMode('edit');
  };

  const closeDrawer = () => setDrawerMode(null);

  const handleSave = () => {
    if (!campId) return;
    if (drawerMode === 'allocate') {
      if (quantity <= 0) return;
      allocateTickets(campId, ticketType, quantity);
    } else if (drawerMode === 'edit') {
      if (editCap < minCap) return;
      setAllocationCap(campId, ticketType, editCap);
    }
    closeDrawer();
  };

  const allocateValid = Boolean(campId && quantity > 0);
  const editValid = editCap >= minCap;

  const selectedCamp = activeCamps.find((c) => c.id === campId);

  return (
    <>
      <div className="trs-section-head">
        <div>
          <h3 className="trs-section-head__title">Allocate tickets</h3>
          <p className="trs-section-head__desc">
            {readOnly
              ? 'View ticket allocations per camp. Editing is restricted to admins.'
              : 'Assign ticket quantities to existing camps. Quantities are additive — each allocation builds the cap for that ticket type.'}
          </p>
        </div>
        {!readOnly && (
          <button type="button" className="fz-btn-primary" onClick={openAllocate} disabled={activeCamps.length === 0}>
            Allocate tickets
          </button>
        )}
      </div>

      <div className="trs-allocate-filter">
        <label className="fz-field trs-allocate-filter__field">
          <span className="fz-field__label">Camp</span>
          <select className="fz-select" value={campFilter} onChange={(e) => setCampFilter(e.target.value)}>
            <option value="">All camps</option>
            {activeCamps.map((camp) => (
              <option key={camp.id} value={camp.id}>{camp.name}</option>
            ))}
          </select>
        </label>
        <span className="trs-allocate-filter__count">
          {allocationRows.length} allocation{allocationRows.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="trs-table-wrap">
        <table className="trs-table trs-table--allocate">
          <thead>
            <tr>
              <th className="trs-col-camp">Camp</th>
              <th className="trs-col-type">Ticket type</th>
              <th className="trs-col-cap num">Cap</th>
              <th className="trs-col-used num">Used</th>
              <th className="trs-col-left num">Left</th>
              {!readOnly && <th className="trs-col-actions actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {allocationRows.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 5 : 6} className="trs-empty">
                  {campFilter
                    ? 'No ticket allocations for this camp.'
                    : readOnly
                      ? 'No ticket allocations yet.'
                      : 'No ticket allocations yet. Click "Allocate tickets" to add caps for a camp.'}
                </td>
              </tr>
            ) : (
              allocationRows.map(({ camp, usage }) => (
                <tr
                  key={`${camp.id}-${usage.ticketType}`}
                  className={readOnly ? undefined : 'trs-table__clickable'}
                  onClick={readOnly ? undefined : () => openEdit(camp, usage.ticketType, usage.cap, usage.approved, usage.pending)}
                >
                  <td className="trs-col-camp">{camp.name}</td>
                  <td className="trs-col-type">
                    <span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[usage.ticketType]}</span>
                  </td>
                  <td className="trs-col-cap num">{usage.cap}</td>
                  <td className="trs-col-used num">
                    {usage.approved}{usage.pending > 0 ? ` (+${usage.pending} pending)` : ''}
                  </td>
                  <td className="trs-col-left num">
                    <RemainingCount value={usage.remaining} />
                  </td>
                  {!readOnly && (
                    <td className="trs-col-actions actions">
                      <div className="trs-table__row-actions">
                        <button
                          type="button"
                          className="fz-btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(camp, usage.ticketType, usage.cap, usage.approved, usage.pending);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!readOnly && (
        <>
          <FzSideDrawer
        open={drawerMode === 'allocate'}
        title="Allocate tickets"
        onClose={closeDrawer}
        onSave={handleSave}
        saveLabel="Save"
        saveDisabled={!allocateValid}
      >
        <div className="fz-drawer-section">
          <h3 className="fz-drawer-section__title">Allocation</h3>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Camp <span>*</span></span>
            <p className="fz-drawer-field__hint">Select the camp receiving this ticket allocation.</p>
            <select className="fz-select" value={campId} onChange={(e) => setCampId(e.target.value)}>
              {activeCamps.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Ticket type <span>*</span></span>
            <p className="fz-drawer-field__hint">Pre-defined system ticket types. Quantity adds to any existing cap.</p>
            <select className="fz-select" value={ticketType} onChange={(e) => setTicketType(e.target.value as TicketTypeId)}>
              {TICKET_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Quantity to add <span>*</span></span>
            <p className="fz-drawer-field__hint">This number is added to the current cap for the selected ticket type.</p>
            <input
              className="fz-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>
        </div>
      </FzSideDrawer>

      <FzSideDrawer
        open={drawerMode === 'edit'}
        title="Edit allocation"
        onClose={closeDrawer}
        onSave={handleSave}
        saveLabel="Save"
        saveDisabled={!editValid}
      >
        <div className="fz-drawer-section">
          <h3 className="fz-drawer-section__title">Cap settings</h3>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Camp</span>
            <input className="fz-input" value={selectedCamp?.name ?? ''} readOnly />
          </label>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Ticket type</span>
            <input className="fz-input" value={TICKET_TYPE_LABELS[ticketType]} readOnly />
          </label>

          <label className="fz-drawer-field">
            <span className="fz-drawer-field__label">Cap <span>*</span></span>
            <p className="fz-drawer-field__hint">
              Minimum {minCap} — cannot go below approved + pending tickets already reserved.
            </p>
            <input
              className="fz-input"
              type="number"
              min={minCap}
              value={editCap}
              onChange={(e) => setEditCap(Number(e.target.value))}
            />
          </label>
        </div>
      </FzSideDrawer>
        </>
      )}
    </>
  );
}

function CampDetailView({ campId, onBack }: { campId: string; onBack: () => void }) {
  const { getCampById, getUsageForCamp, getCampApprovedRequests } = useTrs();
  const camp = getCampById(campId);
  if (!camp) return null;

  const usage = getUsageForCamp(campId);
  const approvedRequests = getCampApprovedRequests(campId);

  return (
    <>
      <div className="trs-section-head">
        <div>
          <button type="button" className="trs-back-link" onClick={onBack}>← Back to overview</button>
          <h3 className="trs-section-head__title">{camp.name}</h3>
        </div>
        <StatusPill status={camp.status} />
      </div>

      <div className="trs-camp-detail-meta">
        <div><span className="trs-camp-detail-meta__label">Lead email</span>{camp.leadEmail}</div>
        <div><span className="trs-camp-detail-meta__label">Department</span>{DEPARTMENT_LABELS[camp.department]}</div>
        <div><span className="trs-camp-detail-meta__label">Playa name</span>{camp.playaName || '—'}</div>
      </div>

      <h4 className="trs-subsection-title">Ticket allocations</h4>
      {usage.length === 0 ? (
        <p className="trs-empty">No ticket types allocated for this camp yet.</p>
      ) : (
        <div className="trs-table-wrap">
          <table className="trs-table">
            <thead>
              <tr>
                <th>Ticket type</th>
                <th className="num">Cap</th>
                <th className="num">Used (approved)</th>
                <th className="num">Pending</th>
                <th className="num">Left</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.ticketType}>
                  <td><span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[u.ticketType]}</span></td>
                  <td className="num">{u.cap}</td>
                  <td className="num">{u.approved}</td>
                  <td className="num">{u.pending}</td>
                  <td className="num">
                    <RemainingCount value={u.remaining} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h4 className="trs-subsection-title">Recipients (approved requests)</h4>
      {approvedRequests.length === 0 ? (
        <p className="trs-empty">No approved requests for this camp yet.</p>
      ) : (
        approvedRequests.map((req) => (
          <div key={req.id} className="trs-request-block">
            <div className="trs-request-block__head">
              <span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[req.ticketType]}</span>
              <span className="trs-request-block__meta">
                {req.people.length} people · approved {new Date(req.reviewedAt ?? req.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="trs-table-wrap">
              <table className="trs-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Playa name</th>
                    <th>Camp role</th>
                  </tr>
                </thead>
                <tbody>
                  {req.people.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.email}</td>
                      <td>{p.playaName}</td>
                      <td>{p.campRole}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  );
}

function OverviewSection({ onSelectCamp }: { onSelectCamp: (id: string) => void }) {
  const { state, getOverviewUsageForCamp } = useTrs();

  return (
    <>
      <div className="trs-section-head">
        <div>
          <h3 className="trs-section-head__title">Overview</h3>
          <p className="trs-section-head__desc">All camps with metadata and per-ticket-type cap / used / left. Click a camp for full detail.</p>
        </div>
        <span className="trs-section-head__meta">
          {state.camps.length} camp{state.camps.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="trs-table-wrap">
        <table className="trs-table trs-table--overview">
          <thead>
            <tr>
              <th>Camp</th>
              <th>Lead email</th>
              <th>Department</th>
              <th>Status</th>
              {TICKET_TYPES.map((t) => (
                <th key={t.id} colSpan={3} className="trs-table__group-head">{t.priceLabel}</th>
              ))}
            </tr>
            <tr>
              <th colSpan={4} />
              {TICKET_TYPES.map((t) => (
                <Fragment key={t.id}>
                  <th className="num trs-table__subhead">Cap</th>
                  <th className="num trs-table__subhead">Used</th>
                  <th className="num trs-table__subhead">Left</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.camps.length === 0 ? (
              <tr>
                <td colSpan={4 + TICKET_TYPES.length * 3} className="trs-empty">No camps to display.</td>
              </tr>
            ) : (
              state.camps.map((camp) => {
              const usage = getOverviewUsageForCamp(camp.id);
              const byType = Object.fromEntries(usage.map((u) => [u.ticketType, u]));
              return (
                <tr key={camp.id} className="trs-table__clickable" onClick={() => onSelectCamp(camp.id)}>
                  <td><strong>{camp.name}</strong></td>
                  <td>{camp.leadEmail}</td>
                  <td>{DEPARTMENT_LABELS[camp.department]}</td>
                  <td><StatusPill status={camp.status} /></td>
                  {TICKET_TYPES.map((t) => {
                    const u = byType[t.id];
                    const cap = u?.cap ?? 0;
                    const hasCap = cap > 0;
                    return (
                      <Fragment key={`${camp.id}-${t.id}`}>
                        <td className="num">{hasCap ? cap : '—'}</td>
                        <td className="num">
                          {hasCap ? `${u!.approved}${u!.pending > 0 ? ` (+${u!.pending})` : ''}` : '—'}
                        </td>
                        <td className="num">
                          {hasCap ? <RemainingCount value={u!.remaining} /> : '—'}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AllocationPage() {
  const { role } = useTrs();
  const isReadOnly = role === 'approver';
  const [section, setSection] = useState<Section>('manage');
  const [detailCampId, setDetailCampId] = useState<string | null>(null);

  const openDetail = (id: string) => {
    setDetailCampId(id);
    setSection('overview');
  };

  return (
    <TrsPageShell
      title="Allocation"
      description={
        isReadOnly
          ? 'View camps, ticket caps per type, and usage across all camps. Editing is restricted to admins.'
          : 'Manage camps, allocate ticket caps per type, and monitor usage across all camps.'
      }
    >
      <div className="trs-allocation-tabs">
        {(['manage', 'allocate', 'overview'] as Section[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`trs-allocation-tabs__tab${section === s && !detailCampId ? ' trs-allocation-tabs__tab--active' : ''}`}
            onClick={() => { setSection(s); setDetailCampId(null); }}
          >
            {s === 'manage' ? 'Manage camps' : s === 'allocate' ? 'Allocate tickets' : 'Overview'}
          </button>
        ))}
      </div>

      <div className="trs-allocation-section">
        {detailCampId ? (
          <CampDetailView campId={detailCampId} onBack={() => setDetailCampId(null)} />
        ) : section === 'manage' ? (
          <ManageCampsSection readOnly={isReadOnly} />
        ) : section === 'allocate' ? (
          <AllocateTicketsSection readOnly={isReadOnly} />
        ) : (
          <OverviewSection onSelectCamp={openDetail} />
        )}
      </div>
    </TrsPageShell>
  );
}
