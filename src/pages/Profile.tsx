import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { User, Package, Clock, CheckCircle, Truck, Settings, MapPin, Phone, Mail, Calendar, ShoppingBag } from 'lucide-react';

export const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrdersLoading(false);
        return;
      }

      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersData) setOrders(ordersData as any);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();

    if (user) {
      const ordersChannel = supabase
        .channel(`user-${user.id}-orders`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />;
      case 'paid':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'shipped':
        return <Truck className="h-3.5 w-3.5" />;
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5" />;
      default:
        return <Package className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'paid':
        return 'bg-blue-500 text-white';
      case 'shipped':
        return 'bg-purple-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const orderStats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        {/* Profile Header - Alibaba Style */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-lg">
                <User className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile?.name || 'User'}</h1>
                <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  {profile?.is_admin && (
                    <Badge className="bg-accent text-accent-foreground">Administrator</Badge>
                  )}
                </div>
              </div>
              <Link to="/profile?tab=settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="bg-background border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Order Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-3xl font-bold mt-2">{orders.length}</p>
                      </div>
                      <ShoppingBag className="h-10 w-10 text-primary/20" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-3xl font-bold mt-2">{orderStats.pending}</p>
                      </div>
                      <Clock className="h-10 w-10 text-yellow-500/20" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                        <p className="text-3xl font-bold mt-2">{orderStats.shipped}</p>
                      </div>
                      <Truck className="h-10 w-10 text-blue-500/20" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-3xl font-bold mt-2">{orderStats.completed}</p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-500/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                        <p className="font-medium mt-1">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="font-medium mt-1">{profile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Default Address</p>
                        <p className="font-medium mt-1">{profile?.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <Link to="/profile?tab=orders">
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </div>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <span className="text-sm text-muted-foreground">
                              {order.order_items?.length || 0} item(s)
                            </span>
                            <span className="font-semibold">UGX {order.total_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Link to="/products">
                        <Button className="mt-4">Start Shopping</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="bg-background">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">All Orders</h3>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-base">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1.5 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                                <span className="font-medium">{item.products?.name}</span>
                                <span className="text-muted-foreground">
                                  × {item.quantity} = UGX {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between items-center pt-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Payment: </span>
                              <span className="capitalize font-medium">{order.checkout_method}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                              <p className="text-xl font-bold text-primary">UGX {order.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Start shopping to see your orders here
                      </p>
                      <Link to="/products">
                        <Button size="lg">Browse Products</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};