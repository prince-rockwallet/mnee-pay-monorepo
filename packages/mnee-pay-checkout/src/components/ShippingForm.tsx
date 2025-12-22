import { useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ShippingAddress } from '../types';
import { useCheckout } from '../contexts/CheckoutContext';
import { useStore } from '../store';

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  // Add more countries as needed
];

interface ShippingFormProps {
  defaultValues?: Partial<ShippingAddress>;
  onComplete?: () => void;
}

export function ShippingForm({ defaultValues, onComplete }: ShippingFormProps) {
  const { formData, updateFormData, errors } = useCheckout();
  const userInfo = useStore((state) => state.user.userInfo);
  const setShipping = useStore((state) => state.user.setShipping);

  const shipping = formData.shipping || {
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    ...defaultValues,
  };

  // Load saved shipping address on mount only
  useEffect(() => {
    if (userInfo.shipping && !formData.shipping) {
      updateFormData({ shipping: userInfo.shipping });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    const updatedShipping = {
      ...shipping,
      [field]: value,
    };

    updateFormData({
      shipping: updatedShipping,
    });

    // Save to localStorage as user types
    setShipping(updatedShipping);
  };

  const handleBlur = () => {
    // Check if all required fields are filled
    const isComplete = Boolean(
      shipping.firstName?.trim() &&
      shipping.lastName?.trim() &&
      shipping.address1?.trim() &&
      shipping.city?.trim() &&
      shipping.state?.trim() &&
      shipping.postalCode?.trim() &&
      shipping.country
    );

    if (isComplete && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={shipping.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={handleBlur}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={shipping.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={handleBlur}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address1" className="text-foreground">
          Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address1"
          value={shipping.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          onBlur={handleBlur}
          className={errors.address1 ? 'border-destructive' : ''}
        />
        {errors.address1 && (
          <p className="text-sm text-destructive">{errors.address1}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address2" className="text-foreground">Apartment, suite, etc. (optional)</Label>
        <Input
          id="address2"
          value={shipping.address2 || ''}
          onChange={(e) => handleChange('address2', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-foreground">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={shipping.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={handleBlur}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-foreground">
            State/Province <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            value={shipping.state}
            onChange={(e) => handleChange('state', e.target.value)}
            onBlur={handleBlur}
            className={errors.state ? 'border-destructive' : ''}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-foreground">
            Postal Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postalCode"
            value={shipping.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            onBlur={handleBlur}
            className={errors.postalCode ? 'border-destructive' : ''}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-foreground">
            Country <span className="text-destructive">*</span>
          </Label>
          <Select
            value={shipping.country}
            onValueChange={(value) => handleChange('country', value)}
          >
            <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
}
