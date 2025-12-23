import { StateCreator } from 'zustand';
import { StoreState } from '../types';
import { CartSlice, CartSliceState, CartTotals } from '../types';
import { CartItem } from '../../types';

const initialCartState: CartSliceState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

export const createCartSlice: StateCreator<
  StoreState,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  CartSlice
> = (set, get) => ({
  cart: initialCartState,

  cartActions: {
    addToCart: (item) => {
      set((state) => {
        const newItem: CartItem = {
          ...item,
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        state.cart.items.push(newItem);
        
        state.cart.itemCount = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
        state.cart.subtotal = state.cart.items.reduce((sum, i) => 
          sum + (i.baseAmount + i.optionsTotal) * i.quantity, 0
        );
      });
    },

    removeFromCart: (itemId) => {
      set((state) => {
        state.cart.items = state.cart.items.filter(i => i.id !== itemId);
        
        state.cart.itemCount = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
        state.cart.subtotal = state.cart.items.reduce((sum, i) => 
          sum + (i.baseAmount + i.optionsTotal) * i.quantity, 0
        );
      });
    },

    updateQuantity: (itemId, quantity) => {
      if (quantity < 1) return;

      set((state) => {
        const item = state.cart.items.find(i => i.id === itemId);
        if (item) {
          item.quantity = quantity;
        }

        state.cart.itemCount = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
        state.cart.subtotal = state.cart.items.reduce((sum, i) => 
          sum + (i.baseAmount + i.optionsTotal) * i.quantity, 0
        );
      });
    },

    clearCart: () => {
      set((state) => {
        state.cart = initialCartState;
      });
    },

    getCartTotal: () => {
      const { items } = get().cart;
      
      let totalSubtotal = 0;
      let totalTax = 0;
      let totalShipping = 0;
      const itemBreakdown: CartTotals['itemBreakdown'] = [];

      for (const item of items) {
        const itemSubtotal = (item.baseAmount + item.optionsTotal) * item.quantity;

        // Item tax: subtotal * taxRate
        const itemTaxRate = item.taxRate || 0;
        const itemTax = Math.round(itemSubtotal * itemTaxRate * 100) / 100;

        // Item shipping
        let itemShipping = 0;
        if (item.shippingCost && item.shippingCost > 0) {
          if (item.freeShippingThreshold && itemSubtotal >= item.freeShippingThreshold) {
            itemShipping = 0;
          } else {
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
    },

    syncCartState: (newCartState: CartSliceState) => {
      set((state) => {
        state.cart = newCartState;
      });
    },
  },
});