import { useState } from 'react';
import type { FzReservation } from './reservationModel';
import { formatFzMoney } from './reservationModel';

interface Props {
  reservation: FzReservation;
  onClose: () => void;
  onSend?: () => void;
}

export function PaymentUrlModal({ reservation, onClose, onSend }: Props) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(reservation.purchaseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Payment link', reservation.purchaseUrl);
    }
  };

  const sendEmail = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    onSend?.();
    onClose();
  };

  return (
    <>
      <button type="button" className="fz-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="fz-modal" role="dialog" aria-labelledby="payment-url-modal-title" data-testid="payment-url-modal">
        <header className="fz-modal__header">
          <h2 id="payment-url-modal-title" className="fz-modal__title">Send payment link</h2>
          <button type="button" className="fz-modal__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="fz-modal__body">
          <div className="fz-modal__section">
            <p className="fz-modal__section-title">Reservation</p>
            <p className="fz-modal__section-subtitle">
              {reservation.locator} · Cart {reservation.cartId} · {formatFzMoney(reservation.totalToBePaid)}
            </p>
          </div>

          <div className="fz-modal__section">
            <p className="fz-modal__section-title">Language</p>
            <p className="fz-modal__section-subtitle">Select the language for the payment page</p>
            <select className="gl-select" defaultValue={reservation.planDefaultLanguage} style={{ width: '100%' }}>
              {reservation.planAvailableLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang === 'en' ? 'English' : lang}</option>
              ))}
            </select>
          </div>

          <div className="fz-modal__section">
            <p className="fz-modal__section-title">Send payment link</p>
            <label className="gl-field" style={{ marginBottom: '0.75rem' }}>
              <span className="gl-field__label">Send to</span>
              <input className="gl-input" type="text" readOnly value={reservation.ownerEmail} data-testid="payment-url-modal-send-to" />
            </label>
            <div className="fz-modal__payment-link-row">
              <label className="gl-field" style={{ flex: 1, margin: 0 }}>
                <span className="gl-field__label">Payment link</span>
                <input className="gl-input" type="text" readOnly value={reservation.purchaseUrl} />
              </label>
              <button type="button" className="gl-btn-secondary" onClick={copyUrl}>Copy</button>
            </div>
            {copied && (
              <span className="fz-modal__copied" data-testid="payment-url-copied">
                ✓ Copied to clipboard
              </span>
            )}
          </div>
        </div>
        <footer className="fz-modal__actions">
          <button
            type="button"
            className="gl-btn-primary"
            style={{ flex: 1 }}
            data-testid="payment-url-modal-send-button"
            disabled={sending}
            onClick={sendEmail}
          >
            {sending ? 'Sending…' : 'Send email'}
          </button>
          <button type="button" className="gl-btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </>
  );
}
