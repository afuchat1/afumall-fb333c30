-- Optimize RLS policies for better performance
-- Fix auth_rls_initplan warnings by wrapping auth.uid() in SELECT
-- Consolidate multiple permissive policies

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users manage own profile" ON public.profiles
FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (is_admin((select auth.uid())));

-- ORDERS TABLE
DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

CREATE POLICY "Users can view their orders" ON public.orders
FOR SELECT USING ((select auth.uid()) = user_id OR is_admin((select auth.uid())));

CREATE POLICY "Users can create orders" ON public.orders
FOR INSERT WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL USING (is_admin((select auth.uid())));

-- ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "Order items access" ON public.order_items;
DROP POLICY IF EXISTS "Order items creation" ON public.order_items;

CREATE POLICY "Order items access" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = (select auth.uid()) OR is_admin((select auth.uid())))
  )
);

CREATE POLICY "Order items creation" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND ((select auth.uid()) = orders.user_id OR orders.user_id IS NULL)
  )
);

-- CATEGORIES TABLE
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Everyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (is_admin((select auth.uid())));

-- PRODUCTS TABLE
DROP POLICY IF EXISTS "Everyone can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can create products" ON public.products;

CREATE POLICY "Everyone can view products" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Sellers manage own products" ON public.products
FOR ALL USING ((select auth.uid()) = seller_id);

CREATE POLICY "Approved sellers can create products" ON public.products
FOR INSERT WITH CHECK (
  (select auth.uid()) = seller_id 
  AND EXISTS (
    SELECT 1 FROM seller_requests
    WHERE seller_requests.user_id = (select auth.uid())
    AND seller_requests.status = 'approved'
  )
);

CREATE POLICY "Admins can manage products" ON public.products
FOR ALL USING (is_admin((select auth.uid())));

-- PRODUCT_IMAGES TABLE
DROP POLICY IF EXISTS "Everyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;

CREATE POLICY "Everyone can view product images" ON public.product_images
FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" ON public.product_images
FOR ALL USING (is_admin((select auth.uid())));

-- PRODUCT_VARIANTS TABLE
DROP POLICY IF EXISTS "Everyone can view product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;

CREATE POLICY "Everyone can view product variants" ON public.product_variants
FOR SELECT USING (true);

CREATE POLICY "Admins can manage product variants" ON public.product_variants
FOR ALL USING (is_admin((select auth.uid())));

-- REVIEWS TABLE
DROP POLICY IF EXISTS "Everyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

CREATE POLICY "Everyone can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews" ON public.reviews
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reviews" ON public.reviews
FOR ALL USING (is_admin((select auth.uid())));

-- PRODUCT_INQUIRIES TABLE
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.product_inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.product_inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.product_inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.product_inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.product_inquiries;

CREATE POLICY "Users can view inquiries" ON public.product_inquiries
FOR SELECT USING ((select auth.uid()) = user_id OR user_id IS NULL OR is_admin((select auth.uid())));

CREATE POLICY "Anyone can create inquiries" ON public.product_inquiries
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins manage inquiries" ON public.product_inquiries
FOR ALL USING (is_admin((select auth.uid())));

-- SELLER_REQUESTS TABLE
DROP POLICY IF EXISTS "Users can view their own seller requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Users can create seller requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Admins can view all seller requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Admins can update seller requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Admins can delete seller requests" ON public.seller_requests;

CREATE POLICY "Users manage own seller requests" ON public.seller_requests
FOR ALL USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins manage all seller requests" ON public.seller_requests
FOR ALL USING (is_admin((select auth.uid())));

-- DELIVERY_ZONES TABLE
DROP POLICY IF EXISTS "Everyone can view delivery zones" ON public.delivery_zones;
DROP POLICY IF EXISTS "Admins can manage delivery zones" ON public.delivery_zones;

CREATE POLICY "Everyone can view delivery zones" ON public.delivery_zones
FOR SELECT USING (true);

CREATE POLICY "Admins can manage delivery zones" ON public.delivery_zones
FOR ALL USING (is_admin((select auth.uid())));