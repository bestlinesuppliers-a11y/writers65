-- Drop existing problematic storage policies
DROP POLICY IF EXISTS "Clients can upload order attachments" ON storage.objects;
DROP POLICY IF EXISTS "Clients can view their own order attachments" ON storage.objects;
DROP POLICY IF EXISTS "Clients can delete their own order attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all order attachments" ON storage.objects;

-- Create new storage policies without recursion issues
CREATE POLICY "Users can upload to order-attachments bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'order-attachments' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own attachments in order-attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'order-attachments' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own attachments in order-attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'order-attachments' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can manage order-attachments" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'order-attachments' 
  AND public.get_current_user_role() = 'admin'::app_role
);