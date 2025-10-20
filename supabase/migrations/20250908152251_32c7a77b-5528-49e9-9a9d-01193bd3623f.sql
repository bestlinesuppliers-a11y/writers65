-- Convert info365writers@gmail.com to admin role
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'info365writers@gmail.com';