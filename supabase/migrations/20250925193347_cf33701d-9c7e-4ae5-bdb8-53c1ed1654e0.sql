-- First fix existing data that violates constraints
UPDATE public.products 
SET discount_price = NULL 
WHERE discount_price IS NOT NULL AND discount_price >= price_retail;

-- Now add the constraints and sample data
ALTER TABLE public.products 
ADD CONSTRAINT check_positive_price_retail CHECK (price_retail > 0),
ADD CONSTRAINT check_positive_stock CHECK (stock >= 0),
ADD CONSTRAINT check_positive_wholesale_price CHECK (price_wholesale IS NULL OR price_wholesale > 0),
ADD CONSTRAINT check_positive_discount_price CHECK (discount_price IS NULL OR discount_price > 0),
ADD CONSTRAINT check_discount_less_than_retail CHECK (discount_price IS NULL OR discount_price < price_retail);

-- Add constraints for reviews
ALTER TABLE public.reviews 
ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5),
ADD CONSTRAINT check_reviewer_name_not_empty CHECK (LENGTH(TRIM(reviewer_name)) > 0);

-- Add constraints for orders
ALTER TABLE public.orders 
ADD CONSTRAINT check_positive_total_amount CHECK (total_amount > 0),
ADD CONSTRAINT check_phone_not_empty CHECK (LENGTH(TRIM(phone)) > 0),
ADD CONSTRAINT check_address_not_empty CHECK (LENGTH(TRIM(address)) > 0);

-- Add constraints for order items
ALTER TABLE public.order_items 
ADD CONSTRAINT check_positive_quantity CHECK (quantity > 0),
ADD CONSTRAINT check_positive_price CHECK (price > 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
CREATE INDEX IF NOT EXISTS idx_products_flash_sale_end ON public.products(flash_sale_end);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add sample reviews for existing products
INSERT INTO public.reviews (
  product_id,
  user_id,
  rating,
  comment,
  reviewer_name
)
SELECT 
  p.id,
  NULL,
  (FLOOR(RANDOM() * 5) + 1)::INTEGER,
  CASE 
    WHEN RANDOM() > 0.5 THEN 'Great product! Highly recommended.'
    WHEN RANDOM() > 0.3 THEN 'Good quality for the price.'
    ELSE 'Excellent service and fast delivery.'
  END,
  CASE 
    WHEN RANDOM() > 0.7 THEN 'John D.'
    WHEN RANDOM() > 0.4 THEN 'Sarah M.'
    ELSE 'Mike R.'
  END
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE reviews.product_id = p.id)
AND RANDOM() > 0.3
LIMIT 15;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_updated_at ON products;
CREATE TRIGGER trigger_update_product_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_updated_at();

DROP TRIGGER IF EXISTS trigger_update_profile_updated_at ON profiles;
CREATE TRIGGER trigger_update_profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();