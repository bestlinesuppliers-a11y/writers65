-- Fix storage policies for order-attachments bucket
-- Allow writers to download attachments from orders they're bidding on or assigned to
CREATE POLICY "Writers can download order attachments for orders they bid on"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'order-attachments' AND
  (
    -- Writer has an active bid on this order
    EXISTS (
      SELECT 1 FROM public.bids
      WHERE bids.writer_id = auth.uid()
      AND (storage.foldername(name))[1] = bids.order_id::text
    )
    OR
    -- Writer is assigned to this order
    EXISTS (
      SELECT 1 FROM public.assignments
      WHERE assignments.writer_id = auth.uid()
      AND (storage.foldername(name))[1] = assignments.order_id::text
    )
  )
);

-- Allow admins to access all order attachments
CREATE POLICY "Admins can access all order attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'order-attachments' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow clients to access attachments for their own orders
CREATE POLICY "Clients can access their order attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'order-attachments' AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.client_id = auth.uid()
    AND (storage.foldername(name))[1] = orders.id::text
  )
);