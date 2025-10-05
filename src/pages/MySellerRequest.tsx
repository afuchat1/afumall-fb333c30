import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SellerRequest {
  id: string;
  business_name: string;
  business_description: string;
  business_address: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const MySellerRequest = () => {
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest] = useState<SellerRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequest();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchRequest = async () => {
    try {
      const { data } = await supabase
        .from('seller_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setRequest(data as SellerRequest);
      }
    } catch (error) {
      console.error('Error fetching seller request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">My Seller Request</h1>

        {!request ? (
          <Card>
            <CardHeader>
              <CardTitle>No Seller Request Found</CardTitle>
              <CardDescription>
                You haven't submitted a seller request yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/seller-request">
                <Button>Submit Seller Request</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{request.business_name}</CardTitle>
                  <CardDescription className="mt-2">
                    Submitted on {new Date(request.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Business Description</h3>
                <p className="text-sm text-muted-foreground">{request.business_description}</p>
              </div>

              {request.business_address && (
                <div>
                  <h3 className="font-semibold mb-2">Business Address</h3>
                  <p className="text-sm text-muted-foreground">{request.business_address}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Contact Email</h3>
                  <p className="text-sm text-muted-foreground">{request.contact_email}</p>
                </div>
                {request.contact_phone && (
                  <div>
                    <h3 className="font-semibold mb-2">Contact Phone</h3>
                    <p className="text-sm text-muted-foreground">{request.contact_phone}</p>
                  </div>
                )}
              </div>

              {request.admin_notes && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground">{request.admin_notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(request.updated_at).toLocaleDateString()}
                </p>
                {request.status === 'pending' && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your request is being reviewed by our team
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};
