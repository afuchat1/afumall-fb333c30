import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ShoppingCart, Package, Users, TrendingUp, MessageCircle, Store } from 'lucide-react';
import { AdminProductManager } from '@/components/admin/AdminProductManager';
import { AdminOrderManager } from '@/components/admin/AdminOrderManager';
import { AdminCategoryManager } from '@/components/admin/AdminCategoryManager';
import { AdminReviewManager } from '@/components/admin/AdminReviewManager';
import { AdminInquiryManager } from '@/components/admin/AdminInquiryManager';
import { AdminSellerRequestManager } from '@/components/admin/AdminSellerRequestManager';

export const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchStats();

      // Real-time subscriptions for stats
      const ordersChannel = supabase
        .channel('admin-orders-stats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchStats();
        })
        .subscribe();

      const productsChannel = supabase
        .channel('admin-products-stats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchStats();
        })
        .subscribe();

      const profilesChannel = supabase
        .channel('admin-profiles-stats')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(productsChannel);
        supabase.removeChannel(profilesChannel);
      };
    }
  }, [user, isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch orders count and total revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount');
      
      if (ordersError) throw ordersError;
      
      // Fetch products count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id');
      
      if (productsError) throw productsError;
      
      // Fetch users count
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (profilesError) throw profilesError;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        totalProducts: products?.length || 0,
        totalUsers: profiles?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  return (
    <AuthGuard adminOnly>
      <Layout>
        <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="secondary">Administrator</Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Products in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="products" className="text-xs md:text-sm">Products</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs md:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs md:text-sm">Reviews</TabsTrigger>
            <TabsTrigger value="inquiries" className="text-xs md:text-sm">
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden md:inline">Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="text-xs md:text-sm">
              <Store className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden md:inline">Sellers</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <AdminProductManager />
          </TabsContent>
          
          <TabsContent value="orders">
            <AdminOrderManager />
          </TabsContent>
          
          <TabsContent value="categories">
            <AdminCategoryManager />
          </TabsContent>
          
          <TabsContent value="reviews">
            <AdminReviewManager />
          </TabsContent>
          
          <TabsContent value="inquiries">
            <AdminInquiryManager />
          </TabsContent>
          
          <TabsContent value="sellers">
            <AdminSellerRequestManager />
          </TabsContent>
        </Tabs>
        </div>
      </Layout>
    </AuthGuard>
  );
};