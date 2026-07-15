import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import type { FzReservation } from './reservationModel';

interface Props {
  reservation: FzReservation;
  onViewDetails: (r: FzReservation) => void;
  onSendPaymentLink: (r: FzReservation) => void;
  onCancel?: (r: FzReservation) => void;
}

export function ReservationActionsMenu({ reservation, onViewDetails, onSendPaymentLink, onCancel }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (reservation.status !== 'to_be_paid' && reservation.status !== 'paid') return null;

  return (
    <div className="fz-res-actions" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="fz-res-actions__btn"
        data-testid="reservation-actions__dropdown-button"
        aria-label="Reservation actions"
        onClick={() => setOpen((v) => !v)}
      >
        ⋯
      </button>
      {open && (
        <div className="fz-res-actions__menu" data-testid="reservation-actions__options">
          {reservation.status === 'to_be_paid' && (
            <>
              <button
                type="button"
                className="fz-res-actions__option"
                data-testid="reservation-actions__generate-payment-url"
                onClick={() => { onSendPaymentLink(reservation); setOpen(false); }}
              >
                <span>🔗</span> Generate payment URL
              </button>
              <button
                type="button"
                className="fz-res-actions__option"
                data-testid="reservation-actions__modify"
                onClick={() => { navigate(`/reservations/list/${reservation.id}/modify`); setOpen(false); }}
              >
                <span>✎</span> Modify
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="fz-res-actions__option"
                  data-testid="reservation-actions__cancel"
                  onClick={() => { onCancel(reservation); setOpen(false); }}
                >
                  <span>⊘</span> Cancel
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className="fz-res-actions__option"
            data-testid="reservation-actions__view-details"
            onClick={() => { onViewDetails(reservation); setOpen(false); }}
          >
            <span>👁</span> View details
          </button>
        </div>
      )}
    </div>
  );
}
