import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Generate or retrieve a session ID for guest users
const getSessionId = () => {
  let sessionId = localStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
};

export const useCart = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart items from database
  const fetchCartItems = async () => {
    try {
      const sessionId = getSessionId();
      const userId = user?.id;

      const { data: cartData, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products (*)
        `)
        .or(userId ? `user_id.eq.${userId},session_id.eq.${sessionId}` : `session_id.eq.${sessionId}`);

      if (error) throw error;

      if (cartData) {
        const cartItems: CartItem[] = cartData
          .filter(item => item.products)
          .map(item => ({
            product: item.products as unknown as Product,
            quantity: item.quantity,
          }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Subscribe to real-time changes
  useEffect(() => {
    const sessionId = getSessionId();
    const userId = user?.id;

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: userId ? `user_id=eq.${userId}` : `session_id=eq.${sessionId}`,
        },
        () => {
          fetchCartItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const sessionId = getSessionId();
      const userId = user?.id || null;

      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.id)
        .or(userId ? `user_id.eq.${userId},session_id.eq.${sessionId}` : `session_id.eq.${sessionId}`)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            session_id: sessionId,
            product_id: product.id,
            quantity,
          });

        if (error) throw error;
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
      const sessionId = getSessionId();
      const userId = user?.id || null;

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('product_id', productId)
        .or(userId ? `user_id.eq.${userId},session_id.eq.${sessionId}` : `session_id.eq.${sessionId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const sessionId = getSessionId();
      const userId = user?.id || null;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId)
        .or(userId ? `user_id.eq.${userId},session_id.eq.${sessionId}` : `session_id.eq.${sessionId}`);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      const sessionId = getSessionId();
      const userId = user?.id || null;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .or(userId ? `user_id.eq.${userId},session_id.eq.${sessionId}` : `session_id.eq.${sessionId}`);

      if (error) throw error;
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
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getTotal,
    loading,
  };
};