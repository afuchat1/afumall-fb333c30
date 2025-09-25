import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { ArrowLeft, Star, Phone, MessageCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ReviewForm } from '@/components/products/ReviewForm';
import { useAuth } from '@/hooks/useAuth';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (productData) setProduct(productData);
        if (reviewsData) setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsData) setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  const isOnSale = product.discount_price && product.discount_price < product.price_retail;
  const isFlashSale = product.flash_sale_end && new Date(product.flash_sale_end) > new Date();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWhatsAppOrder = () => {
    const message = `Hi! I'd like to order: ${product.name} - UGX ${isOnSale ? product.discount_price : product.price_retail}`;
    window.open(`https://wa.me/256703464913?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCallOrder = () => {
    window.open('tel:+256760635265', '_self');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link to="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {isFlashSale && (
                  <Badge className="bg-sale text-sale-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
                {isOnSale && !isFlashSale && (
                  <Badge variant="destructive">On Sale</Badge>
                )}
                {product.stock > 0 ? (
                  <Badge variant="secondary">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                {isOnSale ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-sale">
                      UGX {product.discount_price?.toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      UGX {product.price_retail.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">
                    UGX {product.price_retail.toLocaleString()}
                  </span>
                )}
                
                {product.price_wholesale && (
                  <p className="text-sm text-muted-foreground">
                    Wholesale: UGX {product.price_wholesale.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full"
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  Buy Now
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary"
                  onClick={handleWhatsAppOrder}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleCallOrder}
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="mb-8">
          <ReviewForm 
            productId={product.id} 
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {review.reviewer_name}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      {review.user_id && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                  <Separator />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};