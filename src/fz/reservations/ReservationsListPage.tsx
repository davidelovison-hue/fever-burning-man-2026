import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FzContextBar } from '../components/FzContextBar';
import { useTrs } from '../../trs/TrsProvider';
import type { FzReservation } from './reservationModel';
import { CancelReservationModal } from './CancelReservationModal';
import { PaymentUrlModal } from './PaymentUrlModal';
import { ReservationCard } from './ReservationCard';
import { ReservationsTable } from './ReservationsTable';
import { useIsMobile } from './useIsMobile';
import { BMP_BUSINESS_TYPE_LABELS } from '../../trs/trsTypes';

function filterReservations(
  rows: FzReservation[],
  searchTerm: string,
  statusFilter: string,
  businessTypeFilter: string,
  requestIdFilter: string,
): FzReservation[] {
  let filtered = rows;
  if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);
  if (businessTypeFilter) filtered = filtered.filter((r) => r.businessType === businessTypeFilter);
  if (requestIdFilter) filtered = filtered.filter((r) => r.requestId === requestIdFilter);
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.locator.toLowerCase().includes(q) ||
        r.ownerFullName.toLowerCase().includes(q) ||
        r.ownerEmail.toLowerCase().includes(q) ||
        r.planName.toLowerCase().includes(q) ||
        r.businessName.toLowerCase().includes(q),
    );
  }
  return filtered;
}

/** FZ Reservations → Overview (production-style list) */
export function ReservationsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestIdFromUrl = searchParams.get('requestId') ?? '';
  const isMobile = useIsMobile();
  const { state, cancelReservation, resetDemo, role } = useTrs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(requestIdFromUrl ? '' : 'to_be_paid');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [paymentModal, setPaymentModal] = useState<FzReservation | null>(null);
  const [cancelModal, setCancelModal] = useState<FzReservation | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (requestIdFromUrl) setStatusFilter('');
  }, [requestIdFromUrl]);

  const reservations = state.reservations;
  const visible = useMemo(
    () => filterReservations(reservations, searchTerm, statusFilter, businessTypeFilter, requestIdFromUrl),
    [reservations, searchTerm, statusFilter, businessTypeFilter, requestIdFromUrl],
  );

  const viewDetails = (r: FzReservation) => navigate(`/reservations/list/${r.id}`);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onPaymentLinkSent = () => {
    if (paymentModal) {
      showToast(`Payment link sent to ${paymentModal.ownerEmail} (m_b2b_pay_reservation)`);
    }
  };

  return (
    <div className="fz-res-page">
      <FzContextBar sectionLabel="Reservations" />

      {role === 'requester' && (
        <p className="fz-res-role-hint" role="status">
          Switch <strong>View as</strong> to Admin or Approver in the header to access reservations.
        </p>
      )}

      <div className="main-wrapper">
        <div className={`wrapper-card wrapper-card--elevation-100 ${isMobile ? 'wrapper-card--mobile' : ''}`}>
          <div className="fz-res-page-toolbar">
            <h1 className="fz-res-page-toolbar__title">Reservations overview</h1>
            {!isMobile && (
              <div className="fz-res-page-toolbar__actions">
                <button type="button" className="fz-btn-outline">
                  Download <span aria-hidden>▾</span>
                </button>
                <button
                  type="button"
                  className="fz-btn-primary"
                  disabled
                  title="Paid ticket approvals create reservations automatically"
                >
                  Make a reservation
                </button>
              </div>
            )}
          </div>

          <div className="fz-res-prod-filters">
            <label className="fz-field fz-res-prod-filters__field">
              <span className="fz-field__label">Date</span>
              <select className="fz-select" defaultValue="all">
                <option value="all">All dates</option>
              </select>
            </label>
            <label className="fz-field fz-res-prod-filters__field">
              <span className="fz-field__label">Reservations type</span>
              <select className="fz-select" defaultValue="business">
                <option value="business">Business</option>
              </select>
            </label>
            <div className="fz-res-prod-filters__search">
              <span className="fz-res-filters__search-icon" aria-hidden>🔍</span>
              <input
                type="search"
                placeholder="Search by reservation ID, recipient or bu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="reservations-filters-search-term"
              />
            </div>
            <label className="fz-field fz-res-prod-filters__field">
              <span className="fz-field__label">Status</span>
              <select className="fz-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="to_be_paid">To be paid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label className="fz-field fz-res-prod-filters__field">
              <span className="fz-field__label">Business type</span>
              <select
                className="fz-select"
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
              >
                <option value="">Business type</option>
                {Object.entries(BMP_BUSINESS_TYPE_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {requestIdFromUrl && (
            <p className="fz-res-trs-banner">
              Showing reservations from TRS request <code>{requestIdFromUrl}</code>.{' '}
              <Link to="/reservations/list">Clear filter</Link>
            </p>
          )}

          <p className="fz-res-results-count" data-testid="reservations-list-results-count">
            <strong>{visible.length}</strong> reservation{visible.length === 1 ? '' : 's'} with the filters applied
          </p>

          {reservations.length === 0 ? (
            <div className="fz-res-list__no-results" data-testid="reservations-list-no-results">
              <div className="icon-empty">🧾</div>
              <div>No reservations found</div>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                Load the demo dataset or approve a paid ticket request (<strong>Reduced</strong> or{' '}
                <strong>Early Access</strong>) in Ticket requests.
              </p>
              <button
                type="button"
                className="fz-btn-primary"
                style={{ marginTop: '1rem' }}
                onClick={() => resetDemo()}
              >
                Load mock data
              </button>
              <Link to="/approvals" className="fz-btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>
                Go to Approvals
              </Link>
            </div>
          ) : visible.length === 0 ? (
            <div className="fz-res-list__no-results" data-testid="reservations-list-no-results">
              <div className="icon-empty">🧾</div>
              <div>No reservations match your filters</div>
            </div>
          ) : !isMobile ? (
            <ReservationsTable
              reservations={visible}
              onRowClick={viewDetails}
              onSendPaymentLink={setPaymentModal}
              onCancel={setCancelModal}
            />
          ) : null}
        </div>

        {isMobile && visible.length > 0 && (
          <div className="fz-res-cards" data-testid="reservations-list-cards">
            {visible.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onViewDetails={viewDetails}
                onSendPaymentLink={setPaymentModal}
                onCancel={setCancelModal}
              />
            ))}
          </div>
        )}
      </div>

      {toast && <div className="fz-res-toast">{toast}</div>}

      {paymentModal && (
        <PaymentUrlModal
          reservation={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSend={onPaymentLinkSent}
        />
      )}

      {cancelModal && (
        <CancelReservationModal
          reservation={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={() => cancelReservation(cancelModal.locator)}
        />
      )}
    </div>
  );
}
