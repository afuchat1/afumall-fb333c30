-- Fix security warnings

-- 1. Update the function to have a stable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add missing RLS policies for order_items table
CREATE POLICY "Users can view order items for their orders" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Add sample data for testing
INSERT INTO public.categories (name) VALUES 
  ('Electronics'),
  ('Clothing'),
  ('Books'),
  ('Home & Garden'),
  ('Sports');

INSERT INTO public.products (name, description, category_id, price_retail, price_wholesale, stock, image_url) 
SELECT 
  'Sample Product ' || generate_series,
  'Description for sample product ' || generate_series,
  (SELECT id FROM public.categories ORDER BY random() LIMIT 1),
  (random() * 100 + 10)::decimal(10,2),
  (random() * 80 + 5)::decimal(10,2),
  floor(random() * 100 + 1)::integer,
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
FROM generate_series(1, 10);