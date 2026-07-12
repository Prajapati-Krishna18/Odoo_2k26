export interface AssetDTO {
  id: string;
  name: string;
  serialNumber?: string;
  description?: string;
  status: string;
  condition: string;
  categoryId?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssetDTO {
  name: string;
  serialNumber?: string;
  description?: string;
  status?: string;
  condition?: string;
  categoryId?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
}

export interface UpdateAssetDTO {
  name?: string;
  serialNumber?: string;
  description?: string;
  status?: string;
  condition?: string;
  categoryId?: string;
  locationId?: string;
  purchaseDate?: Date;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
}

export interface AssetFilterDTO {
  status?: string;
  condition?: string;
  categoryId?: string;
  locationId?: string;
  purchaseDateFrom?: Date;
  purchaseDateTo?: Date;
  purchaseCostMin?: number;
  purchaseCostMax?: number;
  warrantyExpiryFrom?: Date;
  warrantyExpiryTo?: Date;
}

export interface AssetSearchDTO {
  query: string;
  fields?: string[];
  page?: number;
  limit?: number;
}
