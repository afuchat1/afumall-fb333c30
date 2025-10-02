import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { Clock, Zap } from 'lucide-react';

export const Deals = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // Fetch flash sale products (active flash sales)
        const { data: flashSaleData } = await supabase
          .from('products')
          .select('*')
          .not('flash_sale_end', 'is', null)
          .gt('flash_sale_end', new Date().toISOString())
          .order('flash_sale_end', { ascending: true });

        // Fetch discounted products
        const { data: discountedData } = await supabase
          .from('products')
          .select('*')
          .not('discount_price', 'is', null)
          .order('created_at', { ascending: false });

        if (flashSaleData) setFlashSaleProducts(flashSaleData);
        if (discountedData) setDiscountedProducts(discountedData);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();

    // Real-time subscription for product updates
    const dealsChannel = supabase
      .channel('deals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchDeals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dealsChannel);
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Flash Sales */}
        {flashSaleProducts.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="h-6 w-6 text-sale" />
              <h1 className="text-3xl font-bold">Flash Sales</h1>
              <Badge className="bg-sale text-sale-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Limited Time
              </Badge>
            </div>
            <ProductGrid products={flashSaleProducts} loading={loading} />
          </section>
        )}

        {/* Regular Deals */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-2xl font-bold">Special Offers</h2>
            <Badge variant="secondary">Save More</Badge>
          </div>
          <ProductGrid products={discountedProducts} loading={loading} />
        </section>

        {flashSaleProducts.length === 0 && discountedProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No deals available</h2>
            <p className="text-muted-foreground">
              Check back later for amazing deals and discounts!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};