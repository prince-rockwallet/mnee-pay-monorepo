import { useState } from 'react';
import { ShoppingBag, Minus, Plus, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { EcommerceConfig, CustomField } from '../../types';
import { DynamicForm } from '../DynamicForm';
import { ShippingForm } from '../ShippingForm';
import { formatCurrency } from '../../lib/currency';
import { calculateOptionsTotal, getOptionPrices } from '../../lib/pricing';
import { validateFields, validateEmail, validateShippingAddress } from '../../lib/validation';
import { toast } from 'sonner';
import { useCart, useCheckout, useUser } from '../../store';

interface EcommerceCheckoutProps {
  config?: EcommerceConfig;
  product: {
    externalId: string; // Required - used by merchant server to look up product
    name: string;
    description?: string;
    priceUsdCents: number;
  };
  customFields?: CustomField[];
  onProceedToPayment: () => void;
  onClose?: () => void;
  onViewCart?: () => void;
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectShipping?: boolean;
  // Tax and shipping for this product (stored per cart item)
  taxRatePercent?: number;
  shippingCostCents?: number;
  freeShippingThreshold?: number;
}

export function EcommerceCheckout({
  config,
  product,
  customFields,
  onProceedToPayment,
  onClose,
  onViewCart,
  collectEmail,
  collectPhone,
  collectShipping,
  taxRatePercent,
  shippingCostCents,
  freeShippingThreshold,
}: EcommerceCheckoutProps) {
  const { formData, updateFormData, setErrors, errors } = useCheckout();
  const { contact, shipping, setEmail, setPhone } = useUser();
  const { addToCart, itemCount } = useCart();
  const quantity = formData.quantity || config?.quantity || 1;
  const isCartEnabled = config?.enableCart || false;

  // Determine if contact info (email/phone) and shipping are COMPLETE
  const isContactComplete = Boolean(
    (!collectEmail || (contact.email && contact.email.includes('@') && contact.email.includes('.'))) &&
    (!collectPhone || (contact.phone && contact.phone.trim().length >= 7))
  );
  const isShippingComplete = Boolean(
    shipping?.firstName &&
    shipping?.lastName &&
    shipping?.address1 &&
    shipping?.city &&
    shipping?.state &&
    shipping?.postalCode &&
    shipping?.country
  );

  // Track if contact/shipping sections are expanded or collapsed
  const [isContactExpanded, setIsContactExpanded] = useState(!isContactComplete);
  const [isShippingExpanded, setIsShippingExpanded] = useState(!isShippingComplete);

  // Helper function to collapse contact section when user leaves fields
  const handleContactBlur = () => {
    const emailValid = !collectEmail || (contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email));
    const phoneValid = !collectPhone || (contact.phone && contact.phone.trim().length >= 7);

    if (emailValid && phoneValid) {
      setIsContactExpanded(false);
    }
  };

  // Helper function to collapse shipping when user leaves the last field
  const handleShippingBlur = () => {
    // Only collapse if all required fields are filled and valid
    const isValid = Boolean(
      shipping?.firstName &&
      shipping?.lastName &&
      shipping?.address1 &&
      shipping?.city &&
      shipping?.state &&
      shipping?.postalCode &&
      shipping?.country &&
      shipping.firstName.trim().length > 0 &&
      shipping.lastName.trim().length > 0
    );

    if (isValid) {
      setIsShippingExpanded(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateFormData({ quantity: newQuantity });
  };

  const handleAddToCart = () => {
    const errors: Record<string, string> = {};

    // Validate custom fields (e.g., size, color) before adding to cart
    if (customFields && customFields.length > 0) {
      const fieldErrors = validateFields(customFields, formData);
      Object.assign(errors, fieldErrors);
    }

    // If there are errors, set them and show toast
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.error('Please select all required options');
      return;
    }

    // Clear errors
    setErrors({});

    // Add item to cart
    const baseAmount = product.priceUsdCents / 100;
    const optionsTotal = calculateOptionsTotal(customFields, formData);
    const optionPrices = getOptionPrices(customFields, formData);

    addToCart({
      productExternalId: product.externalId,
      productName: config?.productName || product.name,
      productDescription: product.description,
      productImage: config?.productImage,
      baseAmount,
      quantity,
      selectedOptions: formData.customFields,
      customFieldsSchema: customFields,
      optionPrices,
      optionsTotal,
      // Store tax and shipping config per item so cart can calculate correctly
      taxRate: taxRatePercent ? taxRatePercent / 100 : 0,
      shippingCost: shippingCostCents ? shippingCostCents / 100 : 0,
      freeShippingThreshold: freeShippingThreshold ? freeShippingThreshold / 100 : undefined,
      currency: 'USD',
    });

    // Show success toast
    toast.success(`Added ${quantity} ${config?.productName || 'item'}(s) to cart`);

    // Reset quantity and custom fields for next add
    updateFormData({
      quantity: 1,
      customFields: {},
    });

    // Close modal after adding to cart
    if (onClose) {
      onClose();
    }
  };

  const handleProceed = () => {
    const errors: Record<string, string> = {};

    // Validate email if required
    if (collectEmail) {
      const emailError = validateEmail(contact.email || "");
      if (emailError) {
        errors.email = emailError;
      }
    }

    // Validate phone if required
    if (collectPhone) {
      if (!contact.phone || contact.phone.trim().length < 7) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Validate custom fields (e.g., size, color)
    if (customFields && customFields.length > 0) {
      const fieldErrors = validateFields(customFields, formData);
      Object.assign(errors, fieldErrors);
    }

    // Validate shipping address if required
    if (collectShipping) {
      const shippingErrors = validateShippingAddress(shipping);
      Object.assign(errors, shippingErrors);
    }

    // If there are errors, set them and show toast
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    // Clear errors and proceed
    setErrors({});
    onProceedToPayment();
  };

  const baseAmount = product.priceUsdCents / 100;
  const optionsTotal = calculateOptionsTotal(customFields, formData);
  const subtotal = (baseAmount + optionsTotal) * quantity;
  // Tax and shipping will be calculated by merchant backend during checkout
  // For now, just show subtotal in the UI

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {config?.productImage && (
          <img
            src={config.productImage}
            alt={config.productName || 'Product'}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">
            {config?.productName || 'Product'}
          </h2>
          {config?.productDescription && (
            <p className="text-sm text-muted-foreground mt-1">
              {config.productDescription}
            </p>
          )}
          <p className="text-lg font-semibold mt-2">
            {formatCurrency(product.priceUsdCents / 100, 'USD')}
          </p>
        </div>
      </div>

      {/* Quantity Selector */}
      {config?.showQuantitySelector !== false && (
        <div className="space-y-2">
          <Label>Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              onFocus={(e) => e.target.blur()}
              className="w-20 text-center no-spinner"
              min="1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Custom Fields (e.g., size, color) */}
      {customFields && customFields.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Product Options</h3>
          <DynamicForm fields={customFields} />
        </div>
      )}

      {/* Contact Information (Email and/or Phone) - Only show for direct checkout, not for cart-enabled products */}
      {(collectEmail || collectPhone) && !isCartEnabled && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Contact Information</h3>
            {isContactComplete && !isContactExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContactExpanded(true)}
                className="h-8 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {!isContactExpanded && isContactComplete ? (
            <div className="bg-muted/30 rounded-md p-3 text-sm space-y-2">
              {collectEmail && contact.email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{contact.email}</p>
                </div>
              )}
              {collectPhone && contact.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{contact.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {collectEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contact.email || ''}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    onBlur={handleContactBlur}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              )}
              {collectPhone && (
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={contact.phone || ''}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    onBlur={handleContactBlur}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shipping Form - Only show for direct checkout, not for cart-enabled products */}
      {collectShipping && !isCartEnabled && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Shipping Address</h3>
            {isShippingComplete && !isShippingExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsShippingExpanded(true)}
                className="h-8 text-xs"
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {!isShippingExpanded && isShippingComplete && shipping ? (
            <div className="bg-muted/30 rounded-md p-3 text-sm space-y-1">
              <p className="font-medium">
                {shipping.firstName} {shipping.lastName}
              </p>
              <p className="text-muted-foreground">{shipping.address1}</p>
              {shipping.address2 && (
                <p className="text-muted-foreground">{shipping.address2}</p>
              )}
              <p className="text-muted-foreground">
                {shipping.city}, {shipping.state} {shipping.postalCode}
              </p>
              <p className="text-muted-foreground">{shipping.country}</p>
            </div>
          ) : (
            <ShippingForm onComplete={handleShippingBlur} />
          )}
        </div>
      )}

      {/* Order Summary - Only show for direct checkout, not for cart-enabled products */}
      {!isCartEnabled && (
        <div className="border border-border rounded-lg p-4 space-y-2 bg-muted/20">
          <h3 className="font-semibold mb-2 text-foreground">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Item{quantity > 1 ? `s (${quantity})` : ''}
            </span>
            <span className="text-foreground">{formatCurrency(baseAmount * quantity, 'USD')}</span>
          </div>
          {optionsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Options</span>
              <span className="text-foreground">{formatCurrency(optionsTotal * quantity, 'USD')}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span className="text-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(subtotal, 'USD')}</span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Tax and shipping calculated at checkout
          </div>
        </div>
      )}

      {/* Checkout/Cart Buttons */}
      {isCartEnabled ? (
        <>
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="lg"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          {itemCount > 0 && (onViewCart || onClose) && (
            <Button
              onClick={() => {
                if (onViewCart) {
                  onViewCart();
                } else if (onClose) {
                  onClose();
                }
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              View Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </Button>
          )}
        </>
      ) : (
        <Button
          onClick={handleProceed}
          className="w-full"
          size="lg"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Proceed to Payment
        </Button>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by stablecoin technology
      </p>
    </div>
  );
}
