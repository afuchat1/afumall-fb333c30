import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_retail: number;
  stock: number;
  is_approved: boolean;
  approval_notes: string | null;
  image_url: string | null;
  seller_id: string;
  created_at: string;
}

export const AdminProductApproval = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('product-approval-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .not('seller_id', 'is', null)
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data as Product[]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_approved: approved,
          approval_notes: approvalNotes || null,
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: approved ? "Product Approved" : "Product Rejected",
        description: `The product has been ${approved ? 'approved' : 'rejected'} successfully`,
      });

      setReviewingProduct(null);
      setApprovalNotes('');
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: "The product has been removed successfully",
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.is_approved) {
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

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  const pendingProducts = products.filter(p => !p.is_approved);
  const approvedProducts = products.filter(p => p.is_approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Approvals</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Pending: <strong className="text-yellow-600">{pendingProducts.length}</strong>
          </span>
          <span className="text-muted-foreground">
            Approved: <strong className="text-green-600">{approvedProducts.length}</strong>
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No seller products found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Price: UGX {product.price_retail.toLocaleString()}</span>
                        <span>Stock: {product.stock}</span>
                        <span>Submitted: {new Date(product.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(product)}
                </div>
              </CardHeader>

              <CardContent>
                {product.approval_notes && (
                  <div className="bg-muted p-3 rounded-lg mb-4">
                    <p className="text-sm">
                      <strong>Admin Notes:</strong> {product.approval_notes}
                    </p>
                  </div>
                )}

                {reviewingProduct === product.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`notes-${product.id}`}>Approval Notes (Optional)</Label>
                      <Textarea
                        id={`notes-${product.id}`}
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add notes for the seller..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateProductStatus(product.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateProductStatus(product.id, false)}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setReviewingProduct(null);
                          setApprovalNotes('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setReviewingProduct(product.id);
                        setApprovalNotes(product.approval_notes || '');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Review
                    </Button>
                    {product.is_approved && (
                      <Button
                        onClick={() => updateProductStatus(product.id, false)}
                        variant="outline"
                        size="sm"
                      >
                        Unapprove
                      </Button>
                    )}
                    {!product.is_approved && (
                      <Button
                        onClick={() => updateProductStatus(product.id, true)}
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                      >
                        Quick Approve
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteProduct(product.id)}
                      variant="outline"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
