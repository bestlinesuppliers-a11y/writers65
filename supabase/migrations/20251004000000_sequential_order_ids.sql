CREATE SEQUENCE public.orders_id_seq START 4357;

-- Drop foreign key constraints that depend on orders.id
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_order_id_fkey;
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_order_id_fkey;

-- Change the data type of orders.id
ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN id SET DATA TYPE BIGINT;
ALTER TABLE public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq');

-- Update the sequence ownership
ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;

-- Change the data type of foreign key columns
ALTER TABLE public.bids ALTER COLUMN order_id SET DATA TYPE BIGINT;
ALTER TABLE public.submissions ALTER COLUMN order_id SET DATA TYPE BIGINT;

-- Re-add foreign key constraints
ALTER TABLE public.bids ADD CONSTRAINT bids_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE public.submissions ADD CONSTRAINT submissions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);

-- Create the RPC function for creating an order
CREATE OR REPLACE FUNCTION create_order_and_get_id(p_title TEXT, p_description TEXT, p_category TEXT, p_academic_level TEXT, p_words INT, p_pages INT, p_deadline TIMESTAMPTZ, p_instructions TEXT, p_referencing_style TEXT, p_budget_usd NUMERIC, p_client_id UUID, p_sources INT)
RETURNS BIGINT AS $$
DECLARE
  new_order_id BIGINT;
BEGIN
  INSERT INTO public.orders (title, description, category, academic_level, words, pages, deadline, instructions, referencing_style, budget_usd, client_id, sources, status)
  VALUES (p_title, p_description, p_category, p_academic_level, p_words, p_pages, p_deadline, p_instructions, p_referencing_style, p_budget_usd, p_client_id, p_sources, 'pending_payment')
  RETURNING id INTO new_order_id;
  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_and_get_id(TEXT, TEXT, TEXT, TEXT, INT, INT, TIMESTAMPTZ, TEXT, TEXT, NUMERIC, UUID, INT) TO authenticated;
