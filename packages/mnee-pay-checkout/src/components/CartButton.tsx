import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

export function CartButton({ onClick, className }: CartButtonProps) {
  const { itemCount } = useCart();

  return (
    <div className={cn('relative', className)}>
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className="relative"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>
    </div>
  );
}
