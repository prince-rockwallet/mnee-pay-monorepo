/**
 * Create a calculate-totals endpoint handler
 *
 * This helper generates an Express/HTTP handler function for the /calculate-totals endpoint.
 * Merchants provide their business logic callbacks, and this returns a ready-to-use handler.
 *
 * Usage:
 * ```typescript
 * const handler = createCalculateTotalsHandler({
 *   resolveProduct: (id) => products.find(p => p.id === id),
 *   calculateTax: (subtotal, shipping, address) => (subtotal + shipping) * 0.08,
 *   calculateShipping: (address, subtotal) => subtotal >= 50 ? 0 : 5.00,
 * });
 *
 * app.post('/api/checkout/calculate-totals', handler);
 * ```
 */

import { calculateOptionPrices, type CustomField } from '../utils/calculateOptionPrices';
import type { ShippingAddress } from './processOrder';

export interface ResolvedProduct {
  name: string;
  basePrice: number;
  customFields?: CustomField[];
  [key: string]: any;
}

export interface CalculatedOrderItem {
  productId: string;
  name: string;
  basePrice: number;
  optionPrices: number;
  price: number;
  quantity: number;
  lineTotal: number;
  customFields?: Record<string, any>;
}

export interface CalculateTotalsConfig {
  // Merchant callbacks
  resolveProduct: (externalId: string) => Promise<ResolvedProduct> | ResolvedProduct;
  calculateShipping?: (address?: ShippingAddress, subtotal?: number, items?: CalculatedOrderItem[]) => Promise<number> | number;
  calculateTax?: (subtotal: number, shipping: number, address?: ShippingAddress, items?: CalculatedOrderItem[]) => Promise<number> | number;
}

export interface CalculateTotalsRequest {
  items: Array<{
    productId: string;
    quantity: number;
    customFields?: Record<string, any>;
    price?: number; // For donations with custom amounts
  }>;
  checkoutType?: 'ecommerce' | 'paywall' | 'donation';
  shippingAddress?: ShippingAddress;
}

export interface CalculateTotalsResponse {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  breakdown: {
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    shippingDetails?: {
      rate: number;
      freeShippingThreshold?: number;
      qualifiesForFreeShipping?: boolean;
    };
    taxDetails?: {
      rate: number;
      taxableAmount: number;
    };
  };
}

/**
 * Create Express/HTTP handler for calculate-totals endpoint
 */
export function createCalculateTotalsHandler(config: CalculateTotalsConfig) {
  return async (req: any, res: any) => {
    try {
      const { items, shippingAddress }: CalculateTotalsRequest = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items are required' });
      }

      // Resolve each product and calculate line totals
      const resolvedItems: CalculatedOrderItem[] = await Promise.all(
        items.map(async (item) => {
          const product = await config.resolveProduct(item.productId);
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          // Calculate option pricing (for variants)
          const optionPrices = calculateOptionPrices(
            product.customFields || [],
            item.customFields || {}
          );

          // For donations, use custom price if provided
          const basePrice = item.price !== undefined
            ? item.price
            : product.basePrice;

          const totalPrice = basePrice + optionPrices;

          return {
            productId: item.productId,
            name: product.name,
            basePrice,
            optionPrices,
            price: totalPrice,
            quantity: item.quantity,
            lineTotal: totalPrice * item.quantity,
            customFields: item.customFields,
          };
        })
      );

      // Calculate subtotal
      const subtotal = resolvedItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0
      );

      // Calculate shipping
      const shipping = config.calculateShipping
        ? await config.calculateShipping(shippingAddress, subtotal, resolvedItems)
        : 0;

      // Calculate tax
      const tax = config.calculateTax
        ? await config.calculateTax(subtotal, shipping, shippingAddress, resolvedItems)
        : 0;

      // Calculate total
      const total = subtotal + shipping + tax;

      // Build response
      const response: CalculateTotalsResponse = {
        subtotal,
        shipping,
        tax,
        total,
        breakdown: {
          items: resolvedItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.lineTotal,
          })),
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error('Calculate totals failed:', error);
      res.status(500).json({ error: error.message || 'Failed to calculate totals' });
    }
  };
}
