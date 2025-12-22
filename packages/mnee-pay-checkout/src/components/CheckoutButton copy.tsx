import { Button } from './ui/button';
import { ButtonConfig, StyleConfig, CheckoutType } from '../types';
import { ShoppingCart, Lock, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface CheckoutButtonProps {
  onClick: () => void;
  config?: ButtonConfig;
  styling?: StyleConfig;
  checkoutType: CheckoutType;
}

export function CheckoutButton({ onClick, config, styling, checkoutType }: CheckoutButtonProps) {
  // Set defaults based on checkout type
  const getDefaults = () => {
    switch (checkoutType) {
      case 'donation':
        return {
          text: 'Donate',
          icon: <Heart className="mr-2 h-4 w-4" />,
        };
      case 'paywall':
        return {
          text: 'Unlock',
          icon: <Lock className="mr-2 h-4 w-4" />,
        };
      case 'ecommerce':
      default:
        return {
          text: 'Checkout',
          icon: <ShoppingCart className="mr-2 h-4 w-4" />,
        };
    }
  };

  const defaults = getDefaults();

  const {
    text = defaults.text,
    icon = defaults.icon,
    variant = 'default',
    size = 'default',
    disabled = false,
    className = '',
  } = config || {};

  // Determine button size from styling (takes precedence) or config
  const buttonSize = styling?.buttonSize || size;

  // Build custom styles object - only include properties that are set
  const customStyles: React.CSSProperties = {};
  if (styling?.buttonColor) {
    customStyles.backgroundColor = styling.buttonColor;
    // Add hover styles via !important to override Tailwind
    customStyles.borderColor = styling.buttonColor;
  }
  if (styling?.buttonTextColor) {
    customStyles.color = styling.buttonTextColor;
  }
  if (styling?.fontFamily) {
    customStyles.fontFamily = styling.fontFamily;
  }

  // Border radius - 'square' = no rounding, 'rounded' (default) = normal rounding
  const borderRadiusClass = styling?.borderRadius === 'square' ? 'rounded-none' : '';

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={buttonSize as any}
      disabled={disabled}
      className={cn(
        className,
        borderRadiusClass,
        // Override hover state when custom colors are applied
        styling?.buttonColor && 'hover:opacity-90'
      )}
      style={Object.keys(customStyles).length > 0 ? customStyles : undefined}
    >
      {icon}
      {text}
    </Button>
  );
}
