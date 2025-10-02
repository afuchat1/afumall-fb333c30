import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  
  const currentPrice = product.discount_price || product.price_retail;
  const hasDiscount = !!product.discount_price;
  const isOnSale = product.flash_sale_end && new Date(product.flash_sale_end) > new Date();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
        {isOnSale && (
          <Badge className="absolute top-2 left-2 z-10 bg-sale text-sale-foreground">
            Flash Sale
          </Badge>
        )}
        
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="font-bold text-primary">
                UGX {currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  UGX {product.price_retail.toLocaleString()}
                </span>
              )}
            </div>
            
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="text-xs">
                Only {product.stock} left
              </Badge>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};