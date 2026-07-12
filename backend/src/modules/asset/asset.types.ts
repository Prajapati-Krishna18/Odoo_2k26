export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'DISPOSED';

export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export type AssetSortField =
  | 'name'
  | 'serialNumber'
  | 'status'
  | 'condition'
  | 'purchaseDate'
  | 'purchaseCost'
  | 'currentValue'
  | 'createdAt'
  | 'updatedAt';

export type AssetSortOrder = 'ASC' | 'DESC';
