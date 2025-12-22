/**
 * Format currency amount with proper symbol
 * Always shows 2 decimal places for USD/stablecoins
 */
export function formatCurrency(amount: string | number, currency: string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Map stablecoins and USD to dollar symbol with 2 decimals
  if (currency === 'USD' || currency === 'USDC' || currency === 'USDT' || currency === 'PYUSD') {
    return `$${numAmount.toFixed(2)}`;
  }

  // For other currencies, show amount with currency code
  return `${numAmount} ${currency}`;
}
