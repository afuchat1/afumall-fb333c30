import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SellerAddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_retail: '',
    price_wholesale: '',
    stock: '',
    image_url: '',
    category_id: '',
    brand: '',
    sku: '',
    material: '',
    color: '',
    size: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    const newImages = [...additionalImages];
    newImages[index] = value;
    setAdditionalImages(newImages);
  };

  const addImageField = () => setAdditionalImages([...additionalImages, '']);
  const removeImageField = (index: number) => setAdditionalImages(additionalImages.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: productData, error: productError } = await supabase.from('products').insert({
        name: formData.name,
        description: formData.description,
        price_retail: parseFloat(formData.price_retail),
        price_wholesale: formData.price_wholesale ? parseFloat(formData.price_wholesale) : null,
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        category_id: formData.category_id || null,
        seller_id: user.id,
        is_approved: false,
      }).select().single();

      if (productError) throw productError;

      if (productData) {
        const imagesToInsert = additionalImages.filter(img => img.trim()).map((img, index) => ({
          product_id: productData.id,
          image_url: img,
          display_order: index + 1,
          is_primary: false,
        }));

        if (imagesToInsert.length > 0) {
          await supabase.from('product_images').insert(imagesToInsert);
        }

        if (formData.color || formData.size) {
          await supabase.from('product_variants').insert({
            product_id: productData.id,
            color: formData.color || null,
            size: formData.size || null,
            sku: formData.sku || null,
            stock: parseInt(formData.stock),
          });
        }
      }

      toast({ title: "Product submitted!", description: "Pending admin approval" });
      navigate('/seller/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/seller/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Product</CardTitle>
            <CardDescription>Complete product information for admin approval</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Premium Cotton T-Shirt" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Product details..." rows={4} />
                  </div>
                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="brand">Brand</Label><Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" /></div>
                  <div><Label htmlFor="sku">SKU</Label><Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="TSH-001" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Pricing & Inventory</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div><Label htmlFor="price_retail">Retail Price (UGX) *</Label><Input id="price_retail" name="price_retail" type="number" value={formData.price_retail} onChange={handleChange} required placeholder="50000" min="0" step="100" /></div>
                  <div><Label htmlFor="price_wholesale">Wholesale Price</Label><Input id="price_wholesale" name="price_wholesale" type="number" value={formData.price_wholesale} onChange={handleChange} placeholder="40000" min="0" step="100" /></div>
                  <div><Label htmlFor="stock">Stock *</Label><Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required placeholder="100" min="0" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Specifications</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div><Label htmlFor="color">Color</Label><Input id="color" name="color" value={formData.color} onChange={handleChange} placeholder="Black" /></div>
                  <div><Label htmlFor="size">Size</Label><Input id="size" name="size" value={formData.size} onChange={handleChange} placeholder="M, L, XL" /></div>
                  <div><Label htmlFor="material">Material</Label><Input id="material" name="material" value={formData.material} onChange={handleChange} placeholder="Cotton" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
                <div><Label htmlFor="image_url">Primary Image URL *</Label><Input id="image_url" name="image_url" type="url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" /></div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Additional Images</Label><Button type="button" variant="outline" size="sm" onClick={addImageField}><Plus className="h-4 w-4 mr-2" />Add</Button></div>
                  {additionalImages.map((img, index) => (<div key={index} className="flex gap-2"><Input type="url" value={img} onChange={(e) => handleAdditionalImageChange(index, e.target.value)} placeholder={`Image ${index + 1}`} className="flex-1" /><Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)}><X className="h-4 w-4" /></Button></div>))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')} disabled={loading} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Submitting...' : 'Submit for Approval'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
