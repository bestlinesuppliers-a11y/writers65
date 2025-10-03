-- Add missing foreign key constraint for writer_id in bids table
-- This will allow proper joins with profiles table
ALTER TABLE public.bids
ADD CONSTRAINT bids_writer_id_fkey 
FOREIGN KEY (writer_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_writer_id ON public.bids(writer_id);