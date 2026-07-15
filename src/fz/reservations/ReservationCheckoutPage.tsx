import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { useTrs } from '../../trs/TrsProvider';
import { formatFzMoney } from './reservationModel';
import {
  CartDetailPanel,
  ReservationHeader,
  ReservationMetaPanel,
} from './ReservationDetailBlocks';
import { findReservationByKey } from './reservationLookup';

/** FZ list/:reservationId/checkout — mirrors reservation-checkout inside FZ shell */
export function ReservationCheckoutPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { state, payReservation } = useTrs();

  const reservation = findReservationByKey(state.reservations, reservationId);

  if (!reservation) {
    return (
      <div className="fz-res-page">
        <PageTitle title="Reservation payment" section="Overview" sectionLink="/reservations/list" />
        <div className="main-wrapper">
          <p>Reservation not found.</p>
          <Link to="/reservations/list" className="gl-btn-secondary">Back to list</Link>
        </div>
      </div>
    );
  }

  if (reservation.status === 'paid') {
    return <Navigate to={`/reservations/list/${reservation.id}`} replace />;
  }

  if (reservation.status === 'cancelled' || reservation.status === 'expired') {
    return <Navigate to={`/reservations/list/${reservation.id}`} replace />;
  }

  const handlePay = () => {
    payReservation(reservation.locator);
    navigate(`/reservations/${reservation.id}/order`);
  };

  const tz = reservation.timezone;

  return (
    <div className="fz-res-page">
      <PageTitle
        title="Reservation payment"
        section="Overview"
        sectionLink="/reservations/list"
        subsection={reservation.locator}
      />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-res-detail-page">
          <ReservationHeader reservation={reservation} timezone={tz} />

          <div className="fz-res-detail-page__body">
            <div className="fz-res-detail-page__side">
              <section className="fz-res-detail-page__block fz-res-detail-page__block--card">
                <CartDetailPanel reservation={reservation} showRetailCompare />
              </section>
              <section className="fz-res-detail-page__block fz-res-detail-page__block--card">
                <h3 className="fz-res-detail-page__block-title">Reservation details</h3>
                <ReservationMetaPanel reservation={reservation} timezone={tz} compact />
              </section>
            </div>

            <aside className="fz-res-detail-page__payment">
              <div className="fz-res-checkout__payment-panel">
                <h3 className="fz-res-checkout__payment-title">Payment method</h3>
                <label className="fz-res-checkout__method fz-res-checkout__method--selected">
                  <input type="radio" name="payment" defaultChecked readOnly />
                  <span>Card (demo)</span>
                </label>
                <label className="fz-res-checkout__method">
                  <input type="radio" name="payment" disabled />
                  <span>Balance (not available)</span>
                </label>
                <div className="fz-res-checkout__summary">
                  <div className="fz-res-checkout__line fz-res-checkout__line--total">
                    <span>Total due</span>
                    <strong>{formatFzMoney(reservation.totalToBePaid)}</strong>
                  </div>
                </div>
                <button type="button" className="gl-btn-primary fz-res-checkout__pay-btn" onClick={handlePay}>
                  Pay {formatFzMoney(reservation.totalToBePaid)}
                </button>
                <Link to={`/reservations/list/${reservation.id}`} className="fz-res-checkout__back">
                  ← Back to reservation
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
