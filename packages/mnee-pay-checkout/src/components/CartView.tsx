import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCart } from '../contexts/CartContext';
import { ShippingForm } from './ShippingForm';
import { formatCurrency } from '../lib/currency';
import { validateEmail, validateShippingAddress } from '../lib/validation';
import { toast } from 'sonner';
import { useCheckout, useUser } from '../store';

interface CartViewProps {
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
  collectEmail?: boolean;
  collectPhone?: boolean;
  collectShipping?: boolean;
}

export function CartView({
  onContinueShopping,
  onProceedToCheckout,
  collectEmail = false,
  collectPhone = false,
  collectShipping = false,
}: CartViewProps) {
  const { items, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { setErrors, errors } = useCheckout();
  const { contact, shipping, setEmail, setPhone } = useUser();

  // Determine if contact info (email/phone) and shipping are COMPLETE (all required fields filled)
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
  // Start collapsed if data is already complete, expanded if empty/incomplete
  const [isContactExpanded, setIsContactExpanded] = useState(!isContactComplete);
  const [isShippingExpanded, setIsShippingExpanded] = useState(!isShippingComplete);

  // Don't auto-collapse while typing - only collapse on blur

  // Helper function to collapse contact section when user leaves fields
  const handleContactBlur = () => {
    // Check if all required contact fields are valid
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

  const handleProceedToCheckout = () => {
    const validationErrors: Record<string, string> = {};

    // Validate email if required
    if (collectEmail) {
      const emailError = validateEmail(contact.email || '');
      if (emailError) {
        validationErrors.email = emailError;
      }
    }

    // Validate phone if required
    if (collectPhone) {
      if (!contact.phone || contact.phone.trim().length < 7) {
        validationErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Validate shipping address if required
    if (collectShipping) {
      const shippingErrors = validateShippingAddress(shipping);
      Object.assign(validationErrors, shippingErrors);
    }

    // If there are errors, set them and show toast
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    // Clear errors and proceed
    setErrors({});
    onProceedToCheckout();
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 space-y-4"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Your cart is empty</h3>
        <p className="text-muted-foreground">
          Add some items to get started
        </p>
        <Button onClick={onContinueShopping}>
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Shopping Cart</h3>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="h-8 text-xs text-destructive hover:text-destructive"
          >
            Clear Cart
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex gap-4 p-4 border border-border rounded-lg bg-muted/20"
          >
            {/* Product Image */}
            {item.productImage && (
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded-md"
              />
            )}

            {/* Item Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.baseAmount, item.currency)} each
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Options */}
              {Object.keys(item.selectedOptions).length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {Object.entries(item.selectedOptions).map(([fieldId, value]) => {
                    // Find the field definition from the schema
                    const field = item.customFieldsSchema?.find(f => f.id === fieldId);
                    const fieldLabel = field?.label || fieldId;

                    // Skip unchecked checkboxes
                    if (field?.type === 'checkbox' && !value) {
                      return null;
                    }

                    // For checkboxes, just show the label without ": True"
                    if (field?.type === 'checkbox') {
                      return (
                        <div key={fieldId}>
                          {fieldLabel}
                        </div>
                      );
                    }

                    // Get human-readable value for select/radio/text fields
                    let displayValue: string;
                    if ((field?.type === 'select' || field?.type === 'radio') && field.options) {
                      const option = field.options.find(opt => opt.value === value);
                      // Strip embedded prices from labels (e.g., "Hardcover - $39.99" → "Hardcover")
                      const labelWithoutPrice = option?.label?.replace(/\s*-\s*\$[\d,]+\.?\d*\s*$/, '') || value;
                      displayValue = labelWithoutPrice;
                    } else {
                      displayValue = value === true ? '✓' : String(value);
                    }

                    const price = item.optionPrices?.[fieldId];
                    const priceDisplay = price !== undefined && price !== 0
                      ? ` (${price >= 0 ? '+' : ''}${formatCurrency(price, item.currency)})`
                      : '';

                    return (
                      <div key={fieldId}>
                        <span>{fieldLabel}:</span> {displayValue}{priceDisplay}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    onFocus={(e) => e.target.blur()}
                    className="w-14 h-7 text-center text-sm no-spinner"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-7 w-7 border-input text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Item Total */}
                <p className="font-semibold text-foreground">
                  {formatCurrency(
                    (item.baseAmount + item.optionsTotal) * item.quantity,
                    item.currency
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Information (Email and/or Phone) */}
      {(collectEmail || collectPhone) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Contact Information</h3>
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
                  <p className="font-medium text-foreground">{contact.email}</p>
                </div>
              )}
              {collectPhone && contact.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{contact.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {collectEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
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
                  <Label htmlFor="phone" className="text-foreground">
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

      {/* Shipping Form */}
      {collectShipping && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Shipping Address</h3>
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
              <p className="font-medium text-foreground">
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onContinueShopping}
          variant="outline"
          className="flex-1 border-input text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Continue Shopping
        </Button>
        <Button
          onClick={handleProceedToCheckout}
          className="flex-1"
          size="lg"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Proceed to Checkout
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by stablecoin technology
      </p>
    </div>
  );
}
