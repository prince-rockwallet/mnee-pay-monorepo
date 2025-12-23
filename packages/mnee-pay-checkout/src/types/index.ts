import { ReactNode } from 'react';

// ============================================================================
// Core Types
// ============================================================================

export type CheckoutType = 'paywall' | 'ecommerce' | 'donation' | 'custom';

export type Theme = 'light' | 'dark' | 'auto';

export type Stablecoin = 'USDC' | 'USDT' | 'DAI' | 'PYUSD' | 'MNEE' | string;

export type WalletProvider = 'rainbowkit' | 'yours' | 'walletconnect';

/**
 * Supported blockchain networks
 */
export type Chain = 'BASE' | 'ETH' | 'POLYGON' | 'ARBITRUM' | 'OPTIMISM' | 'BSV';

/**
 * Available payment methods - user selects which token/chain to pay with
 * MNEE backend converts all payments to MNEE for merchant settlement
 */
export interface PaymentMethod {
  /** Display name for the payment method */
  label: string;

  /** Stablecoin/token to use */
  stablecoin: string;

  /** Blockchain network */
  chain: Chain;

  /** Description/details about this payment method */
  description: string;

  /** Whether this method is currently available */
  enabled: boolean;

  /** Icon or logo URL (optional) */
  icon?: string;
}

export type CartPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

// ============================================================================
// Field Schema Types
// ============================================================================

/** Supported field types for custom form fields */
export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'tel'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'address';

/**
 * Option for select/radio fields
 */
export interface FieldOption {
  /** Display text for the option */
  label: string;

  /** Value stored when selected */
  value: string;

  /** Additional price modifier for this option (e.g., +2.00 for XX-Large) */
  price?: number;

  /** Disable this option */
  disabled?: boolean;
}

/**
 * Validation rules for custom fields
 */
export interface FieldValidation {
  /** Whether the field is required */
  required?: boolean;

  /** Minimum value (for number fields) */
  min?: number;

  /** Maximum value (for number fields) */
  max?: number;

  /** Minimum character length (for text fields) */
  minLength?: number;

  /** Maximum character length (for text fields) */
  maxLength?: number;

  /** Regular expression pattern to match */
  pattern?: RegExp;

  /** Custom error message for pattern validation */
  message?: string;

  /** Custom validation function. Return true/string for error, false for success */
  custom?: (value: any) => boolean | string;
}

/**
 * Schema for custom form fields (e.g., product options like size, color, format)
 */
export interface CustomField {
  /** Unique identifier for this field. Used as key in formData */
  id: string;

  /** Field type - determines the UI component rendered */
  type: FieldType;

  /** Label displayed above/beside the field */
  label: string;

  /** Placeholder text (for text/select fields) */
  placeholder?: string;

  /** Default/initial value for the field */
  defaultValue?: any;

  /** Options array (required for select/radio fields) */
  options?: FieldOption[];

  /** Price modifier for checkbox fields (e.g., +5.00 for gift wrapping) */
  price?: number;

  /** Validation rules for this field */
  validation?: FieldValidation;

  /** Conditional field - only show if another field has a specific value */
  dependsOn?: {
    fieldId: string;
    value: any;
  };

  /** Custom metadata attached to this field */
  metadata?: Record<string, any>;
}

// ============================================================================
// Shipping & Contact Types
// ============================================================================

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface PaymentDetails {
  amount: string | number;
  currency?: Stablecoin; // Defaults to 'USD' - user selects stablecoin during payment
  mneeDepositAddress: string; // Bitcoin legacy address where MNEE should be deposited
  networkId?: number;
  tokenAddress?: string;
}

export interface PaymentResult {
  transactionHash: string;
  amount: string;
  currency: Stablecoin; // The stablecoin used for payment (USDC, DAI, etc.)
  from: string;
  to: string; // Fireblocks deposit address for EVM wallets, mneeDepositAddress for Yours wallet
  timestamp: number;
  networkId: number;
  /** Optional order breakdown with full pricing details (for e-commerce checkouts) */
  orderBreakdown?: OrderBreakdown;
  /** Optional cart items array (for multi-item e-commerce checkouts with cart enabled) */
  cartItems?: CartItem[];
  /** Custom metadata passed from checkout component (productId, orderId, sessionId, etc.) - useful for server-side validation */
  metadata?: CheckoutMetadata;
}

