import type { UserRole } from './trsTypes';

export const DEMO_ACTOR_NAMES: Record<UserRole, string> = {
  admin: 'Generic Name',
  approver: 'Priya Sharma',
  requester: 'Maya Okonkwo',
};

/** Camp-specific leads for seeded approval rows */
export const CAMP_LEAD_NAMES: Record<string, string> = {
  'camp-dusty': 'Maya Okonkwo',
  'camp-sparkle': 'Elena Vasquez',
  'camp-moon': 'Chris Patel',
};

/** @deprecated Use getActorName(role) */
export const DEMO_USER_NAME = DEMO_ACTOR_NAMES.admin;

/** Demo actor label from the header role switcher */
export function getActorLabel(role: UserRole): string {
  return `${DEMO_ACTOR_NAMES[role]} (${ROLE_CONFIG[role].label})`;
}

export function getActorName(role: UserRole): string {
  return DEMO_ACTOR_NAMES[role];
}

export function getCampLeadLabel(campId: string): string {
  const name = CAMP_LEAD_NAMES[campId] ?? DEMO_ACTOR_NAMES.requester;
  return `${name} (${ROLE_CONFIG.requester.label})`;
}

export interface TrsScreen {
  id: string;
  label: string;
  path: string;
  roles: UserRole[];
}

export const TRS_MODULE_LABEL = 'Ticket requests';

export const TRS_SCREENS: TrsScreen[] = [
  { id: 'allocation', label: 'Allocation', path: '/allocation', roles: ['admin'] },
  { id: 'bulk-request', label: 'Bulk request', path: '/bulk-request', roles: ['admin', 'approver', 'requester'] },
  { id: 'approvals', label: 'Approvals', path: '/approvals', roles: ['admin', 'approver'] },
  { id: 'distribution', label: 'Distribution', path: '/distribution', roles: ['admin', 'approver'] },
];

export const ROLE_CONFIG: Record<UserRole, { label: string; description: string; homeRoute: string }> = {
  admin: {
    label: 'Admin',
    description: 'Set camp allocations and manage the full ticket request flow.',
    homeRoute: '/allocation',
  },
  approver: {
    label: 'Approver',
    description: 'Review bulk requests, approve or reject, and view distribution.',
    homeRoute: '/approvals',
  },
  requester: {
    label: 'Camp Lead (Requester)',
    description: 'Upload crew CSV and submit bulk ticket requests for your camp.',
    homeRoute: '/bulk-request',
  },
};

export function screensForRole(role: UserRole): TrsScreen[] {
  if (role === 'admin') return TRS_SCREENS;
  return TRS_SCREENS.filter((s) => s.roles.includes(role));
}

export function getTabsForRole(role: UserRole): { label: string; route: string }[] {
  return screensForRole(role).map((s) => ({ label: s.label, route: s.path }));
}

export function routeAllowedForRole(pathname: string, role: UserRole): boolean {
  if (pathname === '/' || pathname.startsWith('/reservations')) {
    return role === 'admin' || role === 'approver';
  }
  return screensForRole(role).some((s) => pathname === s.path || pathname.startsWith(`${s.path}/`));
}
