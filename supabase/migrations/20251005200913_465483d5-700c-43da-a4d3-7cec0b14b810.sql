-- Add seller tracking and approval to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS approval_notes text;

-- Create index for seller queries
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_approval ON public.products(is_approved);

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
DROP POLICY IF EXISTS "Approved sellers can create products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;

-- Update RLS policies for seller product management
CREATE POLICY "Sellers can view their own products"
ON public.products
FOR SELECT
USING (auth.uid() = seller_id OR is_approved = true);

CREATE POLICY "Approved sellers can create products"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id 
  AND EXISTS (
    SELECT 1 FROM public.seller_requests 
    WHERE user_id = auth.uid() 
    AND status = 'approved'
  )
);

CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
USING (auth.uid() = seller_id);