import type { BmpBusinessType } from '../../trs/trsTypes';
import { BMP_BUSINESS_TYPE_LABELS } from '../../trs/trsTypes';

export type BusinessType = BmpBusinessType;

export interface ReservationBusiness {
  id: string;
  name: string;
  type: BusinessType;
  email: string;
  taxIdentificationNumber?: string;
  contactName: string;
  phone: string;
  address?: string;
  channel?: string;
  hasCustomChannel: boolean;
  isManager: boolean;
  balanceAllowed: boolean;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = BMP_BUSINESS_TYPE_LABELS;

export const SEED_BUSINESSES: ReservationBusiness[] = [
  {
    id: 'group-dusty-tacos',
    name: 'Dusty Tacos',
    type: 'placement',
    email: 'lead@dustytacos.com',
    contactName: 'Camp lead',
    phone: '+1 415 555 0101',
    address: 'Black Rock City, NV',
    channel: 'reservations',
    hasCustomChannel: true,
    isManager: true,
    balanceAllowed: false,
  },
  {
    id: 'group-moon-dust',
    name: 'Moon Dust Collective',
    type: 'volunteers',
    email: 'lead@moondust.com',
    taxIdentificationNumber: 'BM-2027-042',
    contactName: 'Jordan Lee',
    phone: '+1 702 555 0188',
    address: '6:00 & E, Black Rock City',
    hasCustomChannel: false,
    isManager: true,
    balanceAllowed: true,
  },
  {
    id: 'group-sparkle-pony',
    name: 'Sparkle Pony Camp',
    type: 'art',
    email: 'lead@sparklepony.com',
    contactName: 'Riley Torres',
    phone: '+1 775 555 0166',
    address: '4:30 & G, Black Rock City',
    hasCustomChannel: false,
    isManager: true,
    balanceAllowed: false,
  },
  {
    id: 'group-art-car-guild',
    name: 'Art Car Guild',
    type: 'art',
    email: 'tickets@artcarguild.org',
    contactName: 'Riley Torres',
    phone: '+1 775 555 0142',
    hasCustomChannel: false,
    isManager: false,
    balanceAllowed: false,
  },
];
