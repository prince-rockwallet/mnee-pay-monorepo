import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { CartPosition } from '../types';
import { cn } from '../lib/utils';
import { useCart } from '../store';

interface FloatingCartButtonProps {
  onClick: () => void;
  position?: CartPosition;
  /** Custom CSS class for additional styling */
  className?: string;
  /** Inline styles for fine-grained positioning control */
  style?: React.CSSProperties;
  /** Button background color */
  buttonColor?: string;
  /** Button text/icon color */
  buttonTextColor?: string;
}

const positionClasses: Record<CartPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export function FloatingCartButton({ onClick, position = 'top-right', className, style, buttonColor, buttonTextColor }: FloatingCartButtonProps) {
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  // Only render portal after mount to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render if cart is empty
  if (itemCount === 0) {
    return null;
  }

  // Build custom button styles
  const buttonStyles: React.CSSProperties = {};
  if (buttonColor) {
    buttonStyles.backgroundColor = buttonColor;
    buttonStyles.borderColor = buttonColor;
  }
  if (buttonTextColor) {
    buttonStyles.color = buttonTextColor;
  }

  const buttonContent = (
    <div
      className={cn('fixed z-[9999]', positionClasses[position], className)}
      style={style}
    >
      <Button
        onClick={onClick}
        size="lg"
        className={cn(
          "relative shadow-lg hover:shadow-xl transition-shadow rounded-full h-14 w-14 p-0",
          buttonColor && "hover:opacity-90"
        )}
        style={Object.keys(buttonStyles).length > 0 ? buttonStyles : undefined}
      >
        <ShoppingCart className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </Button>
    </div>
  );

  // Use portal to render at document.body level to avoid CSS containment issues
  if (mounted && typeof document !== 'undefined') {
    return createPortal(buttonContent, document.body);
  }

  return null;
}
