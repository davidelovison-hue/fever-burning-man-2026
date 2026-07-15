import type { ReservationStatus } from './reservationModel';
import { FZ_RESERVATION_STATUS_LABELS } from './reservationModel';

const SENTIMENT: Record<ReservationStatus, string> = {
  to_be_paid: 'fz-res-status-tag--warning',
  paid: 'fz-res-status-tag--positive',
  cancelled: 'fz-res-status-tag--danger',
  expired: 'fz-res-status-tag--sharp',
};

const ICON: Record<ReservationStatus, string> = {
  to_be_paid: '!',
  paid: '✓',
  cancelled: '⊘',
  expired: '⏱',
};

export function ReservationStatusTag({ status, className }: { status: ReservationStatus; className?: string }) {
  return (
    <span className={`fz-res-status-tag ${SENTIMENT[status]} ${className ?? ''}`} data-testid="scrollable-table-status">
      <span aria-hidden>{ICON[status]}</span>
      {FZ_RESERVATION_STATUS_LABELS[status].toUpperCase()}
    </span>
  );
}
