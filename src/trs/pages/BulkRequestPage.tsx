import { useCallback, useEffect, useMemo, useState } from 'react';
import { FzStepper, type FzStepperStep } from '../../fz/components/FzStepper';
import { useTrs } from '../TrsProvider';
import {
  downloadCsvTemplate,
  getSeedPreviewRows,
  parseCsv,
  validRows,
  validateCsvRows,
  type CsvRow,
} from '../csvParser';
import { TICKET_TYPE_LABELS, TICKET_TYPES, getCampCap, type Person, type TicketTypeId } from '../trsTypes';
import { TrsPageShell } from '../layout/TrsPageShell';

const WIZARD_STEPS: FzStepperStep[] = [
  { id: 'camp', label: 'Camp' },
  { id: 'ticket-type', label: 'Ticket type' },
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review & fix' },
  { id: 'submit', label: 'Submit' },
];

function getExistingCampEmails(
  requests: { campId: string; status: string; people: Person[] }[],
  campId: string,
): Set<string> {
  const emails = new Set<string>();
  requests
    .filter((r) => r.campId === campId && (r.status === 'approved' || r.status === 'pending'))
    .forEach((r) => r.people.forEach((p) => emails.add(p.email.trim().toLowerCase())));
  return emails;
}

export function BulkRequestPage() {
  const { state, role, leadCampId, getCampById, getRemaining, submitBulkRequest } = useTrs();
  const isCampLead = role === 'requester';
  const activeCamps = state.camps.filter((c) => c.status !== 'inactive');

  const [currentStep, setCurrentStep] = useState(0);
  const [requestCampId, setRequestCampId] = useState(isCampLead ? leadCampId : '');
  const [rows, setRows] = useState<CsvRow[]>(() => getSeedPreviewRows());
  const [ticketType, setTicketType] = useState<TicketTypeId>('reduced');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCampLead) setRequestCampId(leadCampId);
  }, [isCampLead, leadCampId]);

  const existingCampEmails = useMemo(
    () => (requestCampId ? getExistingCampEmails(state.requests, requestCampId) : new Set<string>()),
    [requestCampId, state.requests],
  );

  const revalidate = useCallback(
    (input: CsvRow[]) => validateCsvRows(input, { existingEmails: existingCampEmails }),
    [existingCampEmails],
  );

  useEffect(() => {
    setRows((prev) => revalidate(prev));
  }, [revalidate]);

  const camp = requestCampId ? getCampById(requestCampId) : undefined;
  const remaining = requestCampId ? getRemaining(requestCampId, ticketType) : 0;
  const valid = useMemo(() => validRows(rows), [rows]);
  const errorCount = rows.filter((r) => r.errors.length > 0).length;
  const warningCount = rows.filter((r) => r.warnings.length > 0).length;
  const campCaps = camp ? getCampCap(camp, ticketType) : 0;
  const reserved = campCaps - remaining;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const campRequests = useMemo(
    () => (requestCampId ? state.requests.filter((r) => r.campId === requestCampId) : []),
    [requestCampId, state.requests],
  );

  const approvedPeopleCount = useMemo(
    () => campRequests.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.people.length, 0),
    [campRequests],
  );

  const contextBreadcrumb = useMemo(() => {
    const parts: string[] = [];
    if (camp?.name) parts.push(camp.name);
    if (currentStep >= 1) parts.push(TICKET_TYPE_LABELS[ticketType]);
    if (currentStep >= 2 && rows.length > 0) {
      const count = currentStep >= 3 ? valid.length : rows.length;
      parts.push(`${count} people`);
    }
    return parts.join(' · ');
  }, [camp?.name, currentStep, rows.length, ticketType, valid.length]);

  const updateRow = (index: number, field: keyof Person, value: string) => {
    setRows((prev) => revalidate(prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))));
    setSubmitted(false);
    setError(null);
  };

  const removeRow = (index: number) => {
    setRows((prev) => revalidate(prev.filter((_, i) => i !== index)));
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const parsed = revalidate(parseCsv(text));
    setRows(parsed);
    setSubmitted(false);
    setError(null);
    if (parsed.length === 0) {
      setError('CSV file is empty or has no data rows.');
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleCampChange = (campId: string) => {
    setRequestCampId(campId);
    setSubmitted(false);
    setError(null);
  };

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 0:
        return Boolean(camp && requestCampId);
      case 1:
        return Boolean(camp && requestCampId);
      case 2:
        return rows.length > 0;
      case 3:
        return errorCount === 0 && valid.length > 0 && valid.length <= remaining;
      case 4:
        return valid.length > 0 && valid.length <= remaining && errorCount === 0 && Boolean(camp);
      default:
        return false;
    }
  }, [camp, currentStep, errorCount, remaining, requestCampId, rows.length, valid.length]);

  const handleCancel = () => {
    setCurrentStep(0);
    setRows(revalidate(getSeedPreviewRows()));
    setTicketType('reduced');
    setSubmitted(false);
    setError(null);
    if (!isCampLead) setRequestCampId('');
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setError(null);
    setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = () => {
    const validated = revalidate(rows);
    setRows(validated);
    const okRows = validRows(validated);

    if (okRows.length === 0) {
      setError('Fix all validation errors before submitting.');
      return;
    }
    if (validated.filter((r) => r.errors.length > 0).length > 0) {
      setError(`${validated.filter((r) => r.errors.length > 0).length} row(s) still have errors. Fix or remove them before submitting.`);
      return;
    }
    if (okRows.length > remaining) {
      setError(
        `Cannot submit ${okRows.length} people — only ${remaining} ${TICKET_TYPE_LABELS[ticketType]} ticket(s) remaining for ${camp?.name}.`,
      );
      return;
    }

    const people: Person[] = okRows.map((r) => ({
      name: r.name,
      email: r.email,
      playaName: r.playaName,
      campRole: r.campRole,
    }));

    const ok = submitBulkRequest(requestCampId, ticketType, people);
    if (ok) {
      setSubmitted(true);
      setError(null);
      setRows(revalidate(getSeedPreviewRows()));
      setCurrentStep(0);
    } else {
      setError('Could not submit — allocation cap exceeded.');
    }
  };

  const renderValidationCell = (row: CsvRow) => {
    if (row.errors.length === 0 && row.warnings.length === 0) {
      return <span className="trs-pill trs-pill--approved">OK</span>;
    }
    return (
      <>
        {row.errors.length > 0 && (
          <ul className="trs-bulk-errors">
            {row.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        {row.warnings.length > 0 && (
          <ul className="trs-bulk-warnings">
            {row.warnings.map((warn) => (
              <li key={warn}>{warn}</li>
            ))}
          </ul>
        )}
      </>
    );
  };

  const rowClassName = (row: CsvRow) => {
    if (row.errors.length > 0) return 'trs-row-error';
    if (row.warnings.length > 0) return 'trs-row-warning';
    return 'trs-row-ok';
  };

  const stepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <h3 className="fz-stepper-panel__title">{isCampLead ? 'Your camp' : 'Choose camp'}</h3>
            <p className="fz-stepper-panel__desc">
              {isCampLead
                ? 'This request will be submitted on behalf of your camp.'
                : 'Select which camp this bulk request is for. It will appear on Approvals and Distribution under that camp.'}
            </p>
            {isCampLead ? (
              <p className="trs-bulk-step__camp-name">{camp?.name ?? '—'}</p>
            ) : (
              <label className="fz-field trs-bulk-step__field">
                <span className="fz-field__label">Camp</span>
                <select
                  className="fz-select"
                  value={requestCampId}
                  onChange={(e) => handleCampChange(e.target.value)}
                >
                  <option value="">Select a camp</option>
                  {activeCamps.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            )}
          </>
        );
      case 1:
        return (
          <>
            <h3 className="fz-stepper-panel__title">Choose ticket type</h3>
            <p className="fz-stepper-panel__desc">
              The whole request is scoped to one ticket type. Pick it before uploading your CSV.
            </p>
            <label className="fz-field trs-bulk-step__field">
              <span className="fz-field__label">Ticket type</span>
              <select
                className="fz-select"
                value={ticketType}
                onChange={(e) => {
                  setTicketType(e.target.value as TicketTypeId);
                  setError(null);
                }}
              >
                {TICKET_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({getRemaining(requestCampId, t.id)} remaining)
                  </option>
                ))}
              </select>
            </label>
            <div className="trs-bulk-allocation-card">
              <div className="trs-bulk-allocation-card__header">
                <span>{camp?.name ?? 'Camp'}&apos;s allocation — {TICKET_TYPE_LABELS[ticketType]}</span>
              </div>
              <div className="trs-bulk-allocation-stats">
                <div><span>Cap</span><strong>{campCaps}</strong></div>
                <div><span>Reserved</span><strong>{reserved}</strong></div>
                <div className="trs-bulk-allocation-stats__highlight">
                  <span>Remaining</span><strong>{remaining}</strong>
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="fz-stepper-panel__title">Upload CSV</h3>
            <p className="fz-stepper-panel__desc">Columns: name, email, playaName, campRole</p>
            <div className="trs-bulk-step__toolbar">
              <div className="trs-inline-actions">
                <button type="button" className="fz-btn-secondary" onClick={downloadCsvTemplate}>
                  Download CSV template
                </button>
                <label className="fz-btn-primary trs-file-upload-label">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="trs-file-input-hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="trs-bulk-step__head">
              <div>
                <h3 className="fz-stepper-panel__title">Review &amp; fix</h3>
                <p className="fz-stepper-panel__desc fz-stepper-panel__desc--tight">
                  Edit rows inline and resolve validation errors before submitting.
                  {warningCount > 0 && ` ${warningCount} row(s) match existing camp requests.`}
                </p>
              </div>
              <span className="trs-bulk-step__meta">
                {valid.length} valid · {errorCount} with errors · submitting{' '}
                <strong>{valid.length}</strong> of <strong>{remaining}</strong> remaining
              </span>
            </div>
            <div className="trs-table-wrap trs-bulk-step__table">
              {rows.length === 0 ? (
                <p className="trs-empty-block">No rows to review. Go back and upload a CSV.</p>
              ) : (
              <table className="trs-table trs-bulk-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Playa name</th>
                    <th>Camp role</th>
                    <th>Validation</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={`${row.rowIndex}-${i}`} className={rowClassName(row)}>
                      <td>{row.rowIndex}</td>
                      <td>
                        <input
                          className="fz-input trs-bulk-input"
                          value={row.name}
                          onChange={(e) => updateRow(i, 'name', e.target.value)}
                          aria-invalid={row.errors.some((e) => e.includes('name'))}
                        />
                      </td>
                      <td>
                        <input
                          className="fz-input trs-bulk-input"
                          value={row.email}
                          onChange={(e) => updateRow(i, 'email', e.target.value)}
                          aria-invalid={row.errors.some((e) => e.includes('email') || e.includes('Duplicate'))}
                        />
                      </td>
                      <td>
                        <input
                          className="fz-input trs-bulk-input"
                          value={row.playaName}
                          onChange={(e) => updateRow(i, 'playaName', e.target.value)}
                          aria-invalid={row.errors.some((e) => e.includes('playa'))}
                        />
                      </td>
                      <td>
                        <input
                          className="fz-input trs-bulk-input"
                          value={row.campRole}
                          onChange={(e) => updateRow(i, 'campRole', e.target.value)}
                          aria-invalid={row.errors.some((e) => e.includes('role'))}
                        />
                      </td>
                      <td>{renderValidationCell(row)}</td>
                      <td>
                        <button type="button" className="trs-row-remove" onClick={() => removeRow(i)} aria-label="Remove row">
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="fz-stepper-panel__title">Submit request</h3>
            <p className="fz-stepper-panel__desc">Review the summary below, then confirm to create a pending request.</p>
            <div className="trs-bulk-submit-summary">
              <dl className="trs-bulk-submit-summary__grid">
                <div>
                  <dt>Camp</dt>
                  <dd>{camp?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Ticket type</dt>
                  <dd>{TICKET_TYPE_LABELS[ticketType]}</dd>
                </div>
                <div>
                  <dt>People</dt>
                  <dd>{valid.length} valid row{valid.length === 1 ? '' : 's'}</dd>
                </div>
                <div>
                  <dt>Allocation left</dt>
                  <dd>{Math.max(0, remaining - valid.length)} after submit</dd>
                </div>
              </dl>
              <p className="trs-bulk-submit-summary__note">
                Submitting creates a <strong>pending</strong> request for approver review.
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <TrsPageShell
      title="Bulk request"
      description="Choose camp and ticket type, upload a CSV, fix errors, and submit."
    >
      <div className="trs-bulk-wizard">
        <FzStepper
          steps={WIZARD_STEPS}
          currentIndex={currentStep}
          onStepClick={(index) => index <= currentStep && setCurrentStep(index)}
        />

        <div className="fz-stepper-panel">
          {contextBreadcrumb && currentStep > 0 && (
            <p className="trs-bulk-context" aria-label="Request context">
              {contextBreadcrumb}
            </p>
          )}

          {submitted && (
            <div className="trs-toast trs-toast--ok trs-toast--spaced">
              Request submitted with status <strong>pending</strong> — awaiting admin approval.
            </div>
          )}
          {error && <div className="trs-toast trs-toast--error trs-toast--spaced">{error}</div>}

          {stepContent()}

          <div className="fz-stepper-footer">
            <button type="button" className="fz-btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            {currentStep > 0 && (
              <button type="button" className="fz-btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            <button
              type="button"
              className="fz-btn-primary"
              disabled={!canAdvance}
              onClick={handleNext}
            >
              {isLastStep ? `Confirm & submit (${valid.length} people)` : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {currentStep === 0 && camp && requestCampId && (
        <section className="trs-page-section trs-page-section--divider trs-bulk-requests-card">
          <p className="trs-bulk-requests-card__summary">
            {camp.name} · {campRequests.length} existing request{campRequests.length === 1 ? '' : 's'} ·{' '}
            {approvedPeopleCount} people approved
          </p>
          {campRequests.length > 0 ? (
            <div className="trs-table-wrap">
              <table className="trs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="num">People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campRequests.map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td><span className="trs-pill trs-pill--type">{TICKET_TYPE_LABELS[r.ticketType]}</span></td>
                      <td className="num">{r.people.length}</td>
                      <td><span className={`trs-pill trs-pill--${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="trs-empty-block">No existing requests for this camp yet.</p>
          )}
        </section>
      )}
    </TrsPageShell>
  );
}
