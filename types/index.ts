/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string;
  /** URL to the user's profile photo */
  photoURL: string;
  /** User's role in the system */
  role: 'customer' | 'admin';
  /** User's phone number */
  phone: string;
  /** Timestamp when the user was created */
  createdAt: string;
  /** Number of loyalty points the user has accumulated */
  loyaltyPoints: number;
}

/**
 * Represents a product in the store.
 */
export interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Name of the product */
  name: string;
  /** URL-friendly slug for the product */
  slug: string;
  /** Detailed description of the product */
  description: string;
  /** Current selling price of the product */
  price: number;
  /** Original price for comparison (e.g., for discounts) */
  compareAtPrice: number | null;
  /** URL to the primary image of the product */
  imageUrl: string;
  /** Category ID the product belongs to */
  category: string;
  /** Brand of the product */
  brand: string;
  /** Indicates if the product is currently in stock */
  inStock: boolean;
  /** Number of items available in stock */
  stockQuantity: number;
  /** Indicates if the product is featured on the homepage/store */
  isFeatured: boolean;
  /** Average rating of the product */
  rating: number;
  /** Number of reviews the product has received */
  reviewCount: number;
  /** Number of times the product has been sold */
  soldCount: number;
  /** Timestamp when the product was created */
  createdAt: string;
  /** Timestamp when the product was last updated */
  updatedAt: string;
  /** Indicates if the product is visible to customers */
  isPublished: boolean;
}

/**
 * Represents a product category.
 */
export interface ProductCategory {
  /** Unique identifier for the category */
  id: string;
  /** Name of the category */
  name: string;
  /** URL-friendly slug for the category */
  slug: string;
  /** Description of the category */
  description: string;
  /** URL to the category's image */
  imageUrl: string;
  /** Display order of the category */
  order: number;
  /** Indicates if the category is currently active/visible */
  isActive: boolean;
  /** Name or URL of the icon representing the category */
  icon: string;
}

/**
 * Represents an item in a user's shopping cart.
 */
export interface CartItem {
  /** Unique identifier of the product */
  productId: string;
  /** Name of the product */
  name: string;
  /** URL to the product's image */
  imageUrl: string;
  /** Price of a single unit of the product */
  price: number;
  /** Quantity of the product in the cart */
  quantity: number;
  /** Maximum quantity allowed for this product */
  maxQuantity: number;
}

/**
 * Represents a user's shopping cart.
 */
export interface Cart {
  /** Unique identifier of the user who owns the cart */
  userId: string;
  /** Array of items currently in the cart */
  items: CartItem[];
  /** Subtotal of all items before fees/taxes */
  subtotal: number;
  /** Cost of delivery */
  deliveryFee: number;
  /** Total cost including items and delivery fee */
  total: number;
  /** Timestamp when the cart was last updated */
  updatedAt: string;
}

/**
 * Represents an item within an order.
 */
export interface OrderItem {
  /** Unique identifier of the product */
  productId: string;
  /** Name of the product */
  name: string;
  /** URL to the product's image */
  imageUrl: string;
  /** Price of a single unit of the product at the time of order */
  price: number;
  /** Quantity of the product ordered */
  quantity: number;
  /** Total price for this item (price * quantity) */
  total: number;
}

/**
 * Shipping address information.
 */
export interface ShippingAddress {
  /** Full Name of recipient */
  fullName?: string;
  /** Street address */
  street: string;
  /** City */
  city: string;
  /** State or province */
  state: string;
  /** Local Government Area (LGA) */
  lga?: string;
  /** Postal or zip code */
  postalCode?: string;
  /** Country */
  country: string;
}

/**
 * Enum for possible order statuses.
 */
export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Refunded = 'refunded'
}

/**
 * Enum for possible payment statuses.
 */
export enum PaymentStatus {
  Unpaid = 'unpaid',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded'
}

/**
 * Represents a customer's order.
 */
export interface Order {
  /** Unique identifier for the order */
  id: string;
  /** Human-readable order number */
  orderNumber: string;
  /** Unique identifier of the user who placed the order */
  userId: string;
  /** Email address of the user at the time of order */
  userEmail: string;
  /** Phone number of the user at the time of order */
  userPhone: string;
  /** Array of items included in the order */
  items: OrderItem[];
  /** Shipping address details */
  shippingAddress: ShippingAddress;
  /** Subtotal of all items */
  subtotal: number;
  /** Cost of delivery */
  deliveryFee: number;
  /** Amount of tax applied */
  tax: number;
  /** Final total cost of the order */
  total: number;
  /** Current payment status */
  paymentStatus: PaymentStatus;
  /** Method used for payment (e.g., 'card', 'bank_transfer') */
  paymentMethod: string;
  /** Reference ID from the payment gateway (e.g., Paystack) */
  paystackReference: string;
  /** Current fulfillment status of the order */
  orderStatus: OrderStatus;
  /** Timestamp when the order was placed */
  createdAt: string;
  /** Timestamp when the order was last updated */
  updatedAt: string;
}

/**
 * Represents a single message in a chat.
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** ID of the chat session this message belongs to */
  chatId: string;
  /** ID of the user or admin who sent the message */
  senderId: string;
  /** Name of the sender */
  senderName: string;
  /** Type of sender */
  senderType: 'user' | 'admin';
  /** Content of the message */
  body: string;
  /** Timestamp when the message was sent */
  createdAt: string;
  /** Indicates if the message has been read by the recipient */
  isRead: boolean;
}

/**
 * Represents a support chat session between a user and an admin.
 */
export interface SupportChat {
  /** Unique identifier for the chat session */
  id: string;
  /** ID of the user initiating the chat */
  userId: string;
  /** Name of the user */
  userName: string;
  /** Email of the user */
  userEmail: string;
  /** Current status of the chat session */
  status: 'open' | 'assigned' | 'resolved';
  /** Content of the most recent message in the chat */
  lastMessage: string;
  /** Timestamp of the most recent message */
  lastMessageAt: string;
  /** Number of messages unread by an admin */
  unreadByAdmin: number;
}

/**
 * Represents a notification sent to a user.
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** ID of the user receiving the notification */
  userId: string;
  /** Title or heading of the notification */
  title: string;
  /** Detailed content of the notification */
  body: string;
  /** Type or category of the notification (e.g., 'order_update', 'promo') */
  type: string;
  /** Indicates if the user has read the notification */
  isRead: boolean;
  /** Timestamp when the notification was created */
  createdAt: string;
}

/**
 * Represents statistical data for an admin dashboard.
 */
export interface DashboardStats {
  /** Total revenue generated across all time */
  totalRevenue: number;
  /** Total number of orders placed across all time */
  totalOrders: number;
  /** Total number of registered customers */
  totalCustomers: number;
  /** Total number of products in the store */
  totalProducts: number;
  /** Number of orders placed today */
  ordersToday: number;
  /** Revenue generated today */
  revenueToday: number;
  /** Number of orders currently in pending status */
  pendingOrders: number;
}