/**
 * Detailed breakdown of order costs
 */
export interface OrderBreakdown {
  /** Base product/service amount */
  baseAmount: number;

  /** Additional cost from selected options (e.g., size upgrades) */
  optionsTotal: number;

  /** Quantity multiplier */
  quantity: number;

  /** Subtotal (baseAmount + optionsTotal) * quantity */
  subtotal: number;

  /** Shipping cost */
  shipping: number;

  /** Tax amount */
  tax: number;

  /** Final total */
  total: number;

  /** Currency */
  currency: Stablecoin;
}

/**
 * Individual item in a shopping cart
 */
export interface CartItem {
  /** Unique identifier for this cart item */
  id: string;

  /** Product external ID (used for backend session creation) */
  productExternalId?: string;

  /** Product name */
  productName: string;

  /** Product description */
  productDescription?: string;

  /** Optional product image URL */
  productImage?: string;

  /** Base price per unit (before options) */
  baseAmount: number;

  /** Quantity of this item */
  quantity: number;

  /** Selected custom field values (e.g., {size: "Large", color: "Blue"}) */
  selectedOptions: Record<string, any>;

  /** Custom fields schema for displaying human-readable labels */
  customFieldsSchema?: CustomField[];

  /** Price modifier for each selected option (e.g., {format: 15, giftWrap: 5}) */
  optionPrices?: Record<string, number>;

  /** Additional cost from selected options */
  optionsTotal: number;

  /** Tax rate for this item (e.g., 0.08 for 8%) */
  taxRate?: number;

  /** Shipping cost for this item (in dollars) */
  shippingCost?: number;

  /** Free shipping threshold for this item (in dollars) - if item subtotal exceeds this, shipping is free */
  freeShippingThreshold?: number;

  /** Currency */
  currency: Stablecoin;
}

/**
 * Shopping cart state
 */
export interface CartState {
  /** Array of items in the cart */
  items: CartItem[];

  /** Total number of items (sum of all quantities) */
  itemCount: number;

  /** Subtotal before tax and shipping */
  subtotal: number;
}

// ============================================================================
// Calculate Totals Types
// ============================================================================

/**
 * Request to calculate totals from merchant backend
 */
export interface CalculateTotalsRequest {
  /** Items being purchased */
  items: Array<{
    productId: string;
    quantity: number;
    price?: number; // For donations with custom amounts
    customFields?: Record<string, any>; // Product variant options (size, color, etc.)
  }>;

  /** Shipping address (if applicable) */
  shippingAddress?: ShippingAddress;

  /** Customer email */
  customerEmail?: string;

  /** Checkout type */
  checkoutType: CheckoutType;
}

/**
 * Response from merchant's calculate-totals endpoint
 */
export interface CalculateTotalsResponse {
  /** Subtotal (items total before tax/shipping) */
  subtotal: number;

  /** Shipping cost */
  shipping: number;

  /** Tax amount */
  tax: number;

  /** Final total to charge */
  total: number;

  /** Optional detailed breakdown */
  breakdown?: {
    items?: Array<{
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
      jurisdiction?: string;
    };
  };
}

// ============================================================================
// Styling Types
// ============================================================================

/**
 * Custom styling configuration for the checkout component
 */
export interface StyleConfig {
  /** Border radius style - 'rounded' (default) or 'square'. Applies to both button and modal */
  borderRadius?: 'rounded' | 'square';

  /** Button size - controls the trigger button dimensions */
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /** Primary color (hex, rgb, hsl) - used for lock icon in paywall, default buttons, and confetti */
  primaryColor?: string;

  /** Accent color (hex, rgb, hsl) - used for hover states on outline/ghost buttons, focus states, and confetti */
  accentColor?: string;

  /** Main button background color (hex, rgb, hsl) - overrides default button color and is used in confetti */
  buttonColor?: string;

  /** Button text color (hex, rgb, hsl) - defaults to white for good contrast */
  buttonTextColor?: string;

  /** Custom font family to use throughout the component */
  fontFamily?: string;

  /** Custom CSS string to inject (advanced use only). Example: ".mnee-checkout button { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" */
  customCSS?: string;
}

