import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrs } from '../TrsProvider';
import { TICKET_TYPE_LABELS } from '../trsTypes';
import { TrsPageShell } from '../layout/TrsPageShell';

function AuditCell({ actor, at }: { actor?: string; at?: string }) {
  if (!actor && !at) return <>—</>;
  return (
    <div className="trs-audit-cell">
      <span className="trs-audit-cell__actor">{actor ?? '—'}</span>
      {at ? <span className="trs-audit-cell__time">{new Date(at).toLocaleString()}</span> : null}
    </div>
  );
}

export function ApprovalsPage() {
  const { state, getCampById, getRemaining, getApprovalEligibility, approve, reject } = useTrs();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [inlineErrors, setInlineErrors] = useState<Record<string, string>>({});
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [reservationLink, setReservationLink] = useState<string | null>(null);

  const pending = state.requests.filter((r) => r.status === 'pending');
  const history = useMemo(
    () =>
      state.requests
        .filter((r) => r.status !== 'pending')
        .sort((a, b) => {
          const aTime = new Date(a.reviewedAt ?? a.createdAt).getTime();
          const bTime = new Date(b.reviewedAt ?? b.createdAt).getTime();
          return bTime - aTime;
        }),
    [state.requests],
  );

  const rejectTarget = rejectTargetId
    ? state.requests.find((r) => r.id === rejectTargetId)
    : undefined;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const clearInlineError = (requestId: string) => {
    setInlineErrors((prev) => {
      if (!prev[requestId]) return prev;
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
  };

  const openRejectModal = (requestId: string) => {
    setRejectTargetId(requestId);
    setRejectNote('');
  };

  const closeRejectModal = () => {
    setRejectTargetId(null);
    setRejectNote('');
  };

  const confirmReject = () => {
    if (!rejectTargetId) return;
    reject(rejectTargetId, rejectNote.trim() || undefined);
    setExpandedId(null);
    clearInlineError(rejectTargetId);
    closeRejectModal();
    showToast('Request rejected — allocation unchanged.');
  };

  return (
    <TrsPageShell
      title="Approvals"
      description="Review pending bulk requests. Approving moves tickets from pending to approved and updates camp allocation immediately."
    >
      <div className="trs-approvals-layout">
        {toast && <div className="trs-toast trs-toast--ok trs-approvals-toast">{toast}</div>}
        {reservationLink && (
          <p className="trs-approve-reservation-banner">
            Reservations created.{' '}
            <Link to={reservationLink}>View in Reservations →</Link>
          </p>
        )}

        <section className="trs-approvals-section">
          <header className="trs-approvals-section__head">
            <div>
              <h3 className="trs-approvals-section__title">Pending</h3>
              <p className="trs-approvals-section__desc">Requests awaiting your decision</p>
            </div>
            <span className="trs-approvals-section__count">{pending.length}</span>
          </header>

          {pending.length === 0 ? (
            <p className="trs-approvals-empty">No pending requests.</p>
          ) : (
            <div className="trs-table-wrap">
              <table className="trs-table">
                <thead>
                  <tr>
                    <th>Camp</th>
                    <th>Ticket type</th>
                    <th className="num">People</th>
                    <th>Submitted by</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pending.map((req) => {
                    const camp = getCampById(req.campId);
                    const expanded = expandedId === req.id;
                    const remaining = getRemaining(req.campId, req.ticketType);
                    const eligibility = getApprovalEligibility(req.id);
                    const inlineError = inlineErrors[req.id];

                    return (
                      <Fragment key={req.id}>
                        <tr>
                          <td><strong>{camp?.name ?? req.campId}</strong></td>
                          <td><span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[req.ticketType]}</span></td>
                          <td className="num">{req.people.length}</td>
                          <td><AuditCell actor={req.submittedBy} at={req.createdAt} /></td>
                          <td>
                            <button
                              type="button"
                              className="trs-expand-btn"
                              onClick={() => {
                                setExpandedId(expanded ? null : req.id);
                                clearInlineError(req.id);
                              }}
                            >
                              {expanded ? 'Hide' : 'View'} people
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${req.id}-detail`}>
                            <td colSpan={5} className="trs-detail-panel">
                              <p className="trs-approve-allocation-hint">
                                {camp?.name} · {TICKET_TYPE_LABELS[req.ticketType]} ·{' '}
                                <strong>{remaining}</strong> remaining after pending reservations
                              </p>
                              <div className="trs-table-wrap trs-detail-nested-table">
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
                                        <td>{p.name}</td>
                                        <td>{p.email}</td>
                                        <td>{p.playaName}</td>
                                        <td>{p.campRole}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {inlineError && (
                                <p className="trs-approve-error" role="alert">{inlineError}</p>
                              )}
                              {!eligibility.ok && !inlineError && (
                                <p className="trs-approve-error trs-approve-error--muted">{eligibility.message}</p>
                              )}
                              <div className="trs-inline-actions trs-inline-actions--flush">
                                <button
                                  type="button"
                                  className="fz-btn-primary"
                                  onClick={() => {
                                    const result = approve(req.id);
                                    if (result.ok) {
                                      setExpandedId(null);
                                      clearInlineError(req.id);
                                      if (result.reservationCount > 0) {
                                        const link = `/reservations/list?requestId=${result.requestId}`;
                                        setReservationLink(link);
                                        showToast(
                                          `Approved ${req.people.length} ${TICKET_TYPE_LABELS[req.ticketType]} for ${camp?.name}. 1 reservation (${result.ticketCount} tickets) created.`,
                                        );
                                      } else {
                                        setReservationLink(null);
                                        showToast(`Approved ${req.people.length} ${TICKET_TYPE_LABELS[req.ticketType]} for ${camp?.name}`);
                                      }
                                    } else {
                                      setInlineErrors((prev) => ({
                                        ...prev,
                                        [req.id]: result.error ?? 'Cannot approve this request.',
                                      }));
                                    }
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="fz-btn-secondary trs-btn-danger"
                                  onClick={() => openRejectModal(req.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="trs-approvals-section">
          <header className="trs-approvals-section__head">
            <div>
              <h3 className="trs-approvals-section__title">History</h3>
              <p className="trs-approvals-section__desc">Approved and rejected requests</p>
            </div>
            <span className="trs-approvals-section__count">{history.length}</span>
          </header>

          {history.length === 0 ? (
            <p className="trs-approvals-empty">No reviewed requests yet.</p>
          ) : (
            <div className="trs-table-wrap">
              <table className="trs-table">
                <thead>
                  <tr>
                    <th>Camp</th>
                    <th>Type</th>
                    <th className="num">People</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Submitted by</th>
                    <th>Reviewed by</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{getCampById(r.campId)?.name}</td>
                      <td><span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[r.ticketType]}</span></td>
                      <td className="num">{r.people.length}</td>
                      <td><span className={`trs-pill trs-pill--${r.status}`}>{r.status}</span></td>
                      <td className="trs-notes-cell">
                        {r.reviewNote ?? '—'}
                        {r.status === 'approved' && (r.reservationIds?.length ?? 0) > 0 && (
                          <>
                            {' '}
                            <Link to={`/reservations/list?requestId=${r.id}`}>
                              View reservation ({r.people.length} tickets)
                            </Link>
                          </>
                        )}
                      </td>
                      <td><AuditCell actor={r.submittedBy} at={r.createdAt} /></td>
                      <td><AuditCell actor={r.reviewedBy} at={r.reviewedAt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {rejectTargetId && (
        <div className="trs-modal-root" role="presentation">
          <button
            type="button"
            className="trs-modal-backdrop"
            aria-label="Close reject dialog"
            onClick={closeRejectModal}
          />
          <div className="trs-modal" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
            <h3 id="reject-modal-title" className="trs-modal__title">Reject request</h3>
            <p className="trs-modal__desc">
              {rejectTarget
                ? `${getCampById(rejectTarget.campId)?.name ?? rejectTarget.campId} · ${TICKET_TYPE_LABELS[rejectTarget.ticketType]} · ${rejectTarget.people.length} people`
                : 'This request will be marked rejected. Allocation is unchanged.'}
            </p>
            <label className="fz-field trs-modal__field">
              <span className="fz-field__label">Reason (optional)</span>
              <textarea
                className="fz-textarea trs-modal__textarea"
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="e.g. Cap exceeded for this ticket type"
              />
            </label>
            <div className="trs-modal__actions">
              <button type="button" className="fz-btn-secondary" onClick={closeRejectModal}>
                Cancel
              </button>
              <button type="button" className="fz-btn-primary trs-btn-danger-solid" onClick={confirmReject}>
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </TrsPageShell>
  );
}
