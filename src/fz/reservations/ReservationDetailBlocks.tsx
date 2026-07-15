import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FzReservation } from './reservationModel';
import {
  formatBusinessTypeLabel,
  formatFzDate,
  formatFzMoney,
  formatFzTime,
} from './reservationModel';
import { ReservationStatusTag } from './ReservationStatusTag';

const BMP_VENUE_ADDRESS = 'Black Rock City, NV';

export function ReservationBreadcrumb({
  reservationId,
  locator,
  tail,
  variant = 'default',
}: {
  reservationId: string;
  locator: string;
  tail?: string;
  variant?: 'default' | 'dark';
}) {
  return (
    <nav
      className={`fz-res-breadcrumb${variant === 'dark' ? ' fz-res-breadcrumb--dark' : ''}`}
      aria-label="Breadcrumb"
    >
      <Link to="/reservations/list">Overview</Link>
      <span className="fz-res-breadcrumb__sep">/</span>
      <Link to={`/reservations/list/${reservationId}`}>{locator}</Link>
      {tail && (
        <>
          <span className="fz-res-breadcrumb__sep">/</span>
          <span>{tail}</span>
        </>
      )}
    </nav>
  );
}

function formatDetailDateTime(iso: string, timezone: string): string {
  const date = formatFzDate(iso, timezone);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date(iso));
  return `${date} ${time}`;
}

function formatModifySessionDate(iso: string, timezone: string): string {
  const d = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso));
  const t = formatFzTime(iso, timezone);
  return `${d}, ${t}`;
}

function paymentDeadlineSummary(iso: string, timezone: string): { deadline: string; left: string } {
  const exp = new Date(iso);
  const diff = exp.getTime() - Date.now();
  const deadline = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  }).format(exp);
  if (diff <= 0) return { deadline, left: 'Expired' };
  const totalMin = Math.floor(diff / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  const left = `${days}d ${hours}h ${mins}m`;
  return { deadline, left };
}

function unitTicketAmount(reservation: FzReservation): number {
  return reservation.totalToBePaid.amount / Math.max(reservation.totalNumberOfTickets, 1);
}

interface DetailHeroProps {
  reservation: FzReservation;
  timezone?: string;
  onModify?: () => void;
  onCancel?: () => void;
}

export function ReservationDetailHero({ reservation, timezone = 'America/Los_Angeles', onModify, onCancel }: DetailHeroProps) {
  const canEdit = reservation.status === 'to_be_paid';
  return (
    <header className="fz-res-prod-hero">
      <div className="fz-res-prod-hero__main">
        <h1 className="fz-res-prod-hero__title">{reservation.planName}</h1>
        <p className="fz-res-prod-hero__meta">{BMP_VENUE_ADDRESS}</p>
        <p className="fz-res-prod-hero__meta">{formatDetailDateTime(reservation.sessionStartsAt, timezone)}</p>
        <div className="fz-res-prod-hero__contact">
          <span className="fz-res-prod-hero__contact-name">
            <span className="fz-res-prod-hero__contact-warn" aria-hidden>⚠</span>
            {reservation.ownerFullName}
          </span>
          <a className="fz-res-prod-hero__contact-email" href={`mailto:${reservation.ownerEmail}`}>
            {reservation.ownerEmail}
          </a>
          {canEdit && (
            <button type="button" className="fz-res-prod-link-btn">
              Edit contact
            </button>
          )}
        </div>
      </div>
      <div className="fz-res-prod-hero__aside">
        <div className="fz-res-prod-hero__toolbar">
          <button type="button" className="fz-btn-outline fz-res-prod-hero__tool">
            Download <span aria-hidden>▾</span>
          </button>
          {canEdit && onModify && (
            <button type="button" className="fz-res-prod-text-btn" onClick={onModify}>
              <span aria-hidden>✎</span> MODIFY RESERVATION
            </button>
          )}
          {canEdit && onCancel && (
            <button type="button" className="fz-res-prod-text-btn fz-res-prod-text-btn--danger" onClick={onCancel}>
              <span aria-hidden>⊘</span> CANCEL
            </button>
          )}
        </div>
        <div className="fz-res-prod-hero__status">
          <span className="fz-res-prod-hero__status-label">STATUS:</span>
          <ReservationStatusTag status={reservation.status} />
          <strong className="fz-res-prod-hero__locator">{reservation.locator}</strong>
        </div>
      </div>
    </header>
  );
}

export function ExternalReservationIdBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="fz-res-external-bar">
      <label className="fz-res-external-bar__field">
        <span className="fz-res-external-bar__label">External reservation ID</span>
        <input
          className="fz-res-external-bar__input"
          type="text"
          value={value}
          readOnly={!editing}
          placeholder="Optional reference for your records"
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="fz-res-prod-link-btn"
        onClick={() => setEditing((e) => !e)}
      >
        {editing ? 'Save' : 'Edit'}
      </button>
    </div>
  );
}

