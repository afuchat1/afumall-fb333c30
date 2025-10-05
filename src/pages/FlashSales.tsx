import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layout } from '@/components/layout/Layout';
import { Zap, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const FlashSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_flash_sale', true)
          .not('flash_sale_end', 'is', null)
          .gt('flash_sale_end', new Date().toISOString())
          .order('flash_sale_end', { ascending: true });

        if (data) setProducts(data);
      } catch (error) {
        console.error('Error fetching flash sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();

    const channel = supabase
      .channel('flash-sales-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchFlashSales();
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
          <div className="bg-red-500 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Flash Sales</h1>
            <p className="text-sm text-muted-foreground">Limited time offers - Don't miss out!</p>
          </div>
          <Badge className="bg-red-500 text-white animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Limited Time
          </Badge>
        </div>

        {!loading && products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No flash sales available</h2>
            <p className="text-muted-foreground">
              Check back later for amazing deals!
            </p>
          </div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </Layout>
  );
};
