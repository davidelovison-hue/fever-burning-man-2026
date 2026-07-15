import type {
  Camp,
  CampInput,
  CampUsage,
  Person,
  TicketRequest,
  TicketTypeId,
  TrsState,
} from './trsTypes';
import { getCampCap, TICKET_TYPE_LABELS, TICKET_TYPES, ticketTypeRequiresPayment, reservationAmountForTicketType, departmentToBusinessType } from './trsTypes';
import { createFzReservationFromApproval } from '../fz/reservations/reservationModel';
import { getActorLabel, getCampLeadLabel } from './roleConfig';

const STORAGE_KEY = 'trs-prototype-v7';
const LEGACY_STORAGE_KEYS = ['trs-prototype-v6', 'trs-prototype-v5', 'trs-prototype-v4', 'trs-prototype-v3', 'trs-prototype-v2', 'trs-prototype-v1'];
const BMP_SEED_CAMP_NAME = 'Dusty Tacos';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const DEFAULT_LEAD_CAMP_ID = 'camp-dusty';

const SAMPLE_PEOPLE: Person[] = [
  { name: 'Sam Rivera', email: 'sam@example.com', playaName: 'Dust Bunny', campRole: 'Framing lead' },
  { name: 'Alex Chen', email: 'alex@example.com', playaName: 'Sparkle Pony', campRole: 'Kitchen build' },
  { name: 'Jordan Lee', email: 'jordan@example.com', playaName: 'Moon Dust', campRole: 'Shade structure' },
  { name: 'Riley Torres', email: 'riley@example.com', playaName: 'Cactus King', campRole: 'Power grid' },
  { name: 'Casey Morgan', email: 'casey@example.com', playaName: 'Playa Pete', campRole: 'Signage' },
];

function migrateCamp(raw: Record<string, unknown>): Camp {
  if (typeof raw.leadEmail === 'string' && raw.allocations) {
    return raw as unknown as Camp;
  }
  const caps = (raw.caps ?? {}) as Partial<Record<TicketTypeId, number>>;
  const allocations: Camp['allocations'] = {};
  for (const [key, value] of Object.entries(caps)) {
    if (typeof value === 'number' && value > 0) {
      allocations[key as TicketTypeId] = value;
    }
  }
  return {
    id: String(raw.id),
    name: String(raw.name),
    leadEmail: 'lead@example.com',
    department: 'placement',
    playaName: '',
    status: 'active',
    allocations,
  };
}

function normalizeRequest(req: TicketRequest): TicketRequest {
  return {
    ...req,
    submittedBy: req.submittedBy ?? 'Unknown',
    reviewedBy: req.reviewedBy,
  };
}

function normalizeState(raw: TrsState): TrsState {
  return {
    ...raw,
    reservations: raw.reservations ?? [],
    camps: raw.camps.map((c) => migrateCamp(c as unknown as Record<string, unknown>)),
    requests: raw.requests.map(normalizeRequest),
  };
}