export function NotesPanel({ reservation }: { reservation: FzReservation }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="fz-res-prod-card">
      <header className="fz-res-prod-card__head">
        <h2 className="fz-res-prod-card__title">Notes</h2>
        <button type="button" className="fz-res-prod-link-btn" onClick={() => setOpen((o) => !o)}>
          Add new
        </button>
      </header>
      {open && (
        <div className="fz-res-prod-card__body fz-res-prod-card__body--empty">
          {reservation.note?.text ? (
            <p className="fz-res-prod-card__text">{reservation.note.text}</p>
          ) : (
            <p className="fz-res-prod-card__empty">No notes yet.</p>
          )}
        </div>
      )}
    </section>
  );
}

export function PurchaseDetailsPanel({
  reservation,
  timezone = 'America/Los_Angeles',
}: {
  reservation: FzReservation;
  timezone?: string;
}) {
  const [open, setOpen] = useState(true);
  const ticket = reservation.sessionItemsBreakdown[0];
  const unit = unitTicketAmount(reservation);
  const count = reservation.totalNumberOfTickets;

  return (
    <section className="fz-res-prod-card">
      <button type="button" className="fz-res-prod-card__head fz-res-prod-card__head--toggle" onClick={() => setOpen((o) => !o)}>
        <h2 className="fz-res-prod-card__title">Purchase details</h2>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="fz-res-prod-card__body">
          <p className="fz-res-purchase__session">
            <span aria-hidden>📅</span>
            {formatDetailDateTime(reservation.sessionStartsAt, timezone).replace(' ', ' - ')}
          </p>
          <div className="fz-res-purchase__line">
            <span>
              {count}× {ticket?.sessionLabel ?? 'Crew ticket'}
            </span>
            <span>{formatFzMoney({ amount: unit * count, currency: reservation.totalToBePaid.currency })}</span>
          </div>
          <div className="fz-res-purchase__total">
            <strong>Total to pay</strong>
            <strong>{formatFzMoney(reservation.totalToBePaid)}</strong>
          </div>
        </div>
      )}
    </section>
  );
}

export function PromoCodePanel() {
  return (
    <section className="fz-res-prod-card fz-res-prod-card--compact">
      <div className="fz-res-prod-card__body">
        <label className="fz-res-promo">
          <span className="fz-res-promo__label">Promo code</span>
          <div className="fz-res-promo__row">
            <input className="fz-res-promo__input" type="text" placeholder="Enter code" disabled />
            <button type="button" className="fz-btn-outline" disabled>
              Apply
            </button>
          </div>
        </label>
      </div>
    </section>
  );
}

