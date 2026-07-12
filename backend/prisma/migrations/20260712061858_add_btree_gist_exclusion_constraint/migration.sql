-- Enable btree_gist extension for combining range and equality exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add overlapping booking exclusion constraint for exclusive (single-unit) bookings
ALTER TABLE "bookings" ADD CONSTRAINT "no_overlap_booking" 
  EXCLUDE USING gist (
    "resource_id" WITH =,
    tsrange("start_time", "end_time", '[)') WITH &&
  ) 
  WHERE ("status" IN ('PENDING', 'APPROVED') AND "is_exclusive" = true);