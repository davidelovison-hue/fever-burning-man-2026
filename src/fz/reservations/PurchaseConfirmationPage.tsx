import { Link, useParams } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { useTrs } from '../../trs/TrsProvider';
import { formatFzDateTime, formatFzMoney } from './reservationModel';
import {
  CartDetailPanel,
  ReservationHeader,
  ReservationMetaPanel,
} from './ReservationDetailBlocks';
import { findReservationByKey } from './reservationLookup';

/** FZ :reservationId/order — purchase confirmation */
export function PurchaseConfirmationPage() {
  const { reservationId } = useParams();
  const { state } = useTrs();
  const reservation = findReservationByKey(state.reservations, reservationId);

  if (!reservation || reservation.status !== 'paid') {
    return (
      <div className="fz-res-page">
        <PageTitle title="Order confirmation" section="Overview" sectionLink="/reservations/list" />
        <div className="main-wrapper">
          <p>Order not found or payment pending.</p>
          {reservation && (
            <Link to={`/reservations/list/${reservation.id}/checkout`} className="gl-btn-primary">
              Complete payment
            </Link>
          )}
        </div>
      </div>
    );
  }

  const tz = reservation.timezone;

  return (
    <div className="fz-res-page">
      <PageTitle
        title="Order confirmation"
        section="Overview"
        sectionLink="/reservations/list"
        subsection={reservation.locator}
      />

      <div className="main-wrapper">
        <div className="wrapper-card wrapper-card--elevation-100 fz-res-detail-page">
          <div className="fz-res-confirmation__banner">
            <div className="fz-res-confirmation__icon">✓</div>
            <div>
              <h2 className="fz-res-confirmation__title">Payment successful</h2>
              <p className="fz-res-confirmation__meta">
                Order <strong>#{reservation.orderId}</strong> · {formatFzMoney(reservation.totalToBePaid)}
              </p>
              <p className="fz-res-confirmation__desc">
                Confirmation email sent to {reservation.ownerEmail}.
              </p>
            </div>
          </div>

          <ReservationHeader reservation={reservation} timezone={tz} />

          <div className="fz-res-detail-page__body">
            <div className="fz-res-detail-page__side">
              <section className="fz-res-detail-page__block fz-res-detail-page__block--card">
                <CartDetailPanel reservation={reservation} />
              </section>
              <section className="fz-res-detail-page__block fz-res-detail-page__block--card">
                <h3 className="fz-res-detail-page__block-title">Reservation details</h3>
                <ReservationMetaPanel reservation={reservation} timezone={tz} />
                {reservation.paidAt && (
                  <p className="fz-res-confirmation__paid-at">
                    Paid {formatFzDateTime(reservation.paidAt, tz)}
                  </p>
                )}
              </section>
            </div>

            <aside className="fz-res-detail-page__payment">
              <div className="fz-res-payment-cta">
                <p style={{ margin: 0, color: '#18824c', fontWeight: 600 }}>
                  Ticket confirmed
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#536b75' }}>
                  Ticket delivery follows post-purchase flow.
                </p>
                <div className="fz-res-confirmation__actions" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
                  <Link to={`/reservations/list/${reservation.id}`} className="gl-btn-primary">
                    View reservation
                  </Link>
                  <Link to="/reservations/list" className="gl-btn-secondary">
                    Back to list
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
