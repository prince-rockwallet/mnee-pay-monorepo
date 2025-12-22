import validate, {
  AddressType,
  getAddressInfo,
  Network,
} from 'bitcoin-address-validation';

/**
 * Validates a Bitcoin address for MNEE deposits
 * @param address - The Bitcoin address to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateMneeDepositAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || !address.trim()) {
    return {
      isValid: false,
      error: 'Bitcoin address is required',
    };
  }

  try {
    const info = getAddressInfo(address);

    if (info.type !== AddressType.p2pkh) {
      return {
        isValid: false,
        error: 'Please enter a valid Bitcoin legacy address starting with 1',
      };
    }

    const isValid = validate(address, 'mainnet' as Network);
    if (!isValid) {
      return {
        isValid: false,
        error: 'Please enter a valid Bitcoin legacy address',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Please enter a valid Bitcoin legacy address',
    };
  }
}