/**
 * Configuration for the checkout trigger button
 */
export interface ButtonConfig {
  /** Button text. Defaults vary by checkout type */
  text?: string;

  /** Optional icon to display in the button */
  icon?: ReactNode;

  /** Button style variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';

  /** Button size */
  size?: 'sm' | 'default' | 'lg';

  /** Disable the button */
  disabled?: boolean;

  /** Additional CSS classes for the button */
  className?: string;
}

// ============================================================================
// Checkout Flow Types
// ============================================================================

/**
 * Configuration for paywall-style checkout (content unlocking)
 */
export interface PaywallConfig {
  /** Title shown in the paywall modal. Defaults to "Unlock Content" */
  title?: string;

  /** Description text explaining what the user will unlock */
  description?: string;

  /** Optional preview content to show before the unlock button */
  previewContent?: ReactNode;

  /** Custom message for the unlock button. Defaults to "Unlock for [amount] [currency]" */
  unlockMessage?: string;
}

/**
 * Configuration for e-commerce checkout (product purchases)
 */
export interface EcommerceConfig {
  /** Product name displayed in the checkout */
  productName?: string;

  /** Product description text */
  productDescription?: string;

  /** Product image URL (optional thumbnail shown in order summary) */
  productImage?: string;

  /** Initial quantity. Defaults to 1 */
  quantity?: number;

  /** Show quantity selector UI. Defaults to false */
  showQuantitySelector?: boolean;

  /** Whether to collect shipping address (can also use top-level collectShipping prop) */
  collectShipping?: boolean;

  /** Whether to collect billing address (not yet implemented) */
  collectBilling?: boolean;

  /** Enable shopping cart functionality for multi-item purchases. Defaults to false */
  enableCart?: boolean;
}

/**
 * Configuration for donation/tip checkout
 */
export interface DonationConfig {
  /** Name of the organization, creator, or recipient */
  organizationName?: string;

  /** Title shown in the donation modal. Defaults to "Support Us" */
  title?: string;

  /** Description text explaining what the donation supports */
  description?: string;

  /** Array of suggested donation amounts shown as quick-select buttons. Defaults to [5, 10, 25, 50] */
  suggestedAmounts?: number[];

  /** Allow users to enter a custom amount. Defaults to true */
  allowCustomAmount?: boolean;

  /** Minimum allowed donation amount (for custom amounts) */
  minAmount?: number;

  /** Maximum allowed donation amount (for custom amounts) */
  maxAmount?: number;

  /** Show a message/note field for donors to leave a comment. Defaults to false */
  collectMessage?: boolean;

  /** Placeholder text for the message field */
  messagePlaceholder?: string;

  /** Impact description (e.g., "$10 helps us host the website for a month") */
  impactMessage?: string;

  /** Custom thank you message shown on success */
  thankYouMessage?: string;

  /** Text for the donate button. Defaults to "Donate Now" */
  buttonText?: string;
}

export interface CheckoutMetadata {
  orderId?: string;
  customerId?: string;
  sessionId?: string;
  [key: string]: any;
}

// ============================================================================
// Callback Types
// ============================================================================

/**
 * Callback functions for checkout lifecycle events
 */
export interface CheckoutCallbacks {
  /**
   * Called when payment is successful. Can be async to wait for order creation.
   * SDK will wait for Promise resolution before showing success screen.
   * If Promise rejects, error screen will show with transaction hash for reconciliation.
   * Receives transaction result and all collected form data (including metadata).
   */
  onSuccess?: (result: PaymentResult, formData: Record<string, any>) => Promise<void> | void;

  /** Called when user cancels/closes the checkout modal */
  onCancel?: () => void;

  /** Called when an error occurs during payment processing */
  onError?: (error: Error) => void;

  /** Called whenever a custom field value changes */
  onFieldChange?: (fieldId: string, value: any) => void;

  /** Called when form validation fails */
  onValidationError?: (errors: Record<string, string>) => void;

  /** Called when a wallet is successfully connected */
  onWalletConnect?: (address: string, provider: WalletProvider) => void;

  /** Called when wallet is disconnected */
  onWalletDisconnect?: () => void;

