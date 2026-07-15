import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { FzContextBar } from '../components/FzContextBar';
import { useTrs } from '../../trs/TrsProvider';
import { CancelReservationModal } from './CancelReservationModal';
import { PaymentUrlModal } from './PaymentUrlModal';
import {
  ExternalReservationIdBar,
  NotesPanel,
  PaymentRequiredAside,
  PromoCodePanel,
  PurchaseDetailsPanel,
  ReservationBreadcrumb,
  ReservationDetailHero,
} from './ReservationDetailBlocks';
import { findReservationByKey } from './reservationLookup';

/** FZ list/:reservationId — production reservation details (unpaid) */
export function ReservationDetailPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { state, cancelReservation } = useTrs();
  const [paymentModal, setPaymentModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [externalId, setExternalId] = useState('');

  const reservation = findReservationByKey(state.reservations, reservationId);

  if (!reservation) {
    return (
      <div className="fz-res-page">
        <FzContextBar sectionLabel="Reservations" />
        <div className="main-wrapper">
          <div className="fz-res-list__no-results">
            <div className="icon-empty">🧾</div>
            <div>Reservation not found</div>
            <Link to="/reservations/list" className="fz-btn-secondary fz-res-inline-cta">Back to list</Link>
          </div>
        </div>
      </div>
    );
  }

  const tz = reservation.timezone;
  const detailPath = `/reservations/list/${reservation.id}`;
  const modifyPath = `${detailPath}/modify`;

  return (
    <div className="fz-res-page">
      <FzContextBar sectionLabel="Reservations" />

      <div className="main-wrapper fz-res-detail-prod-wrap">
        <ReservationBreadcrumb reservationId={reservation.id} locator={reservation.locator} />

        <ExternalReservationIdBar
          value={externalId || reservation.externalLocatorId || ''}
          onChange={setExternalId}
        />

        <div className="wrapper-card wrapper-card--elevation-100 fz-res-detail-prod">
          <ReservationDetailHero
            reservation={reservation}
            timezone={tz}
            onModify={reservation.status === 'to_be_paid' ? () => navigate(modifyPath) : undefined}
            onCancel={reservation.status === 'to_be_paid' ? () => setCancelModal(true) : undefined}
          />

          <div className="fz-res-detail-prod__body">
            <div className="fz-res-detail-prod__left">
              <NotesPanel reservation={reservation} />
              <PurchaseDetailsPanel reservation={reservation} timezone={tz} />
              <PromoCodePanel />
            </div>
            <PaymentRequiredAside
              reservation={reservation}
              onPay={() => setPaymentModal(true)}
              onSendLink={() => setPaymentModal(true)}
            />
          </div>
        </div>
      </div>

      {paymentModal && (
        <PaymentUrlModal
          reservation={reservation}
          onClose={() => setPaymentModal(false)}
          onSend={() => setPaymentModal(false)}
        />
      )}

      {cancelModal && (
        <CancelReservationModal
          reservation={reservation}
          onClose={() => setCancelModal(false)}
          onConfirm={() => {
            cancelReservation(reservation.locator);
            navigate('/reservations/list');
          }}
        />
      )}
    </div>
  );
}
