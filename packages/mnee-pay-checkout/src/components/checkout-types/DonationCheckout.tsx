import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DonationConfig, CustomField } from '../../types';
import { DynamicForm } from '../DynamicForm';
import { useCheckout } from '../../contexts/CheckoutContext';
import { formatCurrency } from '../../lib/currency';
import { validateFields, validateEmail } from '../../lib/validation';
import { toast } from 'sonner';
import { useStore } from '../../store';

interface DonationCheckoutProps {
  config?: DonationConfig;
  product: {
    name: string;
    priceUsdCents: number;
  };
  customFields?: CustomField[];
  onProceedToPayment: () => void;
  collectEmail?: boolean;
  collectPhone?: boolean;
  taxRatePercent?: number;
}

export function DonationCheckout({
  config,
  product,
  customFields,
  onProceedToPayment,
  collectEmail,
  collectPhone,
  taxRatePercent,
}: DonationCheckoutProps) {
  const { formData, updateFormData, setErrors, errors } = useCheckout();
  const userInfo = useStore((state) => state.user.userInfo);
  const setEmail = useStore((state) => state.user.setEmail);
  const setPhone = useStore((state) => state.user.setPhone);

  const defaultSuggestedAmounts = [5, 10, 25, 50];
  const suggestedAmounts = config?.suggestedAmounts || defaultSuggestedAmounts;
  const allowCustomAmount = config?.allowCustomAmount ?? true;

  const [selectedAmount, setSelectedAmount] = useState<number | null>((product.priceUsdCents / 100) || (allowCustomAmount? formData.donationAmount: 0) || null);
  const [customAmount, setCustomAmount] = useState<string>(`${(product.priceUsdCents / 100) || (allowCustomAmount? formData.donationAmount: 0) || ''}`);
  const [isCustom, setIsCustom] = useState(false);

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

  // Start collapsed if data is already complete
  const [isContactExpanded, setIsContactExpanded] = useState(!isContactComplete);

  // Helper function to collapse contact section when user leaves fields
  const handleContactBlur = () => {
    const emailValid = !collectEmail || (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email));
    const phoneValid = !collectPhone || (formData.phone && formData.phone.trim().length >= 7);

    if (emailValid && phoneValid) {
      setIsContactExpanded(false);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    updateFormData({ donationAmount: amount });
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedAmount(numValue);
      updateFormData({ donationAmount: numValue });
    } else {
      setSelectedAmount(null);
    }
  };

  const finalAmount = isCustom ? (customAmount ? parseFloat(customAmount) : null) : selectedAmount;

  // Calculate tax if applicable
  const taxAmount = taxRatePercent && taxRatePercent > 0 && finalAmount
    ? finalAmount * (taxRatePercent / 100)
    : 0;
  const totalWithTax = finalAmount ? finalAmount + taxAmount : null;
  // Only show tax if it rounds to at least 1 cent
  const showTax = Boolean(taxRatePercent && taxRatePercent > 0 && taxAmount >= 0.005);

  const handleProceed = () => {
    const errors: Record<string, string> = {};

    // Validate amount
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please select or enter a donation amount');
      return;
    }

    if (config?.minAmount && finalAmount < config.minAmount) {
      toast.error(`Minimum donation amount is ${formatCurrency(config.minAmount, 'USD')}`);
      return;
    }

    if (config?.maxAmount && finalAmount > config.maxAmount) {
      toast.error(`Maximum donation amount is ${formatCurrency(config.maxAmount, 'USD')}`);
      return;
    }

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

    // IMPORTANT: Ensure donation amount is in formData before proceeding
    // This handles the case where user entered custom amount
    if (finalAmount && finalAmount !== formData.donationAmount) {
      updateFormData({ donationAmount: finalAmount });
    }

    console.log('[DonationCheckout] Proceeding to payment with:', {
      finalAmount,
      'formData.donationAmount': formData.donationAmount,
      isCustom,
      customAmount,
    });

    // Clear errors and proceed
    setErrors({});
    onProceedToPayment();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary fill-primary/20" />
        </div>
        {config?.organizationName && (
          <p className="text-sm font-medium text-primary">
            {config.organizationName}
          </p>
        )}
        <h2 className="text-2xl font-bold">
          {config?.title || 'Support Us'}
        </h2>
        <p className="text-muted-foreground">
          {config?.description || 'Your contribution helps us continue our work'}
        </p>
      </div>

      {/* Impact Message */}
      {config?.impactMessage && (
        <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r">
          <p className="text-sm text-muted-foreground">
            {config.impactMessage}
          </p>
        </div>
      )}

      {/* Amount Selection */}
      <div className="space-y-3">
        <Label>Select Amount</Label>
        <div className="grid grid-cols-2 gap-3">
          {suggestedAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAmountSelect(amount)}
              className={`
                relative px-4 py-3 rounded-lg border-2 transition-all
                ${selectedAmount === amount && !isCustom
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <span className="text-lg">
                {formatCurrency(amount, 'USD')}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        {allowCustomAmount && (
          <div className="space-y-2">
            <Label htmlFor="customAmount">Or enter custom amount</Label>
            <div className="relative">
              <Input
                id="customAmount"
                type="number"
                placeholder={`Min: ${config?.minAmount || 1}`}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min={config?.minAmount || 0.01}
                max={config?.maxAmount}
                step="0.01"
                className={isCustom ? 'border-primary' : ''}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {'USD'}
              </span>
            </div>
            {config?.minAmount && customAmount && parseFloat(customAmount) < config.minAmount && (
              <p className="text-xs text-destructive">
                Minimum amount is {formatCurrency(config.minAmount, 'USD')}
              </p>
            )}
            {config?.maxAmount && customAmount && parseFloat(customAmount) > config.maxAmount && (
              <p className="text-xs text-destructive">
                Maximum amount is {formatCurrency(config.maxAmount, 'USD')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Summary - only show when tax applies and amount is selected */}
      {showTax && finalAmount && (
        <div className="border border-border rounded-lg p-4 space-y-2 bg-muted/20">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Donation Amount</span>
            <span className="text-foreground">
              {formatCurrency(finalAmount, 'USD')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({taxRatePercent}%)</span>
            <span className="text-foreground">
              {formatCurrency(taxAmount, 'USD')}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">
              {formatCurrency(totalWithTax || 0, 'USD')}
            </span>
          </div>
        </div>
      )}

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

      {/* Message/Note Field */}
      {config?.collectMessage && (
        <div className="space-y-2">
          <Label htmlFor="donationMessage">Message (Optional)</Label>
          <Textarea
            id="donationMessage"
            placeholder={config?.messagePlaceholder || 'Leave a message...'}
            onChange={(e) => updateFormData({
              customFields: {
                ...{},
                donationMessage: e.target.value
              }
            })}
            rows={3}
          />
        </div>
      )}

      {/* Custom Fields */}
      {customFields && customFields.length > 0 && (
        <DynamicForm fields={customFields} />
      )}

      {/* Donate Button */}
      <Button
        onClick={handleProceed}
        className="w-full"
        size="lg"
      >
        <Heart className="mr-2 h-5 w-5" />
        {finalAmount
          ? (config?.buttonText || 'Donate Now')
          : 'Select Amount'}
      </Button>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        Your donation is processed securely via stablecoin payment
      </p>
    </div>
  );
}
