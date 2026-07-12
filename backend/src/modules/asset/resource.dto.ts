/**
 * @file    resource.dto.ts
 */
import { ResourceType, ResourceStatus } from "@prisma/client";

export interface CreateResourceDTO {
  name: string;
  type: ResourceType;
  description?: string;
  location?: string;
  capacity?: number;
  quantity?: number;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceDTO {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  quantity?: number;
  status?: ResourceStatus;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}