  /** Called when user clicks "View Cart" button (only relevant when enableCart is true) */
  onViewCart?: () => void;
}

// ============================================================================
// Main Component Props
// ============================================================================

/**
 * Button configuration for preview mode (passed directly instead of fetched from API)
 */
export interface ButtonConfigOverride {
  buttonType: 'PAYWALL' | 'ECOMMERCE' | 'DONATION';
  name: string;
  description?: string;
  priceUsdCents?: number;
  allowCustomAmount?: boolean;
  suggestedAmounts?: number[];
  minAmountCents?: number;
  maxAmountCents?: number;
  productName?: string;
  productImage?: string;
  customFields?: Array<{
    id: string;
    label: string;
    type: 'select' | 'radio' | 'checkbox' | 'text' | 'number';
    placeholder?: string;
    required?: boolean;
    options?: Array<{
      value: string;
      label: string;
      priceModifierCents?: number;
    }>;
    defaultValue?: string;
  }>;
  // Cart settings (ecommerce)
  enableCart?: boolean;
  cartPosition?: CartPosition;
  cartDisplayMode?: 'modal' | 'drawer';
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
  buttonText?: string;
  primaryColor?: string;
}

/**
 * Props for the MneeCheckout component - hosted checkout for MNEE Pay buttons
 *
 * Usage:
 * <MneeCheckout buttonId="btn_xxx" apiBaseUrl="https://api.pay.mnee.io" />
 *
 * Preview mode (for dashboard):
 * <MneeCheckout apiBaseUrl="..." config={buttonConfig} previewMode />
 */
export interface MneeCheckoutProps extends CheckoutCallbacks {
  // Core configuration

  /** The button ID from MNEE Pay dashboard (required unless using config prop) */
  buttonId?: string;

  /** MNEE Pay API base URL */
  apiBaseUrl: string;

  /** Direct button configuration (for preview mode - bypasses API fetch) */
  config?: ButtonConfigOverride;

  /** Enable preview mode - disables actual payment processing */
  previewMode?: boolean;

  // Theme & styling

  /** Visual theme: 'light', 'dark', or 'auto' (follows system preference). Defaults to 'light' */
  theme?: Theme;

  /** Custom styling options including colors, border radius, and fonts */
  styling?: StyleConfig;

  // Modal control

  /** How the modal is triggered: 'button' (default - shows a button) or 'manual' (controlled by open prop) */
  triggerMode?: 'button' | 'manual';

  /** When triggerMode is 'manual', controls whether the modal is open. Use for programmatic control (hover, scroll triggers, etc.) */
  open?: boolean;

  /** Callback fired when modal open state changes. Use with open prop for controlled modal */
  onOpenChange?: (open: boolean) => void;

  // Wallet configuration

  /** Which wallet providers to enable. Defaults to all available: ['rainbowkit', 'walletconnect', 'yours'] */
  enabledWallets?: WalletProvider[];

  // Additional options

  /** Disable the checkout button */
  disabled?: boolean;

  /** Additional CSS classes to apply to the root element */
  className?: string;

  /** Custom content to render alongside the component */
  children?: ReactNode;

  /** Show confetti celebration animation on successful payment. Uses custom colors from styling if provided */
  showConfetti?: boolean;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface CheckoutFormData {
  customFields: Record<string, any>;
  quantity?: number;
  donationAmount?: number;
}

// ============================================================================
// Session Types
// ============================================================================

export interface CheckoutSession {
  sessionToken: string;
  sessionId: string;
  depositAddress: string;  // Fireblocks deposit address for stablecoin payments
  mneeDepositAddress: string;  // Merchant's MNEE address
  expiresAt: Date;
  mneeAmount: number; // MNEE tokens to send (1:1 with USD)
}

export interface CheckoutState {
  step: 'initial' | 'creating-session' | 'calculating-totals' | 'collecting' | 'cart' | 'selecting-payment-method' | 'connecting' | 'confirming' | 'processing' | 'complete' | 'error';
  formData: CheckoutFormData;
  errors: Record<string, string>;
  walletAddress?: string;
  walletProvider?: WalletProvider;
  paymentResult?: PaymentResult;
  session?: CheckoutSession;
  selectedPaymentMethod?: PaymentMethod;
}
