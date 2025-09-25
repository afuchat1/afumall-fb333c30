-- Fix infinite recursion in RLS policies by creating security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new admin policy using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Add boolean fields where appropriate (example: active status for products)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add boolean field for profile verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Update other admin policies to use the security definer function
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can moderate reviews" ON public.reviews;
CREATE POLICY "Admins can moderate reviews" 
ON public.reviews 
FOR ALL 
USING (public.get_current_user_role() = 'admin');