import type { FzReservation } from './reservationModel';

/** Resolve reservation by internal id or public locator (FZ uses numeric id; BMP uses both). */
export function findReservationByKey(
  reservations: FzReservation[],
  key: string | undefined,
): FzReservation | undefined {
  if (!key) return undefined;
  return (
    reservations.find((r) => r.id === key) ??
    reservations.find((r) => r.locator === key)
  );
}
