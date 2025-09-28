-- Create proper role-based access control

-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
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
  )
$$;

-- 5. Update admin policies to use the role function
DROP POLICY "Only admins can manage categories" ON public.categories;
DROP POLICY "Only admins can manage products" ON public.products;
DROP POLICY "Only admins can manage orders" ON public.orders;

-- Create proper admin policies
CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products" ON public.products
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage reviews
CREATE POLICY "Admins can manage reviews" ON public.reviews
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table to remove role column and add policy for admins
ALTER TABLE public.profiles DROP COLUMN role;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));