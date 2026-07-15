import { useMemo, useState } from 'react';
import type { FzReservation } from './reservationModel';
import {
  FZ_ATTENDANCE_LABELS,
  FZ_TABLE_COLUMNS,
  formatBusinessTypeLabel,
  formatFzDate,
  formatFzMoney,
  formatFzTime,
} from './reservationModel';
import { ReservationActionsMenu } from './ReservationActionsMenu';
import { ReservationStatusTag } from './ReservationStatusTag';

type SortField = 'session_starts_at' | 'expires_at' | null;

interface Props {
  reservations: FzReservation[];
  onRowClick: (r: FzReservation) => void;
  onSendPaymentLink: (r: FzReservation) => void;
  onCancel?: (r: FzReservation) => void;
  timezone?: string;
}

function expirationSummary(iso: string, timezone: string): { dueBy: string; left: string } {
  const exp = new Date(iso);
  const diff = exp.getTime() - Date.now();
  const dueBy = `Due by: ${formatFzDate(iso, timezone)} ${formatFzTime(iso, timezone)}`;
  if (diff <= 0) return { dueBy, left: 'Expired' };
  const totalMin = Math.floor(diff / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  const left = `${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m left`.trim();
  return { dueBy, left };
}

export function ReservationsTable({
  reservations,
  onRowClick,
  onSendPaymentLink,
  onCancel,
  timezone = 'America/Los_Angeles',
}: Props) {
  const [sortField, setSortField] = useState<SortField>('session_starts_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    const rows = [...reservations];
    if (sortField) {
      rows.sort((a, b) => {
        const av = sortField === 'expires_at' ? a.expirationDate : a.sessionStartsAt;
        const bv = sortField === 'expires_at' ? b.expirationDate : b.sessionStartsAt;
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [reservations, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="scrollable-table fz-res-table-wrap" data-testid="reservations-list-table">
      <table className="fz-data-table fz-res-table">
        <colgroup>
          <col className="fz-res-col fz-res-col--date" />
          <col className="fz-res-col fz-res-col--business" />
          <col className="fz-res-col fz-res-col--event" />
          <col className="fz-res-col fz-res-col--id" />
          <col className="fz-res-col fz-res-col--contact" />
          <col className="fz-res-col fz-res-col--tickets" />
          <col className="fz-res-col fz-res-col--total" />
          <col className="fz-res-col fz-res-col--status" />
          <col className="fz-res-col fz-res-col--attendance" />
          <col className="fz-res-col fz-res-col--actions" />
        </colgroup>
        <thead>
          <tr>
            <th>
              <button type="button" className="fz-res-table__sort" onClick={() => toggleSort('session_starts_at')}>
                {FZ_TABLE_COLUMNS.eventDate}{sortIndicator('session_starts_at')}
              </button>
            </th>
            <th>{FZ_TABLE_COLUMNS.business}</th>
            <th>{FZ_TABLE_COLUMNS.event}</th>
            <th>{FZ_TABLE_COLUMNS.id}</th>
            <th>{FZ_TABLE_COLUMNS.contactInfo}</th>
            <th className="num">{FZ_TABLE_COLUMNS.tickets}</th>
            <th className="num">{FZ_TABLE_COLUMNS.total}</th>
            <th>
              <button type="button" className="fz-res-table__sort" onClick={() => toggleSort('expires_at')}>
                {FZ_TABLE_COLUMNS.status}{sortIndicator('expires_at')}
              </button>
            </th>
            <th>{FZ_TABLE_COLUMNS.attendance}</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className="scrollable-table__row"
              data-testid="scrollable-table-row"
              onClick={() => onRowClick(r)}
            >
              <td className="scrollable-table__row-cell">
                <span className="scrollable-table__column-text" data-testid="scrollable-table-event-date">
                  {formatFzDate(r.sessionStartsAt, timezone)}
                </span>
                <span className="scrollable-table__column-text scrollable-table__column-text--muted" data-testid="scrollable-table-event-time">
                  {formatFzTime(r.sessionStartsAt, timezone)}
                </span>
              </td>
              <td className="scrollable-table__row-cell" data-testid="scrollable-table-group">
                <span className={`fz-res-business-type fz-res-business-type--${r.businessType}`}>
                  {formatBusinessTypeLabel(r.businessType)}
                </span>
                <span className="scrollable-table__column-text scrollable-table__column-text--big" data-testid="scrollable-table-business-name">
                  {r.businessName}
                </span>
                <a
                  className="scrollable-table__column-text scrollable-table__column-text--break"
                  href={`mailto:${r.businessEmail}`}
                  data-testid="scrollable-table-business-email"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.businessEmail}
                </a>
                {r.businessPhone && (
                  <span className="scrollable-table__column-text scrollable-table__column-text--muted" data-testid="scrollable-table-business-phone">
                    {r.businessPhone}
                  </span>
                )}
              </td>
              <td className="scrollable-table__row-cell" data-testid="scrollable-table-event-name">
                <span className="scrollable-table__column-text">{r.planName}</span>
              </td>
              <td className="scrollable-table__row-cell" data-testid="scrollable-table-reservation-locator">
                <span className="scrollable-table__column-text">{r.locator}</span>
              </td>
              <td className="scrollable-table__row-cell">
                <span className="scrollable-table__column-text scrollable-table__column-text--big" data-testid="scrollable-table-cart-owner-name">
                  {r.ownerFullName}
                </span>
                <a
                  className="scrollable-table__column-text scrollable-table__column-text--break"
                  href={`mailto:${r.ownerEmail}`}
                  data-testid="scrollable-table-cart-owner-email"
                  onClick={(e) => e.stopPropagation()}
                >
                  {r.ownerEmail}
                </a>
              </td>
              <td className="scrollable-table__row-cell num" data-testid="scrollable-table-tickets">
                <span className="scrollable-table__column-text">{r.totalNumberOfTickets}</span>
              </td>
              <td className="scrollable-table__row-cell num" data-testid="scrollable-table-price">
                <span className="scrollable-table__column-text">{formatFzMoney(r.totalToBePaid)}</span>
              </td>
              <td className="scrollable-table__row-cell" data-testid="reservations-status">
                <ReservationStatusTag status={r.status} />
                {r.status === 'to_be_paid' && (() => {
                  const exp = expirationSummary(r.expirationDate, timezone);
                  return (
                    <span className="fz-res-expiration" data-testid="scrollable-table-expiration-alert">
                      <span className="fz-res-expiration__due">{exp.dueBy}</span>
                      <span className="fz-res-expiration__left">{exp.left}</span>
                    </span>
                  );
                })()}
              </td>
              <td className="scrollable-table__row-cell" data-testid="scrollable-table-attendance">
                {FZ_ATTENDANCE_LABELS[r.attendance] ? (
                  <span className="scrollable-table__column-text">{FZ_ATTENDANCE_LABELS[r.attendance]}</span>
                ) : null}
              </td>
              <td className="scrollable-table__actions-cell scrollable-table__row-cell" data-testid="scrollable-table-actions">
                <ReservationActionsMenu
                  reservation={r}
                  onViewDetails={onRowClick}
                  onSendPaymentLink={onSendPaymentLink}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
