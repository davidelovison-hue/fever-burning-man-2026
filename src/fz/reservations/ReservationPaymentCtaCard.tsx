import { Link } from 'react-router-dom';
import type { FzReservation } from './reservationModel';
import { formatFzDateTime, formatFzMoney } from './reservationModel';

interface Props {
  reservation: FzReservation;
  checkoutPath: string;
  onOpenPaymentLink: () => void;
}

function expirationLabel(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  return `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`;
}

export function ReservationPaymentCtaCard({ reservation, checkoutPath, onOpenPaymentLink }: Props) {
  if (reservation.status === 'paid') {
    return (
      <div className="fz-res-payment-cta" data-testid="reservation-paid-status">
        <p style={{ margin: 0, color: '#18824c', fontWeight: 600 }}>
          Paid · Order #{reservation.orderId}
        </p>
        {reservation.paidAt && (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: '#536b75' }}>
            {formatFzDateTime(reservation.paidAt, reservation.timezone)}
          </p>
        )}
        {reservation.purchaseUrn && (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#536b75', wordBreak: 'break-all' }}>
            URN: {reservation.purchaseUrn}
          </p>
        )}
        <Link
          to={`/reservations/${reservation.id}/order`}
          className="gl-btn-secondary"
          style={{ marginTop: '0.75rem', display: 'inline-flex' }}
        >
          View order confirmation
        </Link>
      </div>
    );
  }

  if (reservation.status === 'cancelled' || reservation.status === 'expired') {
    return (
      <div className="fz-res-payment-cta fz-res-payment-cta--muted">
        <h3 className="fz-res-payment-cta__section-title">
          {reservation.status === 'cancelled' ? 'Reservation cancelled' : 'Reservation expired'}
        </h3>
        <p className="fz-res-payment-cta__section-desc">
          This reservation can no longer be paid. Create a new reservation from Ticket requests.
        </p>
        <Link to="/reservations/list" className="gl-btn-secondary">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="fz-res-payment-cta" data-testid="get-tickets-card">
      {reservation.expirationDate && (
        <div className="fz-res-payment-cta__alert" data-testid="reservation-expiration-message">
          ⏱ {expirationLabel(reservation.expirationDate)}
        </div>
      )}

      <div className="fz-res-payment-cta__payment-action-card">
        <h3 className="fz-res-payment-cta__payment-action-card-title">Get your tickets now</h3>
        <div className="fz-res-payment-cta__payment-action-card-price">
          {formatFzMoney(reservation.totalToBePaid)}
        </div>
        <Link
          to={checkoutPath}
          className="gl-btn-primary fz-res-payment-cta__payment-action-card-button"
          data-testid="get-tickets-card-button"
        >
          Pay reservation
        </Link>
        <p className="fz-res-payment-cta__payment-action-card-description">
          Complete payment to confirm the directed crew ticket.
        </p>

        <hr className="fz-res-payment-cta__divider" />

        <div className="fz-res-send-link" data-testid="send-payment-link-section">
          <span style={{ fontSize: '1.25rem' }}>🔗</span>
          <div style={{ flex: 1 }}>
            <span className="fz-res-send-link__title">Send payment link</span>
            <p className="fz-res-send-link__desc" data-testid="send-payment-link-description">
              Email a payment link to {reservation.ownerEmail}
            </p>
          </div>
          <button
            type="button"
            className="gl-btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            data-testid="send-payment-link-button"
            onClick={onOpenPaymentLink}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
