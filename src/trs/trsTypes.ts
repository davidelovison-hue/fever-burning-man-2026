import type { FzReservation } from '../fz/reservations/reservationModel';

export type UserRole = 'admin' | 'approver' | 'requester';

export type TicketTypeId = 'comp' | 'reduced' | 'earlyAccess';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type CampStatus = 'active' | 'pending_review' | 'inactive';

export type DepartmentId = 'placement' | 'art' | 'dmv' | 'volunteers';

export interface TicketType {
  id: TicketTypeId;
  name: string;
  priceLabel: string;
}

/** Per ticket-type cap — only types with an allocation are set */
export type CampAllocations = Partial<Record<TicketTypeId, number>>;

export interface Camp {
  id: string;
  name: string;
  leadEmail: string;
  department: DepartmentId;
  playaName?: string;
  status: CampStatus;
  allocations: CampAllocations;
}

export interface CampInput {
  name: string;
  leadEmail: string;
  department: DepartmentId;
  playaName?: string;
  status: CampStatus;
}

export interface Person {
  name: string;
  email: string;
  playaName: string;
  campRole: string;
}

export interface TicketRequest {
  id: string;
  campId: string;
  ticketType: TicketTypeId;
  people: Person[];
  status: RequestStatus;
  createdAt: string;
  submittedBy?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  reservationIds?: string[];
}

export interface TrsState {
  camps: Camp[];
  requests: TicketRequest[];
  reservations: FzReservation[];
  leadCampId: string;
}

export const TICKET_TYPES: TicketType[] = [
  { id: 'comp', name: 'Comp ticket', priceLabel: 'Comp' },
  { id: 'reduced', name: 'Reduced ticket', priceLabel: 'Reduced' },
  { id: 'earlyAccess', name: 'Early access', priceLabel: 'Early Access' },
];

export const TICKET_TYPE_LABELS: Record<TicketTypeId, string> = {
  comp: 'Comp',
  reduced: 'Reduced',
  earlyAccess: 'Early Access',
};

/** Comp tickets are free — no payment reservation. Reduced & early access require payment. */
export function ticketTypeRequiresPayment(ticketType: TicketTypeId): boolean {
  return ticketType !== 'comp';
}

export function reservationAmountForTicketType(ticketType: TicketTypeId): number {
  if (ticketType === 'reduced') return 250;
  if (ticketType === 'earlyAccess') return 575;
  return 0;
}

export const TICKET_SESSION_LABELS: Record<TicketTypeId, string> = {
  comp: 'Stellar · Comp crew ticket',
  reduced: 'Stellar · Directed crew ticket',
  earlyAccess: 'Stellar · Early access crew ticket',
};

export const DEPARTMENTS: { id: DepartmentId; label: string }[] = [
  { id: 'placement', label: 'Placement' },
  { id: 'art', label: 'Art' },
  { id: 'dmv', label: 'DMV' },
  { id: 'volunteers', label: 'Volunteers' },
];

export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  placement: 'Placement',
  art: 'Art',
  dmv: 'DMV',
  volunteers: 'Volunteers',
};

/** BMP reservations use camp department as the business type badge. */
export type BmpBusinessType = DepartmentId;

export const BMP_BUSINESS_TYPE_LABELS: Record<BmpBusinessType, string> = DEPARTMENT_LABELS;

export function formatBusinessTypeLabel(type: string): string {
  return BMP_BUSINESS_TYPE_LABELS[type as BmpBusinessType] ?? type;
}

export function departmentToBusinessType(department: DepartmentId): BmpBusinessType {
  return department;
}

export const CAMP_STATUS_LABELS: Record<CampStatus, string> = {
  active: 'Active',
  pending_review: 'Pending review',
  inactive: 'Inactive',
};

export interface CampUsage {
  campId: string;
  ticketType: TicketTypeId;
  cap: number;
  approved: number;
  pending: number;
  remaining: number;
}

export function getCampCap(camp: Camp, ticketType: TicketTypeId): number {
  return camp.allocations[ticketType] ?? 0;
}
