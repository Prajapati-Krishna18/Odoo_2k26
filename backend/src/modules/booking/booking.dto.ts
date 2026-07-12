/**
 * @file    booking.dto.ts
 */
import { BookingStatus, ResourceType } from "@prisma/client";

export interface CreateBookingDTO {
  resourceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  // MEETING_ROOM: optional capacity check
  attendeeCount?: number;
  // VEHICLE: required purpose
  purpose?: string;
  returnCondition?: string;
}

export interface UpdateBookingDTO {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  attendeeCount?: number;
  purpose?: string;
  returnCondition?: string;
}

export interface RejectBookingDTO { rejectedReason: string; }
export interface CancelBookingDTO { cancelReason?: string; }
