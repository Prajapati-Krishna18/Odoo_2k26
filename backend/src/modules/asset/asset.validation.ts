import { z } from 'zod';

export const createAssetSchema = z.object({
  assetTag: z.string().min(1, 'Asset tag is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  assetName: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  modelNumber: z.string().min(1, 'Model number is required'),
  purchaseDate: z.string().refine((date) => {
    const purchaseDate = new Date(date);
    const now = new Date();
    return purchaseDate <= now;
  }, 'Purchase date cannot be in the future'),
  purchaseCost: z.number().min(0, 'Purchase cost must be greater than or equal to 0'),
  warrantyExpiry: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED']),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
  departmentId: z.string().uuid('Invalid department ID').optional(),
  qrCode: z.string().optional(),
}).refine((data) => {
  if (data.warrantyExpiry && data.purchaseDate) {
    const warrantyDate = new Date(data.warrantyExpiry);
    const purchaseDate = new Date(data.purchaseDate);
    return warrantyDate > purchaseDate;
  }
  return true;
}, { message: 'Warranty expiry must be after purchase date' });

export const updateAssetSchema: z.ZodSchema = z.object({});

export const assetFilterSchema: z.ZodSchema = z.object({});

export const assetSearchSchema: z.ZodSchema = z.object({});

export const updateAssetStatusSchema: z.ZodSchema = z.object({});
