import type { UserRole } from '../trs/trsTypes';
import { screensForRole, TRS_MODULE_LABEL } from '../trs/roleConfig';

export interface FzMenuItem {
  label: string;
  route?: string;
  isOpen?: boolean;
  badge?: string;
  items?: FzMenuItem[];
}

/** FeverZone sidebar — active module matches TRS_MODULE_LABEL. */
export function getFzMenu(role: UserRole): FzMenuItem[] {
  const ticketTabs = screensForRole(role).map((s) => ({ label: s.label, route: s.path }));

  return [
    { label: 'Validation' },
    {
      label: 'Orders',
      isOpen: false,
      items: [
        { label: 'Overview' },
        { label: 'Orders list' },
        { label: 'Refunds' },
      ],
    },
    {
      label: 'Reservations',
      isOpen: role === 'admin' || role === 'approver',
      items: [
        ...(role === 'admin' || role === 'approver'
          ? [{ label: 'Overview', route: '/reservations/list' }]
          : [{ label: 'Overview' }]),
        { label: 'Rules' },
        { label: 'Deposit settings' },
        { label: 'Businesses' },
        { label: 'Guide' },
      ],
    },
    {
      label: TRS_MODULE_LABEL,
      isOpen: true,
      items: ticketTabs,
    },
    { label: 'Marketing' },
    { label: 'Analytics', badge: 'AI' },
    { label: 'Affiliations' },
    { label: 'Memberships' },
    { label: 'Entitlements' },
    { label: 'Cashless' },
    { label: 'Fundraising' },
    { label: 'Box Office' },
    { label: 'Kiosks' },
  ];
}
