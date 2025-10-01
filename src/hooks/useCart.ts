import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate or retrieve session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('afumall-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('afumall-session-id', sessionId);
  }
  return sessionId;
};

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const sessionId = getSessionId();

  // Fetch cart items from Supabase
  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq(user ? 'user_id' : 'session_id', user?.id || sessionId);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map(item => ({
        product: item.products as Product,
        quantity: item.quantity
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchCartItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: user ? `user_id=eq.${user.id}` : `session_id=eq.${sessionId}`
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, sessionId]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.id)
        .eq(user ? 'user_id' : 'session_id', user?.id || sessionId)
        .maybeSingle();

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        // Insert new item
        await supabase
          .from('cart_items')
          .insert({
            product_id: product.id,
            quantity,
            user_id: user?.id || null,
            session_id: sessionId
          });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id')
        .eq('product_id', productId)
        .eq(user ? 'user_id' : 'session_id', user?.id || sessionId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId)
        .eq(user ? 'user_id' : 'session_id', user?.id || sessionId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq(user ? 'user_id' : 'session_id', user?.id || sessionId);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product.discount_price || item.product.price_retail;
      return total + (price * item.quantity);
    }, 0);
  };

  return {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getTotal
  };
};
