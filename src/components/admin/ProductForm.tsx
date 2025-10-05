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
import { CalendarIcon, Upload, X, Zap, Tag, TrendingUp, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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
    is_flash_sale: false,
    is_popular: false,
    is_featured: false,
    is_new_arrival: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
        is_flash_sale: product.is_flash_sale || false,
        is_popular: product.is_popular || false,
        is_featured: product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
      });
      setImagePreview(product.image_url || '');
    }
  }, [product]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('Products')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('Products')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Error uploading image',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if file selected
      const uploadedImageUrl = await uploadImage();

      const productData = {
        name: formData.name,
        description: formData.description || null,
        category_id: formData.category_id || null,
        price_retail: parseFloat(formData.price_retail),
        price_wholesale: formData.price_wholesale ? parseFloat(formData.price_wholesale) : null,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        image_url: uploadedImageUrl,
        flash_sale_end: formData.flash_sale_end?.toISOString() || null,
        is_flash_sale: formData.is_flash_sale,
        is_popular: formData.is_popular,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
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
    <Card className="rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-2xl">
        <CardTitle className="flex items-center gap-2">
          {product ? 'Edit Product' : 'Add New Product'}
          {formData.flash_sale_end && new Date(formData.flash_sale_end) > new Date() && (
            <Badge className="bg-accent text-accent-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Flash Sale
            </Badge>
          )}
          {formData.discount_price && (
            <Badge className="bg-sale text-sale-foreground">
              <Tag className="h-3 w-3 mr-1" />
              Discounted
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_retail">Retail Price (UGX) *</Label>
                <Input
                  id="price_retail"
                  type="number"
                  step="0.01"
                  value={formData.price_retail}
                  onChange={(e) => handleChange('price_retail', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_wholesale">Wholesale Price (UGX)</Label>
                <Input
                  id="price_wholesale"
                  type="number"
                  step="0.01"
                  value={formData.price_wholesale}
                  onChange={(e) => handleChange('price_wholesale', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_price" className="flex items-center gap-1">
                  Discount Price (UGX)
                  <Tag className="h-3 w-3 text-sale" />
                </Label>
                <Input
                  id="discount_price"
                  type="number"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => handleChange('discount_price', e.target.value)}
                  placeholder="0.00"
                />
                {formData.discount_price && formData.price_retail && (
                  <p className="text-xs text-sale">
                    {Math.round(((parseFloat(formData.price_retail) - parseFloat(formData.discount_price)) / parseFloat(formData.price_retail)) * 100)}% off
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', e.target.value)}
                  placeholder="0"
                  required
                />
                {formData.stock && parseInt(formData.stock) <= 5 && parseInt(formData.stock) > 0 && (
                  <p className="text-xs text-warning">Low stock warning</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Flash Sale End Date
                  <Zap className="h-3 w-3 text-accent" />
                </Label>
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
                {formData.flash_sale_end && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, flash_sale_end: null }))}
                    className="text-xs"
                  >
                    Clear flash sale
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Product Type Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Product Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-muted/30">
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-background hover:bg-accent/5 transition-colors">
                <Checkbox
                  id="is_flash_sale"
                  checked={formData.is_flash_sale}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_flash_sale: checked as boolean }))
                  }
                />
                <Label htmlFor="is_flash_sale" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Zap className="h-4 w-4 text-accent" />
                  <div>
                    <div className="font-medium">Flash Sale</div>
                    <div className="text-xs text-muted-foreground">Show in flash sale section</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-background hover:bg-accent/5 transition-colors">
                <Checkbox
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_popular: checked as boolean }))
                  }
                />
                <Label htmlFor="is_popular" className="flex items-center gap-2 cursor-pointer flex-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Popular</div>
                    <div className="text-xs text-muted-foreground">Show in popular section</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-background hover:bg-accent/5 transition-colors">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_featured: checked as boolean }))
                  }
                />
                <Label htmlFor="is_featured" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Star className="h-4 w-4 text-secondary-foreground" />
                  <div>
                    <div className="font-medium">Featured</div>
                    <div className="text-xs text-muted-foreground">Show in featured section</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-background hover:bg-accent/5 transition-colors">
                <Checkbox
                  id="is_new_arrival"
                  checked={formData.is_new_arrival}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_new_arrival: checked as boolean }))
                  }
                />
                <Label htmlFor="is_new_arrival" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">New Arrival</div>
                    <div className="text-xs text-muted-foreground">Show in new arrivals</div>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Product Image</h3>
            <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent transition-colors bg-muted/30">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-56 rounded-xl mx-auto shadow-lg"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 rounded-full"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, image_url: '' }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Label htmlFor="image-upload" className="cursor-pointer text-accent hover:text-accent/80 font-medium">
                      Click to upload product image
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center">
                Or paste an image URL:
              </div>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  handleChange('image_url', e.target.value);
                  setImagePreview(e.target.value);
                  setImageFile(null);
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading} className="bg-accent hover:bg-accent/90 rounded-lg">
              {loading || uploading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};