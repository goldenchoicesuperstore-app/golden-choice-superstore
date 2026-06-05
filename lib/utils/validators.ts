/**
 * Validates standard Nigerian phone number prefixes (080, 090, 070, 081) followed by 8 digits.
 */
export const validateNigerianPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Strips all whitespace before checking
  const sanitizedPhone = phone.replace(/\s+/g, '');
  const regex = /^(080|090|070|081)\d{8}$/;
  return regex.test(sanitizedPhone);
};

/**
 * Checks if a numeric amount strictly falls between a min and max boundary.
 */
export const validateAmount = (amount: number, min: number, max: number): boolean => {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  return amount >= min && amount <= max;
};

/**
 * Strips all HTML tags from an input string to prevent basic XSS injections.
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  return input.replace(/<\/?[^>]+(>|$)/g, "");
};
