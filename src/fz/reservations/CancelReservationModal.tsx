import type { FzReservation } from './reservationModel';
import { formatFzMoney } from './reservationModel';

interface Props {
  reservation: FzReservation;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelReservationModal({ reservation, onClose, onConfirm }: Props) {
  return (
    <>
      <button type="button" className="fz-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="fz-modal fz-modal--sm" role="dialog" aria-labelledby="cancel-modal-title">
        <header className="fz-modal__header">
          <h2 id="cancel-modal-title" className="fz-modal__title">Cancel reservation</h2>
          <button type="button" className="fz-modal__close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <div className="fz-modal__body">
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem' }}>
            Cancel reservation <strong>{reservation.locator}</strong> for{' '}
            <strong>{reservation.ownerFullName}</strong>?
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#536b75' }}>
            {formatFzMoney(reservation.totalToBePaid)} · {reservation.totalNumberOfTickets} ticket(s) will be released.
          </p>
        </div>
        <footer className="fz-modal__actions">
          <button type="button" className="gl-btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Keep reservation
          </button>
          <button
            type="button"
            className="gl-btn-primary"
            style={{ flex: 1, background: '#eb0052', borderColor: '#eb0052' }}
            data-testid="cancel-reservation-confirm"
            onClick={() => { onConfirm(); onClose(); }}
          >
            Cancel reservation
          </button>
        </footer>
      </div>
    </>
  );
}
