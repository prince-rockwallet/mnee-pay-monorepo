import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ShippingAddress } from '../types';
import { useCheckout, useUser } from '../store';

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
  const { errors } = useCheckout();
  const { shipping, setShipping } = useUser();

  const shippingAddress = shipping || {
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

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    const updatedShipping: ShippingAddress = {
      ...shippingAddress,
      [field]: value,
    };

    setShipping(updatedShipping);
  };

  const handleBlur = () => {
    const isComplete = Boolean(
      shippingAddress.firstName?.trim() &&
      shippingAddress.lastName?.trim() &&
      shippingAddress.address1?.trim() &&
      shippingAddress.city?.trim() &&
      shippingAddress.state?.trim() &&
      shippingAddress.postalCode?.trim() &&
      shippingAddress.country
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
            value={shippingAddress.firstName}
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
            value={shippingAddress.lastName}
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
          value={shippingAddress.address1}
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
          value={shippingAddress.address2 || ''}
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
            value={shippingAddress.city}
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
            value={shippingAddress.state}
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
            value={shippingAddress.postalCode}
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
            value={shippingAddress.country}
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