export function createSeedState(): TrsState {
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 5 * 86400000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
  const dueIn3d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const dueIn2d = new Date(Date.now() + 2.7 * 24 * 60 * 60 * 1000).toISOString();
  const dueIn1d = new Date(Date.now() + 1.2 * 24 * 60 * 60 * 1000).toISOString();

  const dustyCamp: Camp = {
    id: 'camp-dusty',
    name: 'Dusty Tacos',
    leadEmail: 'lead@dustytacos.com',
    department: 'placement',
    playaName: 'Dustyville',
    status: 'active',
    allocations: { comp: 30, reduced: 20, earlyAccess: 15 },
  };
  const sparkleCamp: Camp = {
    id: 'camp-sparkle',
    name: 'Sparkle Pony Camp',
    leadEmail: 'lead@sparklepony.com',
    department: 'art',
    playaName: 'Glitter Town',
    status: 'active',
    allocations: { comp: 10, reduced: 15, earlyAccess: 8 },
  };
  const moonCamp: Camp = {
    id: 'camp-moon',
    name: 'Moon Dust Collective',
    leadEmail: 'lead@moondust.com',
    department: 'volunteers',
    playaName: 'Lunar Base',
    status: 'pending_review',
    allocations: { comp: 12, reduced: 10, earlyAccess: 5 },
  };

  const reducedPeople = SAMPLE_PEOPLE.slice(0, 3);
  const earlyPeople = SAMPLE_PEOPLE.slice(3, 5);
  const compPendingPeople = SAMPLE_PEOPLE.slice(2, 4);

  const seedReservation = (
    camp: Camp,
    requestId: string,
    ticketType: TicketTypeId,
    people: Person[],
    reviewedBy: string,
    overrides: Parameters<typeof createFzReservationFromApproval>[0]['overrides'],
  ) => {
    const primary = people[0];
    return createFzReservationFromApproval({
      requestId,
      recipientId: requestId,
      groupId: camp.id,
      ownerFullName: primary.name,
      ownerEmail: primary.email,
      b2bUserName: reviewedBy,
      b2bUserEmail: camp.leadEmail,
      businessName: camp.name,
      businessType: departmentToBusinessType(camp.department),
      ticketType,
      unitAmount: reservationAmountForTicketType(ticketType),
      ticketCount: people.length,
      seq: 0,
      overrides,
    });
  };

  const seedReservations = [
    seedReservation(dustyCamp, 'req-seed-approved-reduced', 'reduced', reducedPeople, getActorLabel('admin'), {
      id: 'res-seed-001',
      locator: 'N784JEPWP',
      ownerPhone: '+1 775 555 0123',
      businessPhone: '+1 775 555 0100',
      expirationDate: dueIn2d,
      createdAt: threeDaysAgo,
      sessionStartsAt: '2027-08-25T09:15:00Z',
    }),
    seedReservation(sparkleCamp, 'req-seed-approved-early', 'earlyAccess', earlyPeople, getActorLabel('approver'), {
      id: 'res-seed-002',
      locator: 'B5HT3WNKM',
      ownerPhone: '+1 775 555 0177',
      businessPhone: '+1 775 555 0166',
      expirationDate: dueIn1d,
      createdAt: threeDaysAgo,
      sessionStartsAt: '2027-08-25T09:15:00Z',
    }),
    seedReservation(sparkleCamp, 'req-seed-approved-early-paid', 'earlyAccess', [SAMPLE_PEOPLE[4]], getActorLabel('approver'), {
      id: 'res-seed-003',
      locator: 'M3R7XK9PL',
      ownerPhone: '+1 775 555 0188',
      expirationDate: dueIn3d,
      createdAt: weekAgo,
      status: 'paid',
      paidAt: now,
      orderId: 482910,
      sessionStartsAt: '2027-08-25T09:15:00Z',
    }),
    seedReservation(moonCamp, 'req-seed-approved-reduced-moon', 'reduced', [SAMPLE_PEOPLE[0]], getActorLabel('admin'), {
      id: 'res-seed-004',
      locator: 'Z9L4CVB2Q',
      ownerPhone: '+1 775 555 0120',
      expirationDate: dueIn2d,
      createdAt: threeDaysAgo,
      status: 'cancelled',
      sessionStartsAt: '2027-08-27T11:30:00Z',
    }),
  ];

  return {
    camps: [dustyCamp, sparkleCamp, moonCamp],
    requests: [
      {
        id: 'req-seed-approved-reduced',
        campId: dustyCamp.id,
        ticketType: 'reduced',
        people: reducedPeople,
        status: 'approved',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(dustyCamp.id),
        reviewedAt: threeDaysAgo,
        reviewedBy: getActorLabel('admin'),
        reservationIds: ['res-seed-001'],
      },
      {
        id: 'req-seed-approved-early',
        campId: sparkleCamp.id,
        ticketType: 'earlyAccess',
        people: earlyPeople,
        status: 'approved',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(sparkleCamp.id),
        reviewedAt: threeDaysAgo,
        reviewedBy: getActorLabel('approver'),
        reservationIds: ['res-seed-002'],
      },
      {
        id: 'req-seed-approved-early-paid',
        campId: sparkleCamp.id,
        ticketType: 'earlyAccess',
        people: [SAMPLE_PEOPLE[4]],
        status: 'approved',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(sparkleCamp.id),
        reviewedAt: weekAgo,
        reviewedBy: getActorLabel('approver'),
        reservationIds: ['res-seed-003'],
      },
      {
        id: 'req-seed-approved-reduced-moon',
        campId: moonCamp.id,
        ticketType: 'reduced',
        people: [SAMPLE_PEOPLE[0]],
        status: 'approved',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(moonCamp.id),
        reviewedAt: weekAgo,
        reviewedBy: getActorLabel('admin'),
        reservationIds: ['res-seed-004'],
      },
      {
        id: 'req-seed-approved-comp',
        campId: dustyCamp.id,
        ticketType: 'comp',
        people: [SAMPLE_PEOPLE[4]],
        status: 'approved',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(dustyCamp.id),
        reviewedAt: weekAgo,
        reviewedBy: getActorLabel('approver'),
      },
      {
        id: 'req-seed-rejected',
        campId: sparkleCamp.id,
        ticketType: 'reduced',
        people: SAMPLE_PEOPLE.slice(1, 2),
        status: 'rejected',
        createdAt: weekAgo,
        submittedBy: getCampLeadLabel(sparkleCamp.id),
        reviewedAt: threeDaysAgo,
        reviewedBy: getActorLabel('approver'),
        reviewNote: 'Cap exceeded for reduced tickets this cycle.',
      },
      {
        id: 'req-seed-pending-comp',
        campId: sparkleCamp.id,
        ticketType: 'comp',
        people: compPendingPeople,
        status: 'pending',
        createdAt: now,
        submittedBy: getCampLeadLabel(sparkleCamp.id),
      },
      {
        id: 'req-seed-pending-reduced',
        campId: dustyCamp.id,
        ticketType: 'reduced',
        people: SAMPLE_PEOPLE.slice(1, 3),
        status: 'pending',
        createdAt: now,
        submittedBy: getCampLeadLabel(dustyCamp.id),
      },
      {
        id: 'req-seed-pending-early',
        campId: moonCamp.id,
        ticketType: 'earlyAccess',
        people: SAMPLE_PEOPLE.slice(2, 4),
        status: 'pending',
        createdAt: now,
        submittedBy: getCampLeadLabel(moonCamp.id),
      },
    ],
    reservations: seedReservations,
    leadCampId: DEFAULT_LEAD_CAMP_ID,
  };
}

/** Inject or refresh demo data when localStorage is empty or from an older generic seed. */
function needsBmpSeedRefresh(state: TrsState): boolean {
  if (state.reservations.length === 0) return true;
  const dusty = state.camps.find((c) => c.id === 'camp-dusty');
  if (dusty?.name !== BMP_SEED_CAMP_NAME) return true;
  if (state.reservations.some((r) => r.businessType === 'educational' || r.businessType === 'agency' || r.businessType === 'corporate')) {
    return true;
  }
  if (state.requests.some((r) => r.submittedBy?.includes('Generic Name') || r.reviewedBy?.includes('Generic Name'))) {
    return true;
  }
  return state.requests.some((req) => {
    if (!req.reservationIds?.length || req.people.length === 0) return false;
    const linked = state.reservations.filter((r) => req.reservationIds!.includes(r.id));
    const ticketTotal = linked.reduce((sum, r) => sum + r.totalNumberOfTickets, 0);
    return ticketTotal !== req.people.length || linked.length > 1;
  });
}

function hydrateSeedIfNeeded(state: TrsState): TrsState {
  if (!needsBmpSeedRefresh(state)) return state;
  const seed = createSeedState();
  if (state.reservations.length === 0) {
    const existingReqIds = new Set(state.requests.map((r) => r.id));
    return {
      ...state,
      reservations: seed.reservations,
      requests: [
        ...state.requests,
        ...seed.requests.filter((r) => !existingReqIds.has(r.id)),
      ],
      camps: state.camps.length > 0 ? state.camps : seed.camps,
    };
  }
  return seed;
}

export function loadState(): TrsState {
  try {
    let state: TrsState | null = null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = normalizeState(JSON.parse(raw) as TrsState);
    if (!state) {
      for (const key of LEGACY_STORAGE_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          state = normalizeState(JSON.parse(legacy) as TrsState);
          break;
        }
      }
    }
    if (state) {
      const hydrated = hydrateSeedIfNeeded(state);
      if (hydrated !== state || !raw) saveState(hydrated);
      return hydrated;
    }
  } catch {
    /* seed */
  }
  const seed = createSeedState();
  saveState(seed);
  return seed;
}

export function saveState(state: TrsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): TrsState {
  const seed = createSeedState();
  saveState(seed);
  return seed;
}

export function getCamp(state: TrsState, campId: string): Camp | undefined {
  return state.camps.find((c) => c.id === campId);
}

export function countReserved(
  state: TrsState,
  campId: string,
  ticketType: TicketTypeId,
  excludeRequestId?: string,
): number {
  return state.requests
    .filter(
      (r) =>
        r.campId === campId &&
        r.ticketType === ticketType &&
        (r.status === 'approved' || r.status === 'pending') &&
        r.id !== excludeRequestId,
    )
    .reduce((sum, r) => sum + r.people.length, 0);
}

export function countApproved(state: TrsState, campId: string, ticketType: TicketTypeId): number {
  return state.requests
    .filter((r) => r.campId === campId && r.ticketType === ticketType && r.status === 'approved')
    .reduce((sum, r) => sum + r.people.length, 0);
}

export function countPending(state: TrsState, campId: string, ticketType: TicketTypeId): number {
  return state.requests
    .filter((r) => r.campId === campId && r.ticketType === ticketType && r.status === 'pending')
    .reduce((sum, r) => sum + r.people.length, 0);
}

export function getRemainingForCamp(
  state: TrsState,
  campId: string,
  ticketType: TicketTypeId,
): number {
  const camp = getCamp(state, campId);
  if (!camp) return 0;
  const cap = getCampCap(camp, ticketType);
  return Math.max(0, cap - countReserved(state, campId, ticketType));
}

export type ApprovalEligibility =
  | { ok: true }
  | { ok: false; message: string };

/** Whether a pending request can be approved without exceeding the camp cap. */
export function getApprovalEligibility(state: TrsState, requestId: string): ApprovalEligibility {
  const req = state.requests.find((r) => r.id === requestId);
  if (!req || req.status !== 'pending') {
    return { ok: false, message: 'Request is not pending.' };
  }

  const camp = getCamp(state, req.campId);
  if (!camp) {
    return { ok: false, message: 'Camp not found.' };
  }

  const cap = getCampCap(camp, req.ticketType);
  const typeLabel = TICKET_TYPE_LABELS[req.ticketType];
  const requested = req.people.length;

  if (cap === 0) {
    return {
      ok: false,
      message: `Can't approve — ${camp.name} has no ${typeLabel} allocation.`,
    };
  }

  // Exclude this request from pending so approving pending→approved does not double-count.
  const available = cap - countReserved(state, req.campId, req.ticketType, requestId);

  if (requested > available) {
    return {
      ok: false,
      message: `Can't approve — ${camp.name} has ${Math.max(0, available)} ${typeLabel} left but this request is for ${requested}.`,
    };
  }

  return { ok: true };
}

export function getCampUsage(state: TrsState, camp: Camp): CampUsage[] {
  const allocatedTypes = TICKET_TYPES.filter(({ id }) => (camp.allocations[id] ?? 0) > 0);
  const types = allocatedTypes.length > 0 ? allocatedTypes : TICKET_TYPES;

  return types.map(({ id }) => {
    const cap = getCampCap(camp, id);
    const approved = countApproved(state, camp.id, id);
    const pending = countPending(state, camp.id, id);
    return {
      campId: camp.id,
      ticketType: id,
      cap,
      approved,
      pending,
      remaining: Math.max(0, cap - approved - pending),
    };
  });
}

export function getAllCampUsageForOverview(state: TrsState, camp: Camp): CampUsage[] {
  return TICKET_TYPES.map(({ id }) => {
    const cap = getCampCap(camp, id);
    const approved = countApproved(state, camp.id, id);
    const pending = countPending(state, camp.id, id);
    return {
      campId: camp.id,
      ticketType: id,
      cap,
      approved,
      pending,
      remaining: Math.max(0, cap - approved - pending),
    };
  });
}

export function createCamp(state: TrsState, input: CampInput): TrsState {
  const camp: Camp = {
    id: uid('camp'),
    name: input.name.trim(),
    leadEmail: input.leadEmail.trim(),
    department: input.department,
    playaName: input.playaName?.trim() || undefined,
    status: input.status,
    allocations: {},
  };
  return { ...state, camps: [...state.camps, camp] };
}

export function updateCampRecord(state: TrsState, campId: string, input: CampInput): TrsState {
  return {
    ...state,
    camps: state.camps.map((c) =>
      c.id === campId
        ? {
            ...c,
            name: input.name.trim(),
            leadEmail: input.leadEmail.trim(),
            department: input.department,
            playaName: input.playaName?.trim() || undefined,
            status: input.status,
          }
        : c,
    ),
  };
}

export function deactivateCamp(state: TrsState, campId: string): TrsState {
  const camp = getCamp(state, campId);
  if (!camp) return state;
  return updateCampRecord(state, campId, {
    name: camp.name,
    leadEmail: camp.leadEmail,
    department: camp.department,
    playaName: camp.playaName,
    status: 'inactive',
  });
}

export function addCampAllocation(
  state: TrsState,
  campId: string,
  ticketType: TicketTypeId,
  quantity: number,
): TrsState {
  if (quantity <= 0) return state;
  return {
    ...state,
    camps: state.camps.map((c) => {
      if (c.id !== campId) return c;
      const current = c.allocations[ticketType] ?? 0;
      return {
        ...c,
        allocations: { ...c.allocations, [ticketType]: current + quantity },
      };
    }),
  };
}

export function setCampAllocation(
  state: TrsState,
  campId: string,
  ticketType: TicketTypeId,
  cap: number,
): TrsState {
  if (cap < 0) return state;
  return {
    ...state,
    camps: state.camps.map((c) => {
      if (c.id !== campId) return c;
      const next = { ...c.allocations };
      if (cap === 0) {
        delete next[ticketType];
      } else {
        next[ticketType] = cap;
      }
      return { ...c, allocations: next };
    }),
  };
}

export function submitRequest(
  state: TrsState,
  campId: string,
  ticketType: TicketTypeId,
  people: Person[],
  submittedBy: string,
): TrsState {
  const camp = getCamp(state, campId);
  if (!camp || camp.status === 'inactive') return state;

  const cap = getCampCap(camp, ticketType);
  const remaining = cap - countReserved(state, campId, ticketType);
  if (cap === 0 || people.length > remaining) return state;

  const now = new Date().toISOString();
  const request: TicketRequest = {
    id: uid('req'),
    campId,
    ticketType,
    people,
    status: 'pending',
    createdAt: now,
    submittedBy,
  };

  return { ...state, requests: [...state.requests, request] };
}

export type ApproveResult = {
  state: TrsState;
  createdReservationIds: string[];
  ticketCount: number;
};

export function approveRequest(state: TrsState, requestId: string, reviewedBy: string): ApproveResult {
  const eligibility = getApprovalEligibility(state, requestId);
  if (!eligibility.ok) return { state, createdReservationIds: [], ticketCount: 0 };

  const req = state.requests.find((r) => r.id === requestId);
  if (!req) return { state, createdReservationIds: [], ticketCount: 0 };

  const camp = getCamp(state, req.campId);
  const reviewedAt = new Date().toISOString();
  let createdReservationIds: string[] = [];
  let newReservations = state.reservations;

  if (ticketTypeRequiresPayment(req.ticketType)) {
    const businessType = camp ? departmentToBusinessType(camp.department) : 'placement';
    const primary = req.people[0];
    const created = createFzReservationFromApproval({
      requestId: req.id,
      recipientId: req.id,
      groupId: req.campId,
      ownerFullName: primary.name,
      ownerEmail: primary.email,
      b2bUserName: reviewedBy,
      b2bUserEmail: camp?.leadEmail ?? 'lead@example.com',
      businessName: camp?.name ?? req.campId,
      businessType,
      ticketType: req.ticketType,
      unitAmount: reservationAmountForTicketType(req.ticketType),
      ticketCount: req.people.length,
      seq: 0,
    });
    createdReservationIds = [created.id];
    newReservations = [...state.reservations, created];
  }

  const nextState: TrsState = {
    ...state,
    reservations: newReservations,
    requests: state.requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            reviewedAt,
            reviewedBy,
            reservationIds: createdReservationIds.length > 0 ? createdReservationIds : r.reservationIds,
          }
        : r,
    ),
  };

  return { state: nextState, createdReservationIds, ticketCount: createdReservationIds.length > 0 ? req.people.length : 0 };
}

export function cancelReservation(state: TrsState, locator: string): TrsState {
  return {
    ...state,
    reservations: state.reservations.map((r) =>
      r.locator === locator ? { ...r, status: 'cancelled' as const } : r,
    ),
  };
}

export function payReservation(state: TrsState, locator: string): TrsState {
  const paidAt = new Date().toISOString();
  return {
    ...state,
    reservations: state.reservations.map((r) =>
      r.locator === locator && r.status === 'to_be_paid'
        ? { ...r, status: 'paid' as const, paidAt, orderId: r.orderId ?? Math.floor(100000 + Math.random() * 900000) }
        : r,
    ),
  };
}

export function rejectRequest(
  state: TrsState,
  requestId: string,
  reviewedBy: string,
  note?: string,
): TrsState {
  return {
    ...state,
    requests: state.requests.map((r) =>
      r.id === requestId && r.status === 'pending'
        ? {
            ...r,
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy,
            reviewNote: note?.trim() || undefined,
          }
        : r,
    ),
  };
}

export interface DistributionRow {
  requestId: string;
  person: Person;
  campId: string;
  campName: string;
  ticketType: TicketTypeId;
  requestStatus: 'approved';
  approvedAt: string;
  reviewedBy?: string;
}

export function getDistribution(state: TrsState): DistributionRow[] {
  const rows: DistributionRow[] = [];
  for (const req of state.requests) {
    if (req.status !== 'approved') continue;
    const camp = getCamp(state, req.campId);
    for (const person of req.people) {
      rows.push({
        requestId: req.id,
        person,
        campId: req.campId,
        campName: camp?.name ?? req.campId,
        ticketType: req.ticketType,
        requestStatus: 'approved',
        approvedAt: req.reviewedAt ?? req.createdAt,
        reviewedBy: req.reviewedBy,
      });
    }
  }
  return rows;
}

export function getCampApprovedRequests(state: TrsState, campId: string): TicketRequest[] {
  return state.requests.filter((r) => r.campId === campId && r.status === 'approved');
}