export function PaymentRequiredAside({
  reservation,
  onPay,
  onSendLink,
}: {
  reservation: FzReservation;
  onPay: () => void;
  onSendLink: () => void;
}) {
  const tz = reservation.timezone;
  const exp = paymentDeadlineSummary(reservation.expirationDate, tz);

  if (reservation.status !== 'to_be_paid') {
    return (
      <aside className="fz-res-prod-aside">
        <div className="fz-res-prod-aside__muted">
          <ReservationStatusTag status={reservation.status} />
          <p className="fz-res-prod-aside__desc">
            {reservation.status === 'paid'
              ? `Paid · Order #${reservation.orderId ?? '—'}`
              : 'This reservation can no longer be paid.'}
          </p>
          <Link to="/reservations/list" className="fz-btn-outline">
            Back to list
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fz-res-prod-aside">
      <h2 className="fz-res-prod-aside__heading">Payment required to secure your reservation</h2>
      <p className="fz-res-prod-aside__sub">
        You must complete the payment to keep this reservation.
      </p>
      <div className="fz-res-prod-aside__deadline" data-testid="reservation-expiration-message">
        <span aria-hidden>⚠</span>
        <span>
          Payment deadline: {exp.deadline}. Left: {exp.left}
        </span>
      </div>
      <div className="fz-res-prod-pay-card" data-testid="get-tickets-card">
        <h3 className="fz-res-prod-pay-card__title">Get your tickets now</h3>
        <div className="fz-res-prod-pay-card__price" data-testid="get-tickets-card-price">
          {formatFzMoney(reservation.totalToBePaid)}
        </div>
        <button
          type="button"
          className="fz-btn-primary fz-res-prod-pay-card__cta"
          data-testid="get-tickets-card-button"
          onClick={onPay}
        >
          Pay for reservation
        </button>
        <div className="fz-res-prod-send-link" data-testid="send-payment-link-section">
          <span className="fz-res-prod-send-link__label">Send payment link</span>
          <p className="fz-res-prod-send-link__desc" data-testid="send-payment-link-description">
            Allow a third party to complete the payment
          </p>
          <button
            type="button"
            className="fz-res-prod-link-btn"
            data-testid="send-payment-link-button"
            onClick={onSendLink}
          >
            Send link
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ModifySummaryHeader({
  reservation,
  backHref,
}: {
  reservation: FzReservation;
  backHref: string;
}) {
  return (
    <header className="fz-res-modify-prod__header">
      <div className="fz-res-modify-prod__header-event">
        <div className="fz-res-modify-prod__thumb" aria-hidden>
          <span className="fz-res-modify-prod__thumb-label">BMP</span>
        </div>
        <div className="fz-res-modify-prod__header-main">
          <h2 className="fz-res-modify-prod__event">{reservation.planName}</h2>
          <p className="fz-res-modify-prod__meta">
            <svg className="fz-res-modify-prod__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {BMP_VENUE_ADDRESS}
          </p>
        </div>
      </div>
      <div className="fz-res-modify-prod__divider" aria-hidden />
      <div className="fz-res-modify-prod__header-id">
        <span className="fz-res-modify-prod__id-label">Reservation ID</span>
        <span className="fz-res-modify-prod__id-value">
          {reservation.locator}
          <button type="button" className="fz-res-modify-prod__copy" aria-label="Copy reservation ID">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </span>
      </div>
      <Link to={backHref} className="fz-res-modify-prod__back-btn">
        Back to reservation
      </Link>
    </header>
  );
}

export function ModifyTicketCard({
  reservation,
  quantity,
  onQuantityChange,
  timezone = 'America/Los_Angeles',
}: {
  reservation: FzReservation;
  quantity: number;
  onQuantityChange: (n: number) => void;
  timezone?: string;
}) {
  const ticket = reservation.sessionItemsBreakdown[0];
  const unit = unitTicketAmount(reservation);
  const fee = 0;
  const currency = reservation.totalToBePaid.currency;

  return (
    <article className="fz-res-modify-ticket">
      <div className="fz-res-modify-ticket__head">
        <span className="fz-res-modify-ticket__date">
          <svg className="fz-res-modify-prod__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {formatModifySessionDate(reservation.sessionStartsAt, timezone)}
        </span>
        <button type="button" className="fz-res-modify-ticket__reschedule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          Reschedule
        </button>
      </div>
      <div className="fz-res-modify-ticket__row">
        <div className="fz-res-modify-ticket__info">
          <p className="fz-res-modify-ticket__name">{ticket?.sessionLabel ?? 'Crew ticket'}</p>
          <p className="fz-res-modify-ticket__fee-note">
            Booking fee per ticket type: {formatFzMoney({ amount: fee, currency })}
          </p>
        </div>
        <div className="fz-res-modify-ticket__amounts">
          <span>{formatFzMoney({ amount: unit, currency })}</span>
          <span className="fz-res-modify-ticket__fee-amount">{formatFzMoney({ amount: fee, currency })}</span>
        </div>
        <div className="fz-res-modify-ticket__qty">
          <button type="button" className="fz-res-modify-ticket__trash" aria-label="Remove ticket type" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
          <button
            type="button"
            className="fz-res-modify-ticket__step"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            className="fz-res-modify-ticket__qty-input"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value) || 1))}
          />
          <button
            type="button"
            className="fz-res-modify-ticket__step"
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}

export function ModifySummaryAside({
  reservation,
  quantity,
}: {
  reservation: FzReservation;
  quantity: number;
}) {
  const unit = unitTicketAmount(reservation);
  const total = unit * quantity;
  const money = { amount: total, currency: reservation.totalToBePaid.currency };

  return (
    <aside className="fz-res-modify-prod__aside">
      <h2 className="fz-res-modify-prod__aside-title">Reservation summary</h2>
      <p className="fz-res-modify-prod__aside-sub">Payment summary</p>
      <details className="fz-res-modify-prod__summary-line" open>
        <summary>
          <span>Original reservation</span>
          <span className="fz-res-modify-prod__summary-value">
            {formatFzMoney(money)}
            <span className="fz-res-modify-prod__summary-caret" aria-hidden>▾</span>
          </span>
        </summary>
      </details>
      <div className="fz-res-modify-prod__remaining">
        <span>Remaining amount</span>
        <strong>{formatFzMoney(money)}</strong>
      </div>
    </aside>
  );
}

/** Legacy blocks used by checkout / confirmation routes */
export function ReservationHeader({ reservation, timezone = 'America/Los_Angeles', onModify, onCancel }: DetailHeroProps) {
  return (
    <ReservationDetailHero
      reservation={reservation}
      timezone={timezone}
      onModify={onModify}
      onCancel={onCancel}
    />
  );
}

export function ReservationMetaPanel({ reservation }: { reservation: FzReservation; timezone?: string; compact?: boolean }) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Cart ID', value: reservation.cartId },
    { label: 'Channel', value: reservation.channelId },
    { label: 'Business', value: `${reservation.businessName} · ${formatBusinessTypeLabel(reservation.businessType)}` },
    { label: 'TRS request', value: reservation.requestId },
  ];
  return (
    <dl className="fz-res-meta-grid">
      {rows.map((row) => (
        <div key={row.label} className="fz-res-meta-grid__item">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CartDetailPanel({ reservation }: { reservation: FzReservation; showRetailCompare?: boolean }) {
  return <PurchaseDetailsPanel reservation={reservation} />;
}
