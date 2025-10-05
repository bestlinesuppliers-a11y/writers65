-- Add foreign key constraint for bids.writer_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bids_writer_id_fkey'
  ) THEN
    ALTER TABLE public.bids
    ADD CONSTRAINT bids_writer_id_fkey
    FOREIGN KEY (writer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for bids.order_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bids_order_id_fkey'
  ) THEN
    ALTER TABLE public.bids
    ADD CONSTRAINT bids_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;
END $$;