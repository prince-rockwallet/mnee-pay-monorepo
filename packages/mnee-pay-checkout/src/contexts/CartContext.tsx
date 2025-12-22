import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { CartItem, CartState } from '../types';

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  /** Per-item breakdown for detailed display */
  itemBreakdown: Array<{
    itemId: string;
    itemSubtotal: number;
    itemTax: number;
    itemShipping: number;
    itemTotal: number;
  }>;
}

interface CartContextValue extends CartState {
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  /** Calculate cart totals using per-item tax rates and shipping costs */
  getCartTotal: () => CartTotals;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'mnee-checkout-cart';

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return initialState;
};

// Custom event name for cart updates (same-page sync)
const CART_UPDATE_EVENT = 'mnee-cart-update';

// Save cart to localStorage and dispatch custom event for same-page sync
const saveCartToStorage = (cart: CartState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for same-page sync between CartProvider instances
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT, { detail: cart }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(loadCartFromStorage);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Listen for cart updates to sync across multiple CartProvider instances
  // - storage event: syncs across browser tabs
  // - custom event: syncs within same page (multiple MneeCheckout buttons)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue);
          setCart(newCart);
        } catch (error) {
          console.error('Error parsing cart from storage event:', error);
        }
      }
    };

    const handleCartUpdate = (e: CustomEvent<CartState>) => {
      // Only update if the cart is different (prevent infinite loops)
      setCart(prevCart => {
        if (JSON.stringify(prevCart) !== JSON.stringify(e.detail)) {
          return e.detail;
        }
        return prevCart;
      });
    };

    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);

    return () => {
      if (typeof window === 'undefined') {
        return;
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate as EventListener);
    };
  }, []);

  // Generate unique ID for cart items
  const generateId = () => `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(prev => {
      const newItem: CartItem = {
        ...item,
        id: generateId(),
      };

      const newItems = [...prev.items, newItem];
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) =>
        sum + (item.baseAmount + item.optionsTotal) * item.quantity,
        0
      );


      return {
        items: newItems,
        itemCount,
        subtotal,
      };
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) =>
        sum + (item.baseAmount + item.optionsTotal) * item.quantity,
        0
      );

      return {
        items: newItems,
        itemCount,
        subtotal,
      };
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) =>
        sum + (item.baseAmount + item.optionsTotal) * item.quantity,
        0
      );

      return {
        items: newItems,
        itemCount,
        subtotal,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart(initialState);
  }, []);

  /**
   * Calculate cart totals using per-item tax rates and shipping costs.
   * Each item can have its own taxRate, shippingCost, and freeShippingThreshold.
   */
  const getCartTotal = useCallback((): CartTotals => {
    let totalSubtotal = 0;
    let totalTax = 0;
    let totalShipping = 0;
    const itemBreakdown: CartTotals['itemBreakdown'] = [];

    for (const item of cart.items) {
      // Item subtotal: (baseAmount + optionsTotal) * quantity
      const itemSubtotal = (item.baseAmount + item.optionsTotal) * item.quantity;

      // Item tax: subtotal * taxRate
      const itemTaxRate = item.taxRate || 0;
      const itemTax = Math.round(itemSubtotal * itemTaxRate * 100) / 100;

      // Item shipping: check free shipping threshold
      let itemShipping = 0;
      if (item.shippingCost && item.shippingCost > 0) {
        // If free shipping threshold exists and item subtotal exceeds it, shipping is free
        if (item.freeShippingThreshold && itemSubtotal >= item.freeShippingThreshold) {
          itemShipping = 0;
        } else {
          // Shipping cost is per item (not multiplied by quantity - represents cost to ship this line item)
          itemShipping = item.shippingCost;
        }
      }

      const itemTotal = Math.round((itemSubtotal + itemTax + itemShipping) * 100) / 100;

      totalSubtotal += itemSubtotal;
      totalTax += itemTax;
      totalShipping += itemShipping;

      itemBreakdown.push({
        itemId: item.id,
        itemSubtotal: Math.round(itemSubtotal * 100) / 100,
        itemTax,
        itemShipping: Math.round(itemShipping * 100) / 100,
        itemTotal,
      });
    }

    return {
      subtotal: Math.round(totalSubtotal * 100) / 100,
      tax: Math.round(totalTax * 100) / 100,
      shipping: Math.round(totalShipping * 100) / 100,
      total: Math.round((totalSubtotal + totalTax + totalShipping) * 100) / 100,
      itemBreakdown,
    };
  }, [cart.items]);

  // Memoize the context value to prevent unnecessary re-renders
  const value: CartContextValue = useMemo(() => ({
    ...cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
