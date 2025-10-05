import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, TrendingUp, Star, Clock } from 'lucide-react';

export const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products
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
          const flashSale = allProducts.filter(p => p.is_flash_sale) || [];
          const popular = allProducts.filter(p => p.is_popular) || [];
          const newArr = allProducts.filter(p => p.is_new_arrival) || [];
          const featured = allProducts.filter(p => p.is_featured) || [];
          
          const recentProducts = allProducts.slice(0, 20);

          setFlashSaleProducts(flashSale.length > 0 ? flashSale : recentProducts.slice(0, 12));
          setPopularProducts(popular.length > 0 ? popular : recentProducts.slice(0, 12));
          setNewArrivals(newArr.length > 0 ? newArr : recentProducts.slice(0, 12));
          setRecommendedProducts(featured.length > 0 ? featured : recentProducts.slice(0, 20));
        }

        if (categoriesData) setCategories(categoriesData.slice(0, 8));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const productsChannel = supabase
      .channel('products-home-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchData();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-home-changes')
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
      <div className="font-sans">
        {/* Categories Quick Access */}
        <section className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b py-2 md:py-3 shadow-sm">
          <div className="container mx-auto px-2 md:px-4">
            <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="flex-shrink-0 group"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-xs md:text-sm font-medium whitespace-nowrap">
                    {category.name}
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
              <Link to="/products" className="flex-shrink-0">
                <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-medium whitespace-nowrap">
                  View All
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Flash Sale Section */}
        {!loading && flashSaleProducts.length > 0 && (
          <section className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 py-4 md:py-6">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-500 p-1.5 md:p-2 rounded-lg">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-xl font-bold font-poppins text-red-600 dark:text-red-400">
                      Flash Sale
                    </h2>
                    <p className="text-xs text-muted-foreground hidden md:block">Limited time offers</p>
                  </div>
                  <div className="bg-red-500 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full animate-pulse">
                    HOT
                  </div>
                </div>
                <Link to="/deals" className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                  More <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </div>
              <ProductCarousel products={flashSaleProducts} loading={loading} />
            </div>
          </section>
        )}

        {/* Popular Products */}
        {!loading && popularProducts.length > 0 && (
          <section className="py-4 md:py-6">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <h2 className="text-base md:text-xl font-bold font-poppins">Popular Products</h2>
                </div>
                <Link to="/products" className="text-xs md:text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  More <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </div>
              <ProductCarousel products={popularProducts} loading={loading} />
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {!loading && newArrivals.length > 0 && (
          <section className="bg-muted/30 py-4 md:py-6">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                  <h2 className="text-base md:text-xl font-bold font-poppins">New Arrivals</h2>
                </div>
                <Link to="/products" className="text-xs md:text-sm font-medium text-primary hover:underline flex items-center gap-1">
                  More <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </div>
              <ProductCarousel products={newArrivals} loading={loading} />
            </div>
          </section>
        )}

        {/* Recommended for You - Grid View */}
        {!loading && recommendedProducts.length > 0 && (
          <section className="py-4 md:py-6">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <h2 className="text-base md:text-xl font-bold font-poppins">Recommended for You</h2>
                </div>
              </div>
              <ProductGrid products={recommendedProducts} loading={loading} />
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};
