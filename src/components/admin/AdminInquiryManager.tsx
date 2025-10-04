import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, Mail, Phone, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  product_id: string;
  products?: {
    name: string;
    image_url: string | null;
  };
}

export const AdminInquiryManager = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();

    const channel = supabase
      .channel('inquiries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_inquiries' }, () => {
        fetchInquiries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('product_inquiries')
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching inquiries',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Inquiry marked as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Inquiry deleted',
        description: 'The inquiry has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting inquiry',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'responded':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'responded':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading inquiries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Customer Inquiries</h3>
        <Badge variant="secondary">{inquiries.length} Total</Badge>
      </div>

      {inquiries.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No inquiries yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {inquiry.products?.image_url && (
                      <img
                        src={inquiry.products.image_url}
                        alt={inquiry.products.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm md:text-base mb-1 truncate">
                        {inquiry.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{inquiry.products?.name || 'Unknown Product'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(inquiry.status)} flex items-center gap-1 whitespace-nowrap`}>
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${inquiry.email}`} className="text-accent hover:underline truncate">
                      {inquiry.email}
                    </a>
                  </div>
                  {inquiry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${inquiry.phone}`} className="text-accent hover:underline">
                        {inquiry.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">{inquiry.message}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(inquiry.created_at).toLocaleDateString()} at{' '}
                    {new Date(inquiry.created_at).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select value={inquiry.status} onValueChange={(value) => updateStatus(inquiry.id, value)}>
                      <SelectTrigger className="h-8 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInquiry(inquiry.id)}
                      className="text-xs h-8"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
