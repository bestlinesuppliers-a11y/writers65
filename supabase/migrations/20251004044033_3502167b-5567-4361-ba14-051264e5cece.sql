-- Update RLS policies for messages to match new requirements

-- Drop existing policies
DROP POLICY IF EXISTS "Users can send messages in orders they're involved in" ON public.messages;
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;

-- Writers can only view messages for orders they are assigned to
CREATE POLICY "Writers can view messages for assigned orders"
ON public.messages
FOR SELECT
USING (
  has_role(auth.uid(), 'writer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE assignments.order_id = messages.order_id
    AND assignments.writer_id = auth.uid()
  )
);

-- Clients can view and send messages for their own orders
CREATE POLICY "Clients can view messages for their orders"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = messages.order_id
    AND orders.client_id = auth.uid()
  )
);

CREATE POLICY "Clients can send messages for their orders"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = messages.order_id
    AND orders.client_id = auth.uid()
  )
);

-- Writers can send messages for orders they're assigned to
CREATE POLICY "Writers can send messages for assigned orders"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id AND
  has_role(auth.uid(), 'writer'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE assignments.order_id = messages.order_id
    AND assignments.writer_id = auth.uid()
  )
);

-- Clients and writers can mark their received messages as read
CREATE POLICY "Users can update their received messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = to_user_id)
WITH CHECK (auth.uid() = to_user_id);

-- Add storage policies for message attachments
-- Clients can upload attachments to their own folder
CREATE POLICY "Clients can upload message attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Writers can upload attachments to their own folder
CREATE POLICY "Writers can upload message attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can download attachments from messages they can view
CREATE POLICY "Users can download message attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'message-attachments' AND
  (
    -- User is the sender
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- User can access messages with this attachment
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE auth.uid()::text = (storage.foldername(name))[1]
      AND (m.from_user_id = auth.uid() OR m.to_user_id = auth.uid())
    )
  )
);