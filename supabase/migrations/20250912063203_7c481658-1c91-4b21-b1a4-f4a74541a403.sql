-- Create security definer functions to avoid infinite recursion

-- Function to check if user is assigned to an order
CREATE OR REPLACE FUNCTION public.is_writer_assigned_to_order(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments 
    WHERE order_id = _order_id AND writer_id = _user_id
  );
$$;

-- Function to check if user owns an order
CREATE OR REPLACE FUNCTION public.is_order_owner(_order_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = _order_id AND client_id = _user_id
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Assigned writers can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Clients can view assignments for their orders" ON public.assignments;

-- Create new policies using the security definer functions
CREATE POLICY "Writers can view orders they are assigned to" 
ON public.orders 
FOR SELECT 
USING (public.is_writer_assigned_to_order(id, auth.uid()));

CREATE POLICY "Clients can view assignments for orders they own" 
ON public.assignments 
FOR SELECT 
USING (public.is_order_owner(order_id, auth.uid()));