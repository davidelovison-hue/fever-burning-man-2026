import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

  type ReactNode,

} from 'react';

import type { CampInput, Person, TicketTypeId, TrsState, UserRole } from './trsTypes';

import { getActorLabel } from './roleConfig';

import { getCampCap } from './trsTypes';

import {

  addCampAllocation,

  approveRequest,

  cancelReservation,

  payReservation,

  countReserved,

  createCamp,

  deactivateCamp,

  DEFAULT_LEAD_CAMP_ID,

  getAllCampUsageForOverview,

  getApprovalEligibility,

  getCamp,

  getCampApprovedRequests,

  getCampUsage,

  getDistribution,

  getRemainingForCamp,

  loadState,

  rejectRequest,

  resetState,

  saveState,

  setCampAllocation,

  submitRequest,

  updateCampRecord,

} from './trsStore';



export type ApproveOutcome =

  | { ok: true; reservationCount: number; ticketCount: number; requestId: string }

  | { ok: false; error?: string };



interface TrsContextValue {

  state: TrsState;

  role: UserRole;

  setRole: (r: UserRole) => void;

  leadCampId: string;

  resetDemo: () => void;

  createCamp: (input: CampInput) => void;

  updateCamp: (campId: string, input: CampInput) => void;

  deactivateCamp: (campId: string) => void;

  allocateTickets: (campId: string, ticketType: TicketTypeId, quantity: number) => void;

  setAllocationCap: (campId: string, ticketType: TicketTypeId, cap: number) => void;

  submitBulkRequest: (campId: string, ticketType: TicketTypeId, people: Person[]) => boolean;

  approve: (requestId: string) => ApproveOutcome;

  reject: (requestId: string, note?: string) => void;

  cancelReservation: (locator: string) => void;

  payReservation: (locator: string) => void;

  getApprovalEligibility: (requestId: string) => import('./trsStore').ApprovalEligibility;

  getRemaining: (campId: string, ticketType: TicketTypeId) => number;

  getCampById: (id: string) => ReturnType<typeof getCamp>;

  getUsageForCamp: (campId: string) => ReturnType<typeof getCampUsage>;

  getOverviewUsageForCamp: (campId: string) => ReturnType<typeof getAllCampUsageForOverview>;

  getCampApprovedRequests: (campId: string) => ReturnType<typeof getCampApprovedRequests>;

  getDistributionRows: () => ReturnType<typeof getDistribution>;

}



const TrsContext = createContext<TrsContextValue | null>(null);



export function TrsProvider({ children }: { children: ReactNode }) {

  const [state, setState] = useState<TrsState>(() => loadState());

  const [role, setRole] = useState<UserRole>('admin');

  const leadCampId = state.leadCampId || DEFAULT_LEAD_CAMP_ID;



  const persist = useCallback((next: TrsState) => {

    setState(next);

    saveState(next);

  }, []);



  const value = useMemo<TrsContextValue>(

    () => ({

      state,

      role,

      setRole,

      leadCampId,

      resetDemo: () => persist(resetState()),

      createCamp: (input) => persist(createCamp(state, input)),

      updateCamp: (campId, input) => persist(updateCampRecord(state, campId, input)),

      deactivateCamp: (campId) => persist(deactivateCamp(state, campId)),

      allocateTickets: (campId, ticketType, quantity) =>

        persist(addCampAllocation(state, campId, ticketType, quantity)),

      setAllocationCap: (campId, ticketType, cap) =>

        persist(setCampAllocation(state, campId, ticketType, cap)),

      submitBulkRequest: (campId, ticketType, people) => {

        const camp = getCamp(state, campId);

        if (!camp || camp.status === 'inactive') return false;

        const cap = getCampCap(camp, ticketType);

        const remaining = cap - countReserved(state, campId, ticketType);

        if (cap === 0 || people.length > remaining || people.length === 0) return false;

        persist(submitRequest(state, campId, ticketType, people, getActorLabel(role)));

        return true;

      },

      approve: (requestId) => {

        const eligibility = getApprovalEligibility(state, requestId);

        if (!eligibility.ok) {

          return { ok: false, error: eligibility.message };

        }

        const result = approveRequest(state, requestId, getActorLabel(role));

        persist(result.state);

        return {

          ok: true,

          reservationCount: result.createdReservationIds.length,

          ticketCount: result.ticketCount,

          requestId,

        };

      },

      reject: (requestId, note) => persist(rejectRequest(state, requestId, getActorLabel(role), note)),

      cancelReservation: (locator) => persist(cancelReservation(state, locator)),

      payReservation: (locator) => persist(payReservation(state, locator)),

      getApprovalEligibility: (requestId) => getApprovalEligibility(state, requestId),

      getRemaining: (campId, ticketType) => getRemainingForCamp(state, campId, ticketType),

      getCampById: (id) => getCamp(state, id),

      getUsageForCamp: (campId) => {

        const camp = getCamp(state, campId);

        return camp ? getCampUsage(state, camp) : [];

      },

      getOverviewUsageForCamp: (campId) => {

        const camp = getCamp(state, campId);

        return camp ? getAllCampUsageForOverview(state, camp) : [];

      },

      getCampApprovedRequests: (campId) => getCampApprovedRequests(state, campId),

      getDistributionRows: () => getDistribution(state),

    }),

    [state, role, leadCampId, persist],

  );



  return <TrsContext.Provider value={value}>{children}</TrsContext.Provider>;

}



export function useTrs(): TrsContextValue {

  const ctx = useContext(TrsContext);

  if (!ctx) throw new Error('useTrs must be used within TrsProvider');

  return ctx;

}


