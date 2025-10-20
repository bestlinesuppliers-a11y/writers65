-- First, drop ALL existing policies related to order-attachments bucket
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%order-attachments%' OR policyname LIKE '%Writers can download%' OR policyname LIKE '%Clients can access%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
  END LOOP;
END $$;

-- Now create the correct policies for order-attachments
-- Writers can download attachments from orders where they have placed bids or are assigned
CREATE POLICY "Writers can download attachments for orders they bid on"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'order-attachments' AND
  (
    EXISTS (
      SELECT 1 FROM public.bids b
      JOIN public.orders o ON b.order_id = o.id
      WHERE b.writer_id = auth.uid()
      AND o.client_id::text = (storage.foldername(name))[1]
    )
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.orders o ON a.order_id = o.id
      WHERE a.writer_id = auth.uid()
      AND o.client_id::text = (storage.foldername(name))[1]
    )
  )
);

-- Clients can access attachments in their own folder
CREATE POLICY "Clients can access attachments in their folder"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'order-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);