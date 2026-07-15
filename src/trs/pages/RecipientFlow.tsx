import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { colors, fonts, shadows } from '../../lib/theme';
import { useTrs } from '../TrsProvider';
import {
  CREW_TICKET_SESSION_LABEL,
  formatFzMoney,
  formatFzDateTime,
} from '../../fz/reservations/reservationModel';

/** Payment link checkout — mirrors fever2 reservation purchase_url flow */
export function PayReservationCheckout() {
  const { locator } = useParams();
  const navigate = useNavigate();
  const { getReservation, payReservation, getPass, getRecipientByReservation } = useTrs();
  const reservation = locator ? getReservation(locator) : undefined;
  const recipient = reservation ? getRecipientByReservation(reservation.id) : undefined;
  const sapPass = recipient ? getPass(recipient.id) : undefined;

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f3f3' }}>
        <p style={{ color: colors.textMuted }}>Invalid or expired reservation link.</p>
      </div>
    );
  }

  if (reservation.status === 'paid') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f2f3f3', fontFamily: fonts.body }}>
        <header className="headerbar" style={{ position: 'relative' }}><span className="headerbar__logo-text">fever</span></header>
        <main className="flex-1 flex items-center justify-center p-[24px]">
          <div className="w-full max-w-[480px] rounded-[12px] bg-white p-[28px] flex flex-col gap-[16px]" style={{ boxShadow: shadows.card }}>
            <h1 className="text-[20px] font-semibold" style={{ fontFamily: fonts.heading, color: colors.accent.green }}>Payment complete</h1>
            <p className="text-[14px]" style={{ color: colors.textMuted }}>
              Reservation <strong>{reservation.locator}</strong> · Order #{reservation.orderId}
            </p>
            {sapPass && (
              <Link to={`/claim/${recipient?.inviteToken}/pass`} className="gl-btn-primary" style={{ textAlign: 'center' }}>
                View Setup Access Pass
              </Link>
            )}
          </div>
        </main>
      </div>
    );
  }

  const ticket = reservation.sessionItemsBreakdown[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f2f3f3', fontFamily: fonts.body }}>
      <header className="headerbar" style={{ position: 'relative' }}><span className="headerbar__logo-text">fever</span></header>
      <main className="flex-1 flex items-center justify-center p-[24px]">
        <div className="w-full max-w-[480px] rounded-[12px] bg-white p-[28px] flex flex-col gap-[16px]" style={{ boxShadow: shadows.card }}>
          <p style={{ fontSize: '0.7rem', color: colors.textMuted, margin: 0 }}>
            Reservation {reservation.locator} · Cart {reservation.cartId} · expires {new Date(reservation.expirationDate).toLocaleDateString()}
          </p>
          <h1 className="text-[20px] font-semibold" style={{ fontFamily: fonts.heading }}>{reservation.planName}</h1>
          <p className="text-[14px]" style={{ color: colors.textMuted }}>
            Hi <strong>{reservation.ownerFullName}</strong> — complete payment for your directed crew ticket.
          </p>
          <p className="text-[12px]" style={{ color: colors.textMuted, margin: 0 }}>
            {reservation.placeName}, {reservation.cityName} · Channel: {reservation.channelId}
          </p>
          <div className="rounded-[8px] p-[12px] text-[14px]" style={{ background: colors.background }}>
            <p style={{ margin: 0 }}>{ticket?.sessionLabel ?? CREW_TICKET_SESSION_LABEL}</p>
            <p style={{ margin: '0.25rem 0 0', color: colors.textMuted }}>{reservation.placeName}</p>
          </div>
          <div className="flex justify-between py-[12px] border-t border-b" style={{ borderColor: colors.border }}>
            <span>{reservation.totalNumberOfTickets} ticket{reservation.totalNumberOfTickets !== 1 ? 's' : ''}</span>
            <div style={{ textAlign: 'right' }}>
              <div className="font-semibold">{formatFzMoney(reservation.totalToBePaid)}</div>
              {reservation.fullRetailPrice && reservation.fullRetailPrice.amount > reservation.totalToBePaid.amount && (
                <div style={{ fontSize: '0.75rem', color: colors.textMuted, textDecoration: 'line-through' }}>
                  {formatFzMoney(reservation.fullRetailPrice)}
                </div>
              )}
            </div>
          </div>
          <p className="text-[12px]" style={{ color: colors.textMuted, margin: 0 }}>
            Reserved by {reservation.b2bUserName} · {reservation.businessName}
          </p>
          {reservation.ownerPhone && (
            <p className="text-[12px]" style={{ color: colors.textMuted, margin: 0 }}>
              Contact phone: {reservation.ownerPhone}
            </p>
          )}
          <button
            type="button"
            className="gl-btn-primary"
            style={{ width: '100%', minHeight: '2.75rem' }}
            onClick={() => { payReservation(reservation.locator); navigate(`/pay/${locator}/done`); }}
          >
            Pay {formatFzMoney(reservation.totalToBePaid)}
          </button>
        </div>
      </main>
    </div>
  );
}

