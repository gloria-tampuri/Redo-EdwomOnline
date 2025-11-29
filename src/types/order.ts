/**
 * Unified Order and OrderItem types
 * Used across OrdersTable.tsx and OrderDetailsDrawer.tsx
 */

export interface OrderItem {
  _id: string; // Reference to item in inventory or unique identifier
  name: string;
  price: number; // Price per unit
  quantity: number;
  unit: string;
  image?: string;
}

export interface Order {
  _id?: string; // MongoDB ID (optional for new orders during creation)
  orderId: string; // Human-readable order ID (ORD-XXXXX-XXXXX)
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[]; // Array of order items with _id
  totalAmount: number;
  deliveryLocation: string;
  status: string; // e.g., 'Pending', 'Processing', 'Completed', 'Cancelled'
  orderDate: string; // ISO date string
  paymentStatus: string; // e.g., 'Unpaid', 'Paid', 'Refunded'
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: string;
  image?: string;
  lastUpdated?: string;
}
