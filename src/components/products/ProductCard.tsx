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
      <Card className="group hover:shadow-lg hover:border-accent/50 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
        {isOnSale && (
          <Badge className="absolute top-1.5 left-1.5 z-10 bg-accent text-accent-foreground shadow-md text-[10px] px-1.5 py-0.5">
            Flash
          </Badge>
        )}
        {hasDiscount && !isOnSale && (
          <Badge className="absolute top-1.5 left-1.5 z-10 bg-sale text-sale-foreground shadow-md text-[10px] px-1.5 py-0.5">
            -{Math.round(((product.price_retail - currentPrice) / product.price_retail) * 100)}%
          </Badge>
        )}
        
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <CardContent className="p-2 md:p-3 flex-1 flex flex-col">
          <h3 className="font-medium text-xs md:text-sm line-clamp-2 mb-1.5 min-h-[2rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5 md:h-3 md:w-3 fill-warning text-warning"
                />
              ))}
              <span className="text-[10px] md:text-xs text-muted-foreground ml-1">(4.5)</span>
            </div>
          </div>
          
          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-sm md:text-base text-foreground">
                  UGX {currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                    UGX {product.price_retail.toLocaleString()}
                  </span>
                )}
              </div>
              
              {product.stock <= 5 && product.stock > 0 && (
                <Badge variant="outline" className="text-[9px] md:text-[10px] border-warning text-warning px-1 py-0">
                  {product.stock} left
                </Badge>
              )}
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md transition-all text-xs md:text-sm h-7 md:h-8"
              size="sm"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};