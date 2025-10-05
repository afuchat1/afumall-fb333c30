import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp, Star, Zap } from 'lucide-react';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        {/* Flash Sale Section */}
        {!loading && featuredProducts.length > 0 && (
          <section className="bg-gradient-to-r from-sale/10 to-accent/10 py-4 md:py-6 animate-fade-in">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3 animate-scale-in">
                  <div className="p-1.5 md:p-2 bg-accent/20 rounded-lg">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold">Flash Sale</h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Limited time offers</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground text-[10px] md:text-xs px-2 py-0.5 animate-pulse">
                    HOT
                  </Badge>
                </div>
                <Link to="/deals">
                  <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all text-xs md:text-sm h-7 md:h-9">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </Link>
              </div>
              <ProductCarousel products={featuredProducts} loading={loading} />
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="container mx-auto px-2 md:px-4 animate-fade-in">
          <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
            {categories.map((category, index) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <Card 
                  className="hover:shadow-lg hover:border-accent hover:scale-105 transition-all cursor-pointer rounded-2xl group"
                  style={{
                    animation: `scale-in 0.4s ease-out ${index * 0.1}s both`
                  }}
                >
                  <CardContent className="p-3 md:p-5 text-center">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 group-hover:bg-accent/20 transition-colors overflow-hidden">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg md:text-2xl">📱</span>
                      )}
                    </div>
                    <h3 className="font-medium text-xs md:text-sm truncate px-1">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Products */}
        {!loading && popularProducts.length > 0 && (
          <section className="container mx-auto px-2 md:px-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">Popular Products</h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Trending now</p>
                </div>
              </div>
              <Link to="/products">
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all text-xs md:text-sm h-7 md:h-9">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </Link>
            </div>
            <ProductCarousel products={popularProducts} loading={loading} />
          </section>
        )}

        {/* New Arrivals */}
        {!loading && newArrivals.length > 0 && (
          <section className="bg-card py-4 md:py-6 animate-fade-in">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="p-1.5 md:p-2 bg-secondary/50 rounded-lg">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold">New Arrivals</h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Fresh from the store</p>
                  </div>
                </div>
                <Link to="/products">
                  <Button variant="outline" size="sm" className="hover:bg-secondary hover:text-secondary-foreground hover:scale-105 transition-all text-xs md:text-sm h-7 md:h-9">
                    View All
                    <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </Link>
              </div>
              <ProductCarousel products={newArrivals} loading={loading} />
            </div>
          </section>
        )}

        {/* Recommended for You */}
        {!loading && products.length > 0 && (
          <section className="container mx-auto px-2 md:px-4 pb-4 md:pb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">Recommended for You</h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Handpicked selections</p>
                </div>
              </div>
              <Link to="/products">
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all text-xs md:text-sm h-7 md:h-9">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </Link>
            </div>
            <ProductCarousel products={products} loading={loading} />
          </section>
        )}
      </div>
    </Layout>
  );
};