-- Allow writers to view profiles of clients for orders they are assigned to
CREATE POLICY "Writers can view client profiles for their assignments"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'writer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.orders o ON a.order_id = o.id
    WHERE a.writer_id = auth.uid()
    AND o.client_id = profiles.id
  )
);

-- Allow clients to view writer profiles for their orders
CREATE POLICY "Clients can view writer profiles for their orders"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'client'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.orders o ON a.order_id = o.id
    WHERE o.client_id = auth.uid()
    AND a.writer_id = profiles.id
  )
);