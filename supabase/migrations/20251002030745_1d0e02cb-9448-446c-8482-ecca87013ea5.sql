-- Update bids table to include time needed and price per page
ALTER TABLE public.bids 
ADD COLUMN IF NOT EXISTS time_needed_days integer,
ADD COLUMN IF NOT EXISTS time_needed_hours integer,
ADD COLUMN IF NOT EXISTS price_per_page numeric;

-- Make proposed_rate nullable since we're using price_per_page now
ALTER TABLE public.bids 
ALTER COLUMN proposed_rate DROP NOT NULL;