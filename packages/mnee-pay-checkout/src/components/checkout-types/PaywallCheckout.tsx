import { useState, useEffect } from 'react';
import { Lock, Unlock, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PaywallConfig, CustomField } from '../../types';
import { DynamicForm } from '../DynamicForm';
import { useCheckout } from '../../contexts/CheckoutContext';
import { formatCurrency } from '../../lib/currency';
import { calculateOptionsTotal } from '../../lib/pricing';
import { validateFields, validateEmail } from '../../lib/validation';
import { toast } from 'sonner';
import { useStore } from '../../store';

interface PaywallCheckoutProps {
  config?: PaywallConfig;
  product: {
    name: string;
    priceUsdCents: number;
  };
  customFields?: CustomField[];
  onProceedToPayment: () => void;
  collectEmail?: boolean;
  collectPhone?: boolean;
  taxRatePercent?: number;
  shippingCostCents?: number;
}

export function PaywallCheckout({
  config,
  product,
  customFields,
  onProceedToPayment,
  collectEmail,
  collectPhone,
  taxRatePercent,
  shippingCostCents,
}: PaywallCheckoutProps) {
  const { formData, updateFormData, setErrors, errors } = useCheckout();
  const userInfo = useStore((state) => state.user.userInfo);
  const setEmail = useStore((state) => state.user.setEmail);
  const setPhone = useStore((state) => state.user.setPhone);

  // Load saved email on mount only
  useEffect(() => {
    const updates: Record<string, string> = {};
    if (collectEmail && userInfo.contact.email && !formData.email) {
      updates.email = userInfo.contact.email;
    }
    if (collectPhone && userInfo.contact.phone && !formData.phone) {
      updates.phone = userInfo.contact.phone;
    }
    if (Object.keys(updates).length > 0) {
      updateFormData(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Determine if contact info (email/phone) is COMPLETE
  const isContactComplete = Boolean(
    (!collectEmail || (formData.email && formData.email.includes('@') && formData.email.includes('.'))) &&
    (!collectPhone || (formData.phone && formData.phone.trim().length >= 7))
  );

  // Track if contact section is expanded or collapsed
  const [isContactExpanded, setIsContactExpanded] = useState(!isContactComplete);

  // Helper function to collapse contact section when user leaves fields
  const handleContactBlur = () => {
    const emailValid = !collectEmail || (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email));
    const phoneValid = !collectPhone || (formData.phone && formData.phone.trim().length >= 7);

    if (emailValid && phoneValid) {
      setIsContactExpanded(false);
    }
  };

  const baseAmount = product.priceUsdCents / 100;
  const optionsTotal = calculateOptionsTotal(customFields, formData);
  const subtotal = baseAmount + optionsTotal;

  // Calculate tax and shipping
  const taxAmount = taxRatePercent && taxRatePercent > 0
    ? subtotal * (taxRatePercent / 100)
    : 0;
  const shippingAmount = shippingCostCents && shippingCostCents > 0
    ? shippingCostCents / 100
    : 0;
  const total = subtotal + taxAmount + shippingAmount;

  // Check if we need to show breakdown (only show if amounts are meaningful - at least 1 cent)
  const showTax = taxRatePercent && taxRatePercent > 0 && taxAmount >= 0.005;
  const showShipping = shippingAmount >= 0.005;
  const hasTaxOrShipping = showTax || showShipping;

  const handleProceed = () => {
    const errors: Record<string, string> = {};

    // Validate email if required
    if (collectEmail) {
      const emailError = validateEmail(formData.email || "");
      if (emailError) {
        errors.email = emailError;
      }
    }

    // Validate phone if required
    if (collectPhone) {
      if (!formData.phone || formData.phone.trim().length < 7) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    // Validate custom fields
    if (customFields && customFields.length > 0) {
      const fieldErrors = validateFields(customFields, formData);
      Object.assign(errors, fieldErrors);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">
          {config?.title || 'Premium Content'}
        </h2>
        <p className="text-muted-foreground">
          {config?.description || 'Unlock this content with a one-time payment'}
        </p>
      </div>

      {/* Preview Content */}
      {config?.previewContent && (
        <div className="border rounded-lg p-4 bg-muted/30">
          {config.previewContent}
        </div>
      )}

      {/* Payment Details */}
      <div className="border border-border rounded-lg p-4 space-y-2 bg-muted/20">
        {(optionsTotal > 0 || hasTaxOrShipping) ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Amount</span>
              <span className="text-foreground">
                {formatCurrency(baseAmount, 'USD')}
              </span>
            </div>
            {optionsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Options</span>
                <span className="text-foreground">
                  {formatCurrency(optionsTotal, 'USD')}
                </span>
              </div>
            )}
            {showTax && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRatePercent}%)</span>
                <span className="text-foreground">
                  {formatCurrency(taxAmount, 'USD')}
                </span>
              </div>
            )}
            {showShipping && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">
                  {formatCurrency(shippingAmount, 'USD')}
                </span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                {formatCurrency(total, 'USD')}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(baseAmount, 'USD')}
            </span>
          </div>
        )}
      </div>

      {/* Contact Information (Email and/or Phone) */}
      {(collectEmail || collectPhone) && (
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
              {collectEmail && formData.email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
              )}
              {collectPhone && formData.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{formData.phone}</p>
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
                    value={formData.email || ''}
                    onChange={(e) => {
                      updateFormData({ email: e.target.value });
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
                    value={formData.phone || ''}
                    onChange={(e) => {
                      updateFormData({ phone: e.target.value });
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

      {/* Custom Fields */}
      {customFields && customFields.length > 0 && (
        <DynamicForm fields={customFields} />
      )}

      {/* Unlock Button */}
      <Button
        onClick={handleProceed}
        className="w-full"
        size="lg"
      >
        <Unlock className="mr-2 h-5 w-5" />
        {config?.unlockMessage || `Unlock for ${formatCurrency(total, 'USD')}`}
      </Button>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by stablecoin technology
      </p>
    </div>
  );
}
