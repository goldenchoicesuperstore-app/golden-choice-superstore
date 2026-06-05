/**
 * Formats a numeric amount into Nigerian Naira (₦) string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a Firestore Timestamp or standard Date into a readable string.
 */
export const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

/**
 * Truncates text to a specified maximum length and appends an ellipsis.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generates a unique, readable order number for customers.
 * Format: GCS-{TIMESTAMP}-{RANDOM4}
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `GCS-${timestamp}-${random}`;
};

/**
 * Converts a string into a URL-friendly slug.
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove non-word characters
    .replace(/[\s_-]+/g, '-')    // Replace spaces and underscores with dashes
    .replace(/^-+|-+$/g, '');    // Trim dashes from start and end
};
