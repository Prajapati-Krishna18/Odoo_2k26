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
  assetTag: string;
  serialNumber: string;
  assetName: string;
  description?: string;
  manufacturer: string;
  modelNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry?: string;
  location: string;
  categoryId: string;
  status: string;
  condition: string;
  ownerId?: string;
  departmentId?: string;
  qrCode?: string;
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
