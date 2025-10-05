import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { Package, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SellerRequest {
  status: 'pending' | 'approved' | 'rejected';
}

interface Product {
  id: string;
  name: string;
  price_retail: number;
  stock: number;
  is_approved: boolean;
  approval_notes: string | null;
  image_url: string | null;
  created_at: string;
}

export const SellerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [sellerRequest, setSellerRequest] = useState<SellerRequest | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSellerData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchSellerData = async () => {
    try {
      // Check seller request status
      const { data: requestData } = await supabase
        .from('seller_requests')
        .select('status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (requestData) {
        setSellerRequest(requestData as SellerRequest);

        // If approved, fetch their products
        if (requestData.status === 'approved') {
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user?.id)
            .order('created_at', { ascending: false });

          if (productsData) {
            setProducts(productsData as Product[]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!sellerRequest) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Become a Seller</CardTitle>
              <CardDescription>
                You need to submit a seller request to start listing products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-request">
                <Button>Submit Seller Request</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (sellerRequest.status !== 'approved') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Seller Request Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellerRequest.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span>Your seller request is pending review</span>
                </div>
              )}
              {sellerRequest.status === 'rejected' && (
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Your seller request was rejected</span>
                </div>
              )}
              <Link to="/my-seller-request">
                <Button variant="outline">View Request Details</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getApprovalBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500 text-white">
        <Clock className="h-3 w-3 mr-1" />
        Pending Approval
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Link to="/seller/add-product">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.is_approved).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => !p.is_approved).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Link to="/seller/add-product">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        {getApprovalBadge(product.is_approved)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>UGX {product.price_retail.toLocaleString()}</span>
                        <span>Stock: {product.stock}</span>
                        <span>Added {new Date(product.created_at).toLocaleDateString()}</span>
                      </div>
                      {product.approval_notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Admin Notes: {product.approval_notes}
                        </p>
                      )}
                    </div>
                    <Link to={`/seller/edit-product/${product.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
