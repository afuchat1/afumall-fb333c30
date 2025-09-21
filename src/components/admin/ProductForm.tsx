import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price_retail: '',
    price_wholesale: '',
    discount_price: '',
    stock: '',
    image_url: '',
    flash_sale_end: null as Date | null,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || '',
        price_retail: product.price_retail.toString(),
        price_wholesale: product.price_wholesale?.toString() || '',
        discount_price: product.discount_price?.toString() || '',
        stock: product.stock.toString(),
        image_url: product.image_url || '',
        flash_sale_end: product.flash_sale_end ? new Date(product.flash_sale_end) : null,
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price_retail: parseFloat(formData.price_retail),
        price_wholesale: formData.price_wholesale ? parseFloat(formData.price_wholesale) : null,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        flash_sale_end: formData.flash_sale_end?.toISOString() || null,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast({ title: 'Product updated successfully' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: 'Product created successfully' });
      }

      onSave();
    } catch (error: any) {
      toast({
        title: 'Error saving product',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_retail">Retail Price *</Label>
              <Input
                id="price_retail"
                type="number"
                step="0.01"
                value={formData.price_retail}
                onChange={(e) => handleChange('price_retail', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_wholesale">Wholesale Price</Label>
              <Input
                id="price_wholesale"
                type="number"
                step="0.01"
                value={formData.price_wholesale}
                onChange={(e) => handleChange('price_wholesale', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_price">Discount Price</Label>
              <Input
                id="discount_price"
                type="number"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) => handleChange('discount_price', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Flash Sale End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.flash_sale_end ? format(formData.flash_sale_end, "PPP") : "No flash sale"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.flash_sale_end}
                  onSelect={(date) => setFormData(prev => ({ ...prev, flash_sale_end: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};