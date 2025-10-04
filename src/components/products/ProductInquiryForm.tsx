import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageCircle } from 'lucide-react';

interface ProductInquiryFormProps {
  productId: string;
  productName: string;
  onClose?: () => void;
}

export const ProductInquiryForm = ({ productId, productName, onClose }: ProductInquiryFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('product_inquiries')
        .insert({
          product_id: productId,
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Inquiry sent!',
        description: 'The admin will contact you soon.',
      });

      setFormData({ name: '', email: '', phone: '', message: '' });
      onClose?.();
    } catch (error: any) {
      toast({
        title: 'Error sending inquiry',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <MessageCircle className="h-5 w-5" />
          Contact Admin About This Product
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Inquiring about: <span className="font-medium text-foreground">{productName}</span>
        </p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+256 xxx xxx xxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us about your inquiry..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 rounded-lg"
            >
              {loading ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
