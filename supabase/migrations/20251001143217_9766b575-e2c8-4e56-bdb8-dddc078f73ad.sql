-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  writer_id uuid NOT NULL,
  proposed_rate numeric NOT NULL,
  cover_letter text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  CONSTRAINT valid_bid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))
);

-- Enable RLS
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Writers can view their own bids
CREATE POLICY "Writers can view their own bids"
ON public.bids
FOR SELECT
USING (auth.uid() = writer_id);

-- Writers can create bids for available orders
CREATE POLICY "Writers can create bids for available orders"
ON public.bids
FOR INSERT
WITH CHECK (
  auth.uid() = writer_id AND
  EXISTS (
    SELECT 1 FROM writer_profiles
    WHERE user_id = auth.uid() 
    AND verification_status = 'verified'
  ) AND
  EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_id 
    AND status = 'available'
  )
);

-- Writers can withdraw their own pending bids
CREATE POLICY "Writers can withdraw their own bids"
ON public.bids
FOR UPDATE
USING (auth.uid() = writer_id AND status = 'pending')
WITH CHECK (auth.uid() = writer_id AND status IN ('pending', 'withdrawn'));

-- Clients can view bids on their orders
CREATE POLICY "Clients can view bids on their orders"
ON public.bids
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = bids.order_id 
    AND orders.client_id = auth.uid()
  )
);

-- Clients can update bid status on their orders
CREATE POLICY "Clients can update bid status on their orders"
ON public.bids
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = bids.order_id 
    AND orders.client_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = bids.order_id 
    AND orders.client_id = auth.uid()
  )
);

-- Admins can manage all bids
CREATE POLICY "Admins can manage all bids"
ON public.bids
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_bids_updated_at
BEFORE UPDATE ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to assign order when bid is accepted
CREATE OR REPLACE FUNCTION assign_order_on_bid_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If bid is accepted, create assignment and update order status
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Reject all other bids for this order
    UPDATE public.bids
    SET status = 'rejected', reviewed_at = now()
    WHERE order_id = NEW.order_id 
    AND id != NEW.id 
    AND status = 'pending';
    
    -- Create assignment
    INSERT INTO public.assignments (order_id, writer_id, due_at, status)
    VALUES (NEW.order_id, NEW.writer_id, (SELECT deadline FROM orders WHERE id = NEW.order_id), 'active');
    
    -- Update order status
    UPDATE public.orders
    SET status = 'in_progress', assigned_at = now()
    WHERE id = NEW.order_id;
    
    -- Set reviewed_at
    NEW.reviewed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for bid acceptance
CREATE TRIGGER on_bid_accepted
BEFORE UPDATE ON public.bids
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status != 'accepted')
EXECUTE FUNCTION assign_order_on_bid_acceptance();