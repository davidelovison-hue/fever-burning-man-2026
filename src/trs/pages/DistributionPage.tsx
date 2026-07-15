import { useMemo, useState } from 'react';
import { useTrs } from '../TrsProvider';
import { TICKET_TYPE_LABELS, TICKET_TYPES, type TicketTypeId } from '../trsTypes';
import { TrsPageShell } from '../layout/TrsPageShell';
import {
  buildCsv,
  campSlugFromName,
  distributionExportFilename,
  downloadCsv,
} from '../exportCsv';
import type { DistributionRow } from '../trsStore';

function formatApprovedDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function distributionRowsToCsv(rows: DistributionRow[]): string {
  const headers = [
    'Person name',
    'Email',
    'Playa name',
    'Camp role',
    'Camp',
    'Ticket type',
    'Request status',
    'Approved date',
    'Reviewed by',
  ];

  const data = rows.map((row) => [
    row.person.name,
    row.person.email,
    row.person.playaName,
    row.person.campRole,
    row.campName,
    TICKET_TYPE_LABELS[row.ticketType],
    row.requestStatus,
    formatApprovedDate(row.approvedAt),
    row.reviewedBy ?? '',
  ]);

  return buildCsv(headers, data);
}

export function DistributionPage() {
  const { state, role, leadCampId, getDistributionRows } = useTrs();
  const isCampLead = role === 'requester';
  const leadCamp = state.camps.find((c) => c.id === leadCampId);
  const [campFilter, setCampFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<TicketTypeId | ''>('');

  const rows = useMemo(() => {
    let list = getDistributionRows();
    if (isCampLead) {
      list = list.filter((r) => r.campId === leadCampId);
    } else if (campFilter) {
      list = list.filter((r) => r.campId === campFilter);
    }
    if (typeFilter) list = list.filter((r) => r.ticketType === typeFilter);
    return list;
  }, [getDistributionRows, campFilter, typeFilter, isCampLead, leadCampId]);

  const filteredCamp = isCampLead
    ? leadCamp
    : campFilter
      ? state.camps.find((c) => c.id === campFilter)
      : undefined;

  const handleExport = () => {
    if (rows.length === 0) return;
    const filename = distributionExportFilename(
      filteredCamp ? campSlugFromName(filteredCamp.name) : undefined,
    );
    downloadCsv(filename, distributionRowsToCsv(rows));
  };

  return (
    <TrsPageShell
      title="Distribution"
      description={
        isCampLead
          ? `Approved tickets for ${leadCamp?.name ?? 'your camp'}. Filter by ticket type or export your crew list.`
          : 'Ledger of approved tickets — who received what. Filter by camp or ticket type.'
      }
      flushContent
    >
      <div className="trs-allocation-section">
        <div className="trs-filter-bar">
          <div className="trs-filter-bar__fields">
            {isCampLead ? (
              <label className="fz-field trs-filter-bar__field">
                <span className="fz-field__label">Camp</span>
                <input className="fz-input" value={leadCamp?.name ?? 'Your camp'} readOnly />
              </label>
            ) : (
              <label className="fz-field trs-filter-bar__field">
                <span className="fz-field__label">Camp</span>
                <select className="fz-select" value={campFilter} onChange={(e) => setCampFilter(e.target.value)}>
                  <option value="">All camps</option>
                  {state.camps.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="fz-field trs-filter-bar__field">
              <span className="fz-field__label">Ticket type</span>
              <select className="fz-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TicketTypeId | '')}>
                <option value="">All types</option>
                {TICKET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="trs-filter-bar__actions">
            <span className="trs-filter-bar__count">
              <strong>{rows.length}</strong> distribution{rows.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              className="fz-btn-secondary"
              disabled={rows.length === 0}
              onClick={handleExport}
            >
              Export CSV
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="trs-empty-block">No approved distributions yet. Approve a request to populate this ledger.</p>
        ) : (
          <div className="trs-table-wrap">
            <table className="trs-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Playa name</th>
                  <th>Email</th>
                  <th>Camp role</th>
                  <th>Camp</th>
                  <th>Ticket type</th>
                  <th>Approved</th>
                  <th>Reviewed by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={`${row.requestId}-${row.person.email}-${i}`}>
                    <td><strong>{row.person.name}</strong></td>
                    <td>{row.person.playaName}</td>
                    <td>{row.person.email}</td>
                    <td>{row.person.campRole}</td>
                    <td>{row.campName}</td>
                    <td><span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[row.ticketType]}</span></td>
                    <td>{new Date(row.approvedAt).toLocaleDateString()}</td>
                    <td>{row.reviewedBy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TrsPageShell>
  );
}
