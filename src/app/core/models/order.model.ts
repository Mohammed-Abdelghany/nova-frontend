export type OrderStatus = 'PENDING' | 'COMPLETED';

export interface OrderItemPayload {
  productId: number;
  quantity: number;
}

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  items: OrderItemPayload[];
  couponCode?: string;
}

export interface OrderItem {
  productId: number;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  governorate: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
