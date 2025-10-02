import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch featured products (products with discounts)
        const { data: featuredData } = await supabase
          .from('products')
          .select('*')
          .not('discount_price', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);

        if (categoriesData) setCategories(categoriesData);
        if (productsData) setProducts(productsData);
        if (featuredData) setFeaturedProducts(featuredData);
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
      <div className="space-y-8">
        {/* Flash Sale Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-gradient-to-r from-sale/10 to-accent/10 py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <h2 className="text-2xl font-bold">Flash Sale</h2>
                  <Badge className="bg-accent text-accent-foreground">
                    Limited Time
                  </Badge>
                </div>
                <Link to="/deals">
                  <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <ProductGrid products={featuredProducts.slice(0, 4)} loading={loading} />
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.id}`}>
                <Card className="hover:shadow-lg hover:border-accent transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Today's Deals */}
        <section className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Today's Deals</h2>
              <Link to="/deals">
                <Button variant="outline" size="sm" className="hover:bg-accent hover:text-accent-foreground hover:border-accent">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ProductGrid products={products.slice(0, 8)} loading={loading} />
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link to="/products">
              <Button variant="outline" size="sm" className="hover:bg-accent hover:text-accent-foreground hover:border-accent">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ProductGrid products={products.slice(8, 16)} loading={loading} />
        </section>
      </div>
    </Layout>
  );
};