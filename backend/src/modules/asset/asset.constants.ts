export const ASSET_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
  DISPOSED: 'DISPOSED',
} as const;

export const ASSET_CONDITION = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  DAMAGED: 'DAMAGED',
} as const;

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 10;

export const DEFAULT_SORT = 'createdAt';

export const MAX_LIMIT = 100;
