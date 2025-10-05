import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category as CategoryType } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layout } from '@/components/layout/Layout';
import { ProductFilters, FilterOptions } from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const Category = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiRanking, setAiRanking] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    inStock: false,
    isNewArrival: false,
    isFeatured: false,
    isPopular: false,
    isFlashSale: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch category
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        // Fetch products in this category
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', id)
          .order('created_at', { ascending: false });

        if (categoryData) setCategory(categoryData);
        if (productsData) {
          // Calculate max price for filters
          const prices = productsData.map(p => Number(p.price_retail));
          const calculatedMaxPrice = Math.ceil(Math.max(...prices, 100));
          setMaxPrice(calculatedMaxPrice);
          setFilters(prev => ({
            ...prev,
            priceRange: [0, calculatedMaxPrice]
          }));
          
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const categoryChannel = supabase
      .channel(`category-${id}-changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories',
        filter: `id=eq.${id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    const productsChannel = supabase
      .channel(`category-${id}-products-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(categoryChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [id]);

  const handleAIRanking = async () => {
    if (products.length === 0) return;
    
    setAiRanking(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rank-products', {
        body: { 
          products,
          context: `category page: ${category?.name} - intelligently rank products`
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error('AI ranking failed: ' + data.error);
        return;
      }

      setProducts(data.products || products);
      toast.success('AI Ranking Applied');
    } catch (error) {
      console.error('AI ranking error:', error);
      toast.error('Ranking failed');
    } finally {
      setAiRanking(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    const price = Number(product.discount_price || product.price_retail);
    
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
    if (filters.inStock && product.stock <= 0) return false;
    if (filters.isNewArrival && !product.is_new_arrival) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    if (filters.isPopular && !product.is_popular) return false;
    if (filters.isFlashSale && !product.is_flash_sale) return false;

    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-6 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-0">
          <div>
            <h1 className="text-xl md:text-3xl font-bold font-heading">{category?.name || 'Category'}</h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">
              {filteredProducts.length} products
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ProductFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              maxPrice={maxPrice}
            />
            <Button 
              onClick={handleAIRanking} 
              disabled={aiRanking || loading}
              variant="secondary"
              size="sm"
              className="gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {aiRanking ? 'Ranking...' : 'AI Sort'}
            </Button>
          </div>
        </div>

        <ProductGrid products={filteredProducts} loading={false} />
      </div>
    </Layout>
  );
};