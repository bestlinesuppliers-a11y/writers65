-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('client', 'writer', 'admin');

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pending_payment', 'available', 'assigned', 'in_progress', 'submitted', 'revision_requested', 'completed', 'disputed', 'cancelled');

-- Create invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('unpaid', 'pending', 'paid', 'refunded');

-- Create dispute status enum
CREATE TYPE public.dispute_status AS ENUM ('open', 'in_review', 'resolved', 'closed');

-- Create academic level enum
CREATE TYPE public.academic_level AS ENUM ('high_school', 'undergraduate', 'masters', 'phd', 'professional');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'client',
    email_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending'))
);

-- Create writer profiles table
CREATE TABLE public.writer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2),
    per_page_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    completed_orders INTEGER DEFAULT 0,
    availability BOOLEAN DEFAULT TRUE,
    portfolio_items TEXT[] DEFAULT '{}',
    payout_method TEXT CHECK (payout_method IN ('bank', 'mpesa', 'paypal')),
    payout_details JSONB,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    academic_level academic_level NOT NULL,
    pages INTEGER NOT NULL CHECK (pages > 0),
    words INTEGER NOT NULL CHECK (words > 0),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    instructions TEXT,
    referencing_style TEXT,
    attachments TEXT[] DEFAULT '{}',
    budget_usd DECIMAL(10,2) NOT NULL CHECK (budget_usd > 0),
    status order_status DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create assignments table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    writer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    files TEXT[] DEFAULT '{}',
    message TEXT,
    is_final BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested', 'rejected'))
);

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_usd DECIMAL(10,2) NOT NULL CHECK (amount_usd > 0),
    currency TEXT DEFAULT 'USDT-TRC20',
    payment_address TEXT DEFAULT 'TZDnBFWrQEzPuejZvYcQk9uegXWRT3fHd4',
    status invoice_status DEFAULT 'unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    notes TEXT
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT,
    body TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create disputes table
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    opened_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status dispute_status DEFAULT 'open',
    resolution TEXT,
    resolved_by_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for writer_profiles
CREATE POLICY "Writers can manage their own profile" ON public.writer_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view verified writer profiles" ON public.writer_profiles
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Admins can manage all writer profiles" ON public.writer_profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Clients can manage their own orders" ON public.orders
    FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "Verified writers can view available orders" ON public.orders
    FOR SELECT USING (
        status = 'available' AND 
        EXISTS (SELECT 1 FROM public.writer_profiles 
                WHERE user_id = auth.uid() 
                AND verification_status = 'verified')
    );

CREATE POLICY "Assigned writers can view their orders" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.assignments 
                WHERE order_id = orders.id 
                AND writer_id = auth.uid())
    );

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for assignments
CREATE POLICY "Writers can view their assignments" ON public.assignments
    FOR SELECT USING (auth.uid() = writer_id);

CREATE POLICY "Clients can view assignments for their orders" ON public.assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders 
                WHERE id = assignments.order_id 
                AND client_id = auth.uid())
    );

CREATE POLICY "Admins can manage all assignments" ON public.assignments
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for submissions
CREATE POLICY "Writers can manage their submissions" ON public.submissions
    FOR ALL USING (auth.uid() = writer_id);

CREATE POLICY "Clients can view submissions for their orders" ON public.submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.orders 
                WHERE id = submissions.order_id 
                AND client_id = auth.uid())
    );

CREATE POLICY "Admins can manage all submissions" ON public.submissions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for invoices
CREATE POLICY "Clients can manage their invoices" ON public.invoices
    FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "Admins can manage all invoices" ON public.invoices
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages in orders they're involved in" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id AND (
            EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND client_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.assignments WHERE order_id = messages.order_id AND writer_id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for disputes
CREATE POLICY "Order participants can view disputes" ON public.disputes
    FOR SELECT USING (
        auth.uid() = opened_by_id OR
        EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND client_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.assignments WHERE order_id = disputes.order_id AND writer_id = auth.uid())
    );

CREATE POLICY "Order participants can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (
        auth.uid() = opened_by_id AND (
            EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND client_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.assignments WHERE order_id = disputes.order_id AND writer_id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage all disputes" ON public.disputes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('order-attachments', 'order-attachments', false),
    ('submissions', 'submissions', false),
    ('writer-portfolios', 'writer-portfolios', false),
    ('message-attachments', 'message-attachments', false),
    ('verification-docs', 'verification-docs', false);

-- Storage policies for order attachments
CREATE POLICY "Clients can upload attachments for their orders" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'order-attachments' AND
        EXISTS (SELECT 1 FROM public.orders 
                WHERE id::text = (storage.foldername(name))[1] 
                AND client_id = auth.uid())
    );

CREATE POLICY "Order participants can view attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'order-attachments' AND (
            EXISTS (SELECT 1 FROM public.orders 
                    WHERE id::text = (storage.foldername(name))[1] 
                    AND client_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.assignments a
                    JOIN public.orders o ON a.order_id = o.id
                    WHERE o.id::text = (storage.foldername(name))[1] 
                    AND a.writer_id = auth.uid())
        )
    );

-- Storage policies for submissions
CREATE POLICY "Writers can upload submission files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'submissions' AND
        EXISTS (SELECT 1 FROM public.assignments 
                WHERE order_id::text = (storage.foldername(name))[1] 
                AND writer_id = auth.uid())
    );

CREATE POLICY "Order participants can view submission files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'submissions' AND (
            EXISTS (SELECT 1 FROM public.orders 
                    WHERE id::text = (storage.foldername(name))[1] 
                    AND client_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.assignments 
                    WHERE order_id::text = (storage.foldername(name))[1] 
                    AND writer_id = auth.uid())
        )
    );

-- Storage policies for writer portfolios
CREATE POLICY "Writers can manage their portfolio files" ON storage.objects
    FOR ALL USING (
        bucket_id = 'writer-portfolios' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Everyone can view portfolio files" ON storage.objects
    FOR SELECT USING (bucket_id = 'writer-portfolios');

-- Storage policies for verification documents
CREATE POLICY "Writers can upload verification docs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'verification-docs' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins can view verification docs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-docs' AND
        public.has_role(auth.uid(), 'admin')
    );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_writer_profiles_updated_at BEFORE UPDATE ON public.writer_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();