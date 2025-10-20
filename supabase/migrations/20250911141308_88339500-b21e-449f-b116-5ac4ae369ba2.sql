-- Add sources column to orders table
ALTER TABLE public.orders 
ADD COLUMN sources INTEGER DEFAULT 0;