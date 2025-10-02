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
      <Card className="group hover:shadow-xl hover:border-accent/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
        {isOnSale && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground shadow-lg">
            Flash Sale
          </Badge>
        )}
        {hasDiscount && !isOnSale && (
          <Badge className="absolute top-3 left-3 z-10 bg-sale text-sale-foreground shadow-lg">
            -{Math.round(((product.price_retail - currentPrice) / product.price_retail) * 100)}%
          </Badge>
        )}
        
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 md:h-4 md:w-4 fill-warning text-warning"
                />
              ))}
              <span className="text-xs md:text-sm text-muted-foreground ml-2">(4.5)</span>
            </div>
          </div>
          
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg text-foreground">
                  UGX {currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs md:text-sm text-muted-foreground line-through">
                    UGX {product.price_retail.toLocaleString()}
                  </span>
                )}
              </div>
              
              {product.stock <= 5 && product.stock > 0 && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  Only {product.stock} left
                </Badge>
              )}
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md transition-all"
              size="sm"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};