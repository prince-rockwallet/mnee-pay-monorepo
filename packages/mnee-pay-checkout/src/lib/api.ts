/**
 * API client for MNEE Pay hosted buttons
 */

export type ChainName = 'BSV' | 'ETHEREUM' | 'BASE' | 'ARBITRUM' | 'OPTIMISM' | 'POLYGON';

// ============================================================================
// Button Config
// ============================================================================

export type CartPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type CartDisplayMode = 'modal' | 'drawer';

export interface ButtonConfig {
  id: string;
  buttonType: 'PAYWALL' | 'ECOMMERCE' | 'DONATION';
  name: string;
  description?: string;
  priceUsdCents?: number;
  allowCustomAmount: boolean;
  suggestedAmounts: number[];
  minAmountCents?: number;
  maxAmountCents?: number;
  productName?: string;
  productImage?: string;
  customFields?: CustomField[];
  // Cart settings (ecommerce)
  enableCart?: boolean;
  cartPosition?: CartPosition;
  cartDisplayMode?: CartDisplayMode;
  showQuantitySelector?: boolean;
  // Customer info
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectShipping?: boolean;
  // Tax and shipping
  taxRatePercent?: number;
  shippingCostCents?: number;
  freeShippingThreshold?: number;
  // Styling
  buttonText: string;
  theme: string;
  primaryColor?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  borderRadius?: string;
  buttonSize?: string;
  fontFamily?: string;
  customCSS?: string;
  showConfetti?: boolean;
}

export interface CustomField {
  id: string;
  label: string;
  type: 'select' | 'radio' | 'checkbox' | 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  defaultValue?: string;
}

export interface FieldOption {
  value: string;
  label: string;
  priceModifierCents?: number;
}

// ============================================================================
// Session Types
// ============================================================================

export interface CartItem {
  buttonId: string;
  productName: string;
  quantity: number;
  baseAmountCents: number;
  selectedOptions?: Record<string, string>;
  optionsTotalCents?: number;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateButtonSessionRequest {
  amountUsdCents: number;
  chain: ChainName;
  stablecoin: string;
  customerEmail?: string;
  customerPhone?: string;
  selectedOptions?: Record<string, string>;
  shippingAddress?: ShippingAddress;
  // Cart/order details
  cartItems?: CartItem[];
  subtotalCents?: number;
  taxCents?: number;
  shippingCents?: number;
  quantity?: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  sessionToken: string;
  depositAddress: string;
  mneeAmount: number;
  mneeDepositAddress: string;
  expiresAt: string;
}

export interface SessionStatus {
  sessionId: string;
  status: 'PENDING' | 'PAYMENT_RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  amountUsdCents: number;
  mneeAmount: string;
  chain?: string;
  stablecoin?: string;
  depositAddress?: string;
  expiresAt: string;
  transaction?: {
    id: string;
    status: string;
    confirmations: number;
    requiredConfirmations: number;
    mneeTxId?: string;
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getChainName(chainId: number): ChainName {
  switch (chainId) {
    case 1:
      return 'ETHEREUM';
    case 8453:
      return 'BASE';
    case 42161:
      return 'ARBITRUM';
    case 10:
      return 'OPTIMISM';
    case 137:
      return 'POLYGON';
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Convert Prisma enum format (TOP_RIGHT) to frontend format (top-right)
 */
function convertCartPosition(position?: string): CartPosition | undefined {
  if (!position) return undefined;
  return position.toLowerCase().replace('_', '-') as CartPosition;
}

function convertCartDisplayMode(mode?: string): CartDisplayMode | undefined {
  if (!mode) return undefined;
  return mode.toLowerCase() as CartDisplayMode;
}

/**
 * Fetch button configuration
 */
export async function fetchButtonConfig(
  apiBaseUrl: string,
  buttonId: string
): Promise<ButtonConfig> {
  const response = await fetch(`${apiBaseUrl}/api/buttons/public/${buttonId}/config`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Button not found' }));
    throw new Error(error.message || `Failed to fetch button config: ${response.status}`);
  }

  const config = await response.json();

  // Convert Prisma enum formats to frontend format
  return {
    ...config,
    cartPosition: convertCartPosition(config.cartPosition),
    cartDisplayMode: convertCartDisplayMode(config.cartDisplayMode),
  };
}

/**
 * Create a checkout session for a button
 *
 * This is the main entry point for creating a payment session.
 * The button ID determines the merchant and pricing.
 */
export async function createButtonSession(
  apiBaseUrl: string,
  buttonId: string,
  request: CreateButtonSessionRequest
): Promise<CreateSessionResponse> {
  const response = await fetch(`${apiBaseUrl}/api/checkout/public/buttons/${buttonId}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create session' }));
    throw new Error(error.message || `Failed to create session: ${response.status}`);
  }

  return response.json();
}

/**
 * Complete a checkout session after payment
 */
export async function completeSession(
  apiBaseUrl: string,
  sessionToken: string,
  txHash: string
): Promise<{ success: boolean; transactionId: string; message: string; mneeTxId?: string; status?: string }> {
  const response = await fetch(`${apiBaseUrl}/api/checkout/public/sessions/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ txHash }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to complete session' }));
    throw new Error(error.message || `Failed to complete session: ${response.status}`);
  }

  return response.json();
}

/**
 * Get session status
 */
export async function getSessionStatus(
  apiBaseUrl: string,
  sessionToken: string
): Promise<SessionStatus> {
  const response = await fetch(`${apiBaseUrl}/api/checkout/public/sessions/status`, {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get session status' }));
    throw new Error(error.message || `Failed to get session status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get transaction confirmation status by txHash
 */
export async function getTransactionStatus(
  apiBaseUrl: string,
  txHash: string
): Promise<{
  found: boolean;
  txHash: string;
  chain?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  isConfirmed?: boolean;
  status?: string;
  progress?: string;
  percentComplete?: number;
}> {
  const response = await fetch(`${apiBaseUrl}/api/checkout/public/transaction-status/${txHash}`);

  if (!response.ok) {
    throw new Error(`Failed to get transaction status: ${response.status}`);
  }

  return response.json();
}
