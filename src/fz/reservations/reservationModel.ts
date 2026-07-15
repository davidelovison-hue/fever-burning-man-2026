/**
 * FeverZone reservation model — mirrors feverzoneclient:
 * - src/app/modules/reservation/models/reservation.model.ts
 * - src/app/modules/reservation/services/models/reservation.dto.ts (API)
 * - src/b2b/infrastructure/reservation/views/serialized_reservation.py
 */

import type { TicketTypeId, BmpBusinessType } from '../../trs/trsTypes';
import { TICKET_SESSION_LABELS, formatBusinessTypeLabel } from '../../trs/trsTypes';

export type ReservationStatus = 'to_be_paid' | 'paid' | 'cancelled' | 'expired';

export type ReservationAttendance = 'not_validated' | 'validated' | 'arrived';

export interface Money {
  amount: number;
  currency: string;
}

export interface ReservationNote {
  text: string;
  updatedAt?: string;
}

export interface SessionItemBreakdown {
  sessionId: number;
  sessionLabel: string;
  count: number;
  isAddOn: boolean;
}

/** FZ Reservation class + SerializedReservation API fields used in list/detail */
export interface FzReservation {
  id: string;
  locator: string;
  status: ReservationStatus;
  ownerFirstName: string;
  ownerLastName: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  b2bUserName: string;
  b2bUserEmail: string;
  b2bUserUsername: string;
  businessId: string;
  businessName: string;
  businessType: BmpBusinessType | string;
  businessEmail: string;
  businessPhone: string;
  totalToBePaid: Money;
  fullRetailPrice?: Money;
  totalNumberOfTickets: number;
  sessionStartsAt: string;
  createdAt: string;
  expirationDate: string;
  placeId: number;
  placeName: string;
  planName: string;
  planId: number;
  planDefaultLanguage: string;
  planAvailableLanguages: string[];
  partnerId: number;
  timezone: string;
  cartId: string;
  cityId: number;
  cityName: string;
  orderId?: number;
  channelId: string;
  purchaseUrl: string;
  purchaseUrn?: string;
  externalLocatorId?: string;
  attendance: ReservationAttendance;
  note?: ReservationNote;
  sessionItemsBreakdown: SessionItemBreakdown[];
  /** TRS linkage */
  requestId: string;
  recipientId: string;
  groupId: string;
  paidAt?: string;
}

export const FZ_RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  to_be_paid: 'To be paid',
  paid: 'Paid',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

/** FZ table column labels — reservations.tableColumns.* */
export const FZ_TABLE_COLUMNS = {
  eventDate: 'Event date',
  business: 'Business',
  event: 'Event',
  id: 'Reservation ID',
  contactInfo: 'Contact info',
  tickets: '# Tickets',
  total: 'Total',
  status: 'Status',
  attendance: 'Attendance',
} as const;

export const FZ_ATTENDANCE_LABELS: Record<ReservationAttendance, string> = {
  not_validated: '',
  validated: 'Validated',
  arrived: 'Arrived',
};

export const BMP_PLAN = {
  id: 202708,
  name: 'Burning Man 2027',
  placeName: 'Black Rock City',
  cityName: 'Reno',
  cityId: 13,
  placeId: 528,
  partnerId: 1042,
  timezone: 'America/Los_Angeles',
};

export const CREW_TICKET_FULL_RETAIL: Money = { amount: 575, currency: 'USD' };

function splitOwnerName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export const CREW_TICKET_SESSION_LABEL = 'Stellar · Directed crew ticket';

const LOCATOR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

export function generateLocator(): string {
  let out = '';
  for (let i = 0; i < 9; i += 1) {
    out += LOCATOR_ALPHABET[Math.floor(Math.random() * LOCATOR_ALPHABET.length)];
  }
  return out;
}

export function buildPurchaseUrl(locator: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${base}/pay/${locator}`;
}

export function formatFzMoney(money: Money): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount);
}

export function formatFzDate(iso: string, timezone = 'America/Los_Angeles'): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatFzTime(iso: string, timezone = BMP_PLAN.timezone): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(new Date(iso));
}

export function formatFzDateTime(iso: string, timezone = BMP_PLAN.timezone): string {
  return `${formatFzDate(iso, timezone)} ${formatFzTime(iso, timezone)}`;
}

export { formatBusinessTypeLabel };

export function createFzReservationFromApproval(input: {
  requestId: string;
  recipientId: string;
  groupId: string;
  ownerFullName: string;
  ownerEmail: string;
  b2bUserName: string;
  b2bUserEmail: string;
  businessName: string;
  businessType?: string;
  ticketType?: TicketTypeId;
  unitAmount?: number;
  ticketCount?: number;
  /** Total amount override (otherwise unitAmount × ticketCount) */
  amount?: number;
  /** @deprecated use unitAmount */
  reducedAmount?: number;
  seq: number;
  overrides?: Partial<FzReservation>;
}): FzReservation {
  const locator = input.overrides?.locator ?? generateLocator();
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const ticketType = input.ticketType ?? 'reduced';
  const ticketCount = input.ticketCount ?? 1;
  const unitAmount = input.unitAmount ?? input.reducedAmount ?? input.amount ?? 250;
  const totalAmount = input.amount ?? unitAmount * ticketCount;
  const sessionLabel = TICKET_SESSION_LABELS[ticketType];
  const { first, last } = splitOwnerName(input.ownerFullName);

  const base: FzReservation = {
    id: `res-${input.recipientId}-${input.seq}`,
    locator,
    status: 'to_be_paid',
    ownerFirstName: first,
    ownerLastName: last,
    ownerFullName: input.ownerFullName,
    ownerEmail: input.ownerEmail,
    ownerPhone: '',
    b2bUserName: input.b2bUserName,
    b2bUserEmail: input.b2bUserEmail,
    b2bUserUsername: input.b2bUserEmail.split('@')[0] ?? 'group-lead',
    businessId: input.groupId,
    businessName: input.businessName,
    businessType: input.businessType ?? 'placement',
    businessEmail: input.b2bUserEmail,
    businessPhone: '+1 415 555 0101',
    totalToBePaid: { amount: totalAmount, currency: 'USD' },
    fullRetailPrice: CREW_TICKET_FULL_RETAIL,
    totalNumberOfTickets: ticketCount,
    sessionStartsAt: '2027-08-25T00:00:00Z',
    createdAt: now.toISOString(),
    expirationDate: expires.toISOString(),
    placeId: BMP_PLAN.placeId,
    placeName: BMP_PLAN.placeName,
    planName: BMP_PLAN.name,
    planId: BMP_PLAN.id,
    planDefaultLanguage: 'en',
    planAvailableLanguages: ['en'],
    partnerId: BMP_PLAN.partnerId,
    timezone: BMP_PLAN.timezone,
    cartId: `cart-${input.seq}-${locator.slice(0, 4)}`,
    cityId: BMP_PLAN.cityId,
    cityName: BMP_PLAN.cityName,
    channelId: 'reservations',
    purchaseUrl: buildPurchaseUrl(locator),
    purchaseUrn: `urn:fever:purchase:${locator}`,
    attendance: 'not_validated',
    sessionItemsBreakdown: [
      { sessionId: 9001, sessionLabel, count: ticketCount, isAddOn: false },
    ],
    requestId: input.requestId,
    recipientId: input.recipientId,
    groupId: input.groupId,
  };

  const merged = { ...base, ...input.overrides };
  if (input.overrides?.locator) {
    merged.purchaseUrl = buildPurchaseUrl(merged.locator);
    merged.purchaseUrn = `urn:fever:purchase:${merged.locator}`;
  }
  return merged;
}
