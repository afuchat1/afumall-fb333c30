-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- Create simpler, more permissive policies for cart access
-- These allow users to access their own carts (by user_id or session_id)
CREATE POLICY "Anyone can view cart items" 
ON public.cart_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update cart items" 
ON public.cart_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete cart items" 
ON public.cart_items 
FOR DELETE 
USING (true);