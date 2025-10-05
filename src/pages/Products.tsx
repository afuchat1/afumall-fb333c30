import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { AISearch } from '@/components/products/AISearch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiRanking, setAiRanking] = useState(false);
  const { toast } = useToast();
  
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      if (aiSearchActive) return;
      
      setLoading(true);
      try {
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
        if (productsData) setProducts(productsData);
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
        toast({
          title: "AI ranking failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setProducts(data.products || products);
      toast({
        title: "AI Ranking Applied",
        description: "Products intelligently rearranged",
      });
    } catch (error) {
      console.error('AI ranking error:', error);
      toast({
        title: "Ranking failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setAiRanking(false);
    }
  };

  const handleSearchResults = (searchResults: Product[]) => {
    setProducts(searchResults);
    setAiSearchActive(true);
  };

  const handleResetSearch = () => {
    setAiSearchActive(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold">All Products</h1>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
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

        <AISearch 
          onResults={handleSearchResults} 
          onLoading={setLoading}
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {aiSearchActive && (
            <Button onClick={handleResetSearch} variant="outline">
              Show All Products
            </Button>
          )}
          <Button 
            onClick={handleAIRanking} 
            disabled={aiRanking || loading}
            variant="secondary"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {aiRanking ? 'Ranking...' : 'AI Smart Sort'}
          </Button>
        </div>

        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Search results for "{searchQuery}" ({products.length} products found)
            </p>
          </div>
        )}

        <ProductGrid products={products} loading={loading} />
      </div>
    </Layout>
  );
};