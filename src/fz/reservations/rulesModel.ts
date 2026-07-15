import { BMP_BUSINESS_TYPE_LABELS } from '../../trs/trsTypes';

export interface ReservationRule {
  id: string;
  displayName: string;
  ruleTarget: 'businessType' | 'channel';
  targetKey: string;
  affectedBusinessesCount: number;
  minTickets: number;
  maxTickets: number;
  expiresAfterInHours: number;
  expirationStrategy: 'default' | 'custom';
}

export const SEED_RULES: ReservationRule[] = [
  {
    id: 'placement',
    displayName: BMP_BUSINESS_TYPE_LABELS.placement,
    ruleTarget: 'businessType',
    targetKey: 'placement',
    affectedBusinessesCount: 2,
    minTickets: 1,
    maxTickets: 50,
    expiresAfterInHours: 168,
    expirationStrategy: 'custom',
  },
  {
    id: 'art',
    displayName: BMP_BUSINESS_TYPE_LABELS.art,
    ruleTarget: 'businessType',
    targetKey: 'art',
    affectedBusinessesCount: 2,
    minTickets: 1,
    maxTickets: 25,
    expiresAfterInHours: 120,
    expirationStrategy: 'custom',
  },
  {
    id: 'reservations-channel',
    displayName: 'Reservations channel',
    ruleTarget: 'channel',
    targetKey: 'reservations',
    affectedBusinessesCount: 1,
    minTickets: 1,
    maxTickets: 100,
    expiresAfterInHours: 72,
    expirationStrategy: 'default',
  },
];
