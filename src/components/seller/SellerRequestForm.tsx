import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Store, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SellerRequestForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_description: '',
    contact_email: user?.email || '',
    contact_phone: '',
    business_address: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a seller request',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('seller_requests')
        .insert([{
          user_id: user.id,
          ...formData,
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: 'Request Submitted Successfully',
        description: 'We will review your application and get back to you soon.',
      });

      setFormData({
        business_name: '',
        business_description: '',
        contact_email: user.email || '',
        contact_phone: '',
        business_address: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error Submitting Request',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Store className="h-6 w-6 text-accent" />
          Become a Seller on AfuMall
        </CardTitle>
        <CardDescription>
          Join our marketplace and start selling your products to thousands of customers
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Business Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="business_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business Name *
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_description">
                Business Description *
              </Label>
              <Textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => handleChange('business_description', e.target.value)}
                placeholder="Tell us about your business and what you plan to sell..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Business Address
              </Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) => handleChange('business_address', e.target.value)}
                placeholder="Enter your business address"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+256 123 456 789"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-accent hover:bg-accent/90"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
