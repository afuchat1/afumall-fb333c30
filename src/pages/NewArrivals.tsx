import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layout } from '@/components/layout/Layout';
import { Star, Sparkles } from 'lucide-react';

export const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_new_arrival', true)
          .order('created_at', { ascending: false });

        if (data) setProducts(data);
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();

    const channel = supabase
      .channel('new-arrivals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchNewArrivals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              New Arrivals
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </h1>
            <p className="text-sm text-muted-foreground">Fresh products just for you</p>
          </div>
        </div>

        {!loading && products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No new arrivals yet</h2>
            <p className="text-muted-foreground">
              Check back soon for the latest products!
            </p>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </Layout>
  );
};
