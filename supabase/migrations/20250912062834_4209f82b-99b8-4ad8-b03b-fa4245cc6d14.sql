-- Drop all existing problematic order-attachments policies that cause recursion
DROP POLICY IF EXISTS "Clients can upload attachments for their orders" ON storage.objects;
DROP POLICY IF EXISTS "Order participants can view attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage order-attachments" ON storage.objects;

-- Keep the simple policies that don't cause recursion
-- These should already exist from previous migration:
-- "Users can upload to order-attachments bucket"
-- "Users can view their own attachments in order-attachments" 
-- "Users can delete their own attachments in order-attachments"

-- Add admin policy using the security definer function
CREATE POLICY "Admins manage all order attachments" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'order-attachments' 
  AND public.get_current_user_role() = 'admin'::app_role
);