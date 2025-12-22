/**
 * Extract and normalize line items from session metadata
 *
 * All sessions store items in a standardized format:
 * metadata.items[] - array of line items (works for cart, donation, paywall, etc.)
 */

export interface LineItem {
  externalId: string;
  quantity: number;
  priceUsdCents?: number;
  selectedOptions?: Record<string, any>;
}

export interface Session {
  id: string;
  amountUsdCents: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export function extractLineItems(session: Session): LineItem[] {
  const metadata = session.metadata || {};

  if (!metadata.items || !Array.isArray(metadata.items)) {
    return [];
  }

  return metadata.items.map((item: any) => ({
    externalId: item.externalId,
    quantity: item.quantity || 1,
    priceUsdCents: item.priceUsdCents,
    selectedOptions: item.selectedOptions,
  }));
}
