import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { AISearch } from '@/components/products/AISearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp, Star, Zap, Sparkles } from 'lucide-react';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products first
        const { data: allProducts } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (allProducts && allProducts.length > 0) {
          // Filter products by flags, with fallback to all products
          const flashSaleProducts = allProducts.filter(p => p.is_flash_sale) || [];
          const popularProds = allProducts.filter(p => p.is_popular) || [];
          const newArrivalProds = allProducts.filter(p => p.is_new_arrival) || [];
          const featuredProds = allProducts.filter(p => p.is_featured) || [];

          // Fallback: if no products with specific flags, show recent products
          const recentProducts = allProducts.slice(0, 12);

          setFeaturedProducts(flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 12) : recentProducts);
          setPopularProducts(popularProds.length > 0 ? popularProds.slice(0, 12) : recentProducts);
          setNewArrivals(newArrivalProds.length > 0 ? newArrivalProds.slice(0, 12) : recentProducts);
          setProducts(featuredProds.length > 0 ? featuredProds.slice(0, 12) : recentProducts);
        }

        if (categoriesData) setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, []);

  const handleSearchResults = (searchResults: Product[]) => {
    sessionStorage.setItem('aiSearchResults', JSON.stringify(searchResults));
    navigate('/products');
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section with AI Search */}
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Discover Amazing Products
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Shop smarter with AI-powered search and intelligent recommendations
                </p>
              </div>
              
              <div className="animate-scale-in">
                <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border">
                  <div className="flex items-center gap-2 mb-4 justify-center">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="text-sm font-medium">AI-Powered Search</span>
                  </div>
                  <AISearch onResults={handleSearchResults} onLoading={setLoading} />
                </div>
              </div>

              <div className="pt-6">
                <Link to="/products">
                  <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
                    Browse All Products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {!loading && featuredProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 space-y-2 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked selections just for you</p>
              </div>
              <ProductCarousel products={featuredProducts} loading={loading} />
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};