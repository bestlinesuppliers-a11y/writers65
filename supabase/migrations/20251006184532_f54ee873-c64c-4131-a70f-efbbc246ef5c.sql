-- Add unique constraint to prevent duplicate active bids per writer per order
-- First, check if there are any duplicate active bids and handle them
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  -- For each duplicate set, keep only the most recent bid and mark others as withdrawn
  FOR duplicate_record IN 
    SELECT order_id, writer_id, COUNT(*) as bid_count
    FROM public.bids
    WHERE status NOT IN ('withdrawn', 'rejected')
    GROUP BY order_id, writer_id
    HAVING COUNT(*) > 1
  LOOP
    -- Mark older duplicate bids as withdrawn, keeping only the most recent
    UPDATE public.bids
    SET status = 'withdrawn'
    WHERE order_id = duplicate_record.order_id
      AND writer_id = duplicate_record.writer_id
      AND status NOT IN ('withdrawn', 'rejected')
      AND id NOT IN (
        SELECT id FROM public.bids
        WHERE order_id = duplicate_record.order_id
          AND writer_id = duplicate_record.writer_id
          AND status NOT IN ('withdrawn', 'rejected')
        ORDER BY created_at DESC
        LIMIT 1
      );
  END LOOP;
END $$;

-- Create a unique partial index to prevent duplicate active bids
-- This allows only one non-withdrawn, non-rejected bid per writer per order
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_bid_per_writer_order 
ON public.bids (order_id, writer_id) 
WHERE status NOT IN ('withdrawn', 'rejected');