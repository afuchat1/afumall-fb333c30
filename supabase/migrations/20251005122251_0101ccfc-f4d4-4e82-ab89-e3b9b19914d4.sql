-- Create product_images table for multiple product images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_variants table for colors and sizes
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  sku TEXT,
  stock INTEGER DEFAULT 0,
  price_adjustment NUMERIC DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery_zones table for location-based delivery charges
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  locations TEXT[] NOT NULL,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  min_days INTEGER DEFAULT 1,
  max_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images
CREATE POLICY "Everyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for product_variants
CREATE POLICY "Everyone can view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variants" ON product_variants FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for delivery_zones
CREATE POLICY "Everyone can view delivery zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery zones" ON delivery_zones FOR ALL USING (is_admin(auth.uid()));

-- Indexes for better performance
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_delivery_zones_locations ON delivery_zones USING GIN(locations);

-- Trigger for product_variants updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for delivery_zones updated_at
CREATE TRIGGER update_delivery_zones_updated_at
  BEFORE UPDATE ON delivery_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE product_images;
ALTER PUBLICATION supabase_realtime ADD TABLE product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_zones;