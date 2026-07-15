import { useState } from 'react';
import type { FzReservation } from './reservationModel';
import { formatBusinessTypeLabel, formatFzDate, formatFzMoney, formatFzTime } from './reservationModel';
import { ReservationActionsMenu } from './ReservationActionsMenu';
import { ReservationStatusTag } from './ReservationStatusTag';

interface Props {
  reservation: FzReservation;
  timezone?: string;
  onViewDetails: (r: FzReservation) => void;
  onSendPaymentLink: (r: FzReservation) => void;
  onCancel?: (r: FzReservation) => void;
}

function expirationSummary(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `Expires in ${days}d`;
  return `Expires in ${hours}h`;
}

export function ReservationCard({
  reservation: r,
  timezone = 'America/Los_Angeles',
  onViewDetails,
  onSendPaymentLink,
  onCancel,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fz-res-card wrapper-card wrapper-card--elevation-100">
      <header className="fz-res-card__header">
        <div
          className="fz-res-card__header-btn"
          role="button"
          tabIndex={0}
          onClick={() => onViewDetails(r)}
          onKeyDown={(e) => { if (e.key === 'Enter') onViewDetails(r); }}
        >
          <div className="fz-res-card__header-info">
            <time className="fz-res-card__time">
              <span>{formatFzDate(r.sessionStartsAt, timezone)}</span>
              <span>{formatFzTime(r.sessionStartsAt, timezone)}</span>
            </time>
            <ReservationStatusTag status={r.status} className="fz-res-card__status" />
          </div>
          {r.status === 'to_be_paid' && (
            <div className="fz-res-card__expiration" data-testid="reservation-card-expiration-date">
              {expirationSummary(r.expirationDate)}
            </div>
          )}
          <p className="fz-res-card__locator">
            <span>Reservation ID <strong>{r.locator}</strong></span>
            <span>🎫 <strong>× {r.totalNumberOfTickets}</strong></span>
          </p>
        </div>
        <ReservationActionsMenu
          reservation={r}
          onViewDetails={onViewDetails}
          onSendPaymentLink={onSendPaymentLink}
          onCancel={onCancel}
        />
      </header>
      <div
        className="fz-res-card__body-btn"
        role="button"
        tabIndex={0}
        onClick={() => onViewDetails(r)}
        onKeyDown={(e) => { if (e.key === 'Enter') onViewDetails(r); }}
      >
        <div className="fz-res-card__recipient">
          <div>
            <h3 className="fz-res-card__owner">{r.ownerFullName}</h3>
            <p className="fz-res-card__email">✉ {r.ownerEmail}</p>
          </div>
          <button
            type="button"
            className="fz-res-card__toggle"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        {expanded && (
          <section className="fz-res-card__details">
            <hr className="fz-res-card__divider" />
            <h3 className="fz-res-card__event">{r.planName}</h3>
            <p className="fz-res-card__price">💰 {formatFzMoney(r.totalToBePaid)}</p>
            <hr className="fz-res-card__divider" />
            <div className="fz-res-card__business">
              <span className="fz-res-card__business-type">{formatBusinessTypeLabel(r.businessType)}</span>
              <p className="fz-res-card__business-name">{r.businessName}</p>
              <p className="fz-res-card__email">✉ {r.businessEmail}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