export function PayReservationDone() {
  const { locator } = useParams();
  const { getReservation, getPass, getRecipientByReservation } = useTrs();
  const reservation = locator ? getReservation(locator) : undefined;
  const recipient = reservation ? getRecipientByReservation(reservation.id) : undefined;
  const sapPass = recipient ? getPass(recipient.id) : undefined;

  if (!reservation) return <p className="p-[24px]">Invalid session</p>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f2f3f3', fontFamily: fonts.body }}>
      <header className="headerbar" style={{ position: 'relative' }}><span className="headerbar__logo-text">fever</span></header>
      <main className="flex-1 flex items-center justify-center p-[24px]">
        <div className="w-full max-w-[480px] rounded-[12px] bg-white p-[28px] flex flex-col gap-[16px]" style={{ boxShadow: shadows.card }}>
          <h1 className="text-[20px] font-semibold" style={{ fontFamily: fonts.heading, color: colors.accent.green }}>Ticket confirmed</h1>
          <p className="text-[14px]" style={{ color: colors.textMuted }}>
            Order <strong>#{reservation.orderId}</strong> · Locator <strong>{reservation.locator}</strong>
          </p>
          <p className="text-[14px]" style={{ color: colors.textMuted }}>
            {reservation.ownerFullName} · {reservation.ownerEmail}
          </p>
          {reservation.paidAt && (
            <p className="text-[12px]" style={{ color: colors.textMuted }}>
              Paid {formatFzDateTime(reservation.paidAt, reservation.timezone)}
            </p>
          )}
          <p className="text-[14px]" style={{ color: colors.textMuted }}>
            Your ticket will arrive by email (post-purchase flow).
          </p>
          {sapPass && recipient && (
            <Link to={`/claim/${recipient.inviteToken}/pass`} className="gl-btn-secondary" style={{ textAlign: 'center' }}>
              View Setup Access Pass
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export function ClaimLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { getRecipient, claimInvite, state, getReservationForRecipient } = useTrs();
  const recipient = token ? getRecipient(token) : undefined;
  const reservation = recipient ? getReservationForRecipient(recipient.id) : undefined;

  const [playaName, setPlayaName] = useState(recipient?.playaName ?? '');
  const [buildRole, setBuildRole] = useState(recipient?.buildRole ?? '');

  if (!recipient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f3f3' }}>
        <p style={{ color: colors.textMuted }}>Invalid invite link.</p>
      </div>
    );
  }

  if (reservation) {
    return <Navigate to={`/pay/${reservation.locator}`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f2f3f3', fontFamily: fonts.body }}>
      <header className="headerbar" style={{ position: 'relative' }}>
        <span className="headerbar__logo-text">fever</span>
      </header>
      <main className="flex-1 flex items-center justify-center p-[24px]">
        <div className="w-full max-w-[480px] rounded-[12px] bg-white p-[28px] flex flex-col gap-[20px]" style={{ boxShadow: shadows.card }}>
          <h1 className="text-[22px] font-semibold" style={{ fontFamily: fonts.heading, color: colors.textDark }}>
            Claim your allocation
          </h1>
          <p className="text-[14px]" style={{ color: colors.textMuted }}>
            You have been invited to <strong>{recipient.campName}</strong>. Confirm your tracking fields to continue.
          </p>
          <div className="rounded-[8px] p-[12px] text-[14px]" style={{ background: colors.background }}>
            <p><strong>{recipient.fullName}</strong></p>
            <p style={{ color: colors.textMuted }}>{recipient.email}</p>
          </div>
          {state.fieldSchema.map((field) => (
            <label key={field.id} className="gl-field">
              <span className="gl-field__label">{field.label}{field.required && ' *'}</span>
              <input
                className="gl-input"
                value={field.id === 'playaName' ? playaName : field.id === 'buildRole' ? buildRole : recipient.campName}
                onChange={(e) => {
                  if (field.id === 'playaName') setPlayaName(e.target.value);
                  if (field.id === 'buildRole') setBuildRole(e.target.value);
                }}
                readOnly={field.id === 'campName'}
              />
            </label>
          ))}
          <button
            type="button"
            className="gl-btn-primary"
            style={{ width: '100%', minHeight: '2.75rem' }}
            disabled={!playaName || !buildRole}
            onClick={() => { claimInvite(token!, playaName, buildRole); navigate(`/claim/${token}/pass`); }}
          >
            Continue to SAP pass
          </button>
        </div>
      </main>
    </div>
  );
}

export function SapPassPage() {
  const { token } = useParams();
  const { getRecipient, getPass } = useTrs();
  const recipient = token ? getRecipient(token) : undefined;
  const pass = recipient ? getPass(recipient.id) : undefined;

  if (!recipient) return <p className="p-[24px]">Invalid session</p>;

  if (!pass) {
    return (
      <div className="min-h-screen flex items-center justify-center p-[24px]" style={{ background: '#f2f3f3' }}>
        <div className="gl-editor" style={{ maxWidth: '24rem', textAlign: 'center' }}>
          <h1 className="gl-editor__title">Pass not issued</h1>
          <p className="gl-note">A group lead must submit a SAP request and an approver must approve before the Setup Access Pass is generated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-[32px] px-[24px]" style={{ background: '#f2f3f3', fontFamily: fonts.body }}>
      <div className="gl-editor" style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: colors.accent.green, textAlign: 'center', fontWeight: 600 }}>Print at home</p>
        <h1 className="gl-editor__title" style={{ textAlign: 'center', color: '#c45c26' }}>SETUP ACCESS PASS</h1>
        <div className="gl-details-grid">
          <div><span className="gl-field__label">Holder</span><p style={{ margin: 0, fontWeight: 600 }}>{pass.holderName}</p></div>
          <div><span className="gl-field__label">Camp</span><p style={{ margin: 0, fontWeight: 600 }}>{pass.campName}</p></div>
          <div><span className="gl-field__label">Department</span><p style={{ margin: 0, fontWeight: 600 }}>{pass.department}</p></div>
          <div><span className="gl-field__label">Valid from</span><p style={{ margin: 0, fontWeight: 600 }}>{pass.validFrom}</p></div>
        </div>
        <div style={{ background: '#f7f9fa', padding: '1rem', borderRadius: '6px', marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.625rem', wordBreak: 'break-all' }}>{pass.barcode}</p>
          <button type="button" className="gl-btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => window.print()}>Print pass</button>
        </div>
      </div>
    </div>
  );
}
