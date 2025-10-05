import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFilters, FilterOptions } from '@/components/products/ProductFilters';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [aiSearchActive, setAiSearchActive] = useState(false);
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
  
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      if (aiSearchActive) return;
      
      setLoading(true);
      try {
        // Check for AI search results from sessionStorage
        const aiResults = sessionStorage.getItem('aiSearchResults');
        const aiQuery = sessionStorage.getItem('aiSearchQuery');
        
        if (aiResults && aiQuery) {
          const parsedProducts = JSON.parse(aiResults);
          setProducts(parsedProducts);
          setAiSearchActive(true);
          sessionStorage.removeItem('aiSearchResults');
          sessionStorage.removeItem('aiSearchQuery');
          setLoading(false);
          return;
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Build products query
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data: productsData } = await query;

        if (categoriesData) setCategories(categoriesData);
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const productsChannel = supabase
      .channel('products-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, [selectedCategory, searchQuery, aiSearchActive]);

  const handleCategoryChange = (categoryId: string) => {
    setAiSearchActive(false);
    const params = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryId);
    }
    setSearchParams(params);
  };

  const handleAIRanking = async () => {
    if (products.length === 0) return;
    
    setAiRanking(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-rank-products', {
        body: { 
          products,
          context: 'product listing page - intelligently rank by popularity, recency, pricing, and relevance'
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error('AI ranking failed: ' + data.error);
        return;
      }

      setProducts(data.products || products);
      toast.success('AI Ranking Applied - Products intelligently rearranged');
    } catch (error) {
      console.error('AI ranking error:', error);
      toast.error('Ranking failed. Please try again');
    } finally {
      setAiRanking(false);
    }
  };

  const handleResetSearch = () => {
    setAiSearchActive(false);
    sessionStorage.removeItem('aiSearchResults');
    sessionStorage.removeItem('aiSearchQuery');
    navigate('/products', { replace: true });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    const price = Number(product.discount_price || product.price_retail);
    
    // Price range filter
    if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
      return false;
    }

    // Stock filter
    if (filters.inStock && product.stock <= 0) {
      return false;
    }

    // Tag filters
    if (filters.isNewArrival && !product.is_new_arrival) return false;
    if (filters.isFeatured && !product.is_featured) return false;
    if (filters.isPopular && !product.is_popular) return false;
    if (filters.isFlashSale && !product.is_flash_sale) return false;

    return true;
  });

  return (
    <Layout>
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-6 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-0">
          <h1 className="text-xl md:text-3xl font-bold font-heading">All Products</h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ProductFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              maxPrice={maxPrice}
            />
            <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="flex-1 md:w-48 h-9 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
          {aiSearchActive && (
            <Button onClick={handleResetSearch} variant="outline" size="sm" className="gap-1">
              <X className="h-3 w-3" />
              Clear AI Search
            </Button>
          )}
          <Button 
            onClick={handleAIRanking} 
            disabled={aiRanking || loading}
            variant="secondary"
            size="sm"
            className="gap-1"
          >
            <Sparkles className="h-3 w-3" />
            {aiRanking ? 'Ranking...' : 'AI Smart Sort'}
          </Button>
        </div>

        {searchQuery && (
          <div className="mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-muted-foreground">
              Search results for "{searchQuery}" ({filteredProducts.length} products found)
            </p>
          </div>
        )}

        {aiSearchActive && (
          <div className="mb-4 md:mb-6">
            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Search Results ({filteredProducts.length} products)
            </p>
          </div>
        )}

        <ProductGrid products={filteredProducts} loading={loading} />
      </div>
    </Layout>
  );
};