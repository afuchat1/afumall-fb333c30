import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Link to="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleWhatsAppCheckout = () => {
    const baseUrl = window.location.origin;
    const message = `Hi! I'd like to order:\n\n${items
      .map(item => {
        const price = (item.product.discount_price || item.product.price_retail) * item.quantity;
        const productUrl = `${baseUrl}/product/${item.product.id}`;
        return `${item.product.name} x${item.quantity} - UGX ${price.toLocaleString()}\n${productUrl}`;
      })
      .join('\n\n')}\n\nTotal: UGX ${getTotal().toLocaleString()}`;
    
    window.open(`https://wa.me/256703464913?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCallCheckout = () => {
    window.open('tel:+256760635265', '_self');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const currentPrice = item.product.discount_price || item.product.price_retail;
              const hasDiscount = !!item.product.discount_price;
              
              return (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.product.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-bold text-primary">
                            ${currentPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${item.product.price_retail.toFixed(2)}
                            </span>
                          )}
                          {hasDiscount && (
                            <Badge variant="destructive" className="text-xs">
                              Sale
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link to="/checkout" className="block">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Or order directly:
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleWhatsAppCheckout}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Order via WhatsApp
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCallCheckout}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call to Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};