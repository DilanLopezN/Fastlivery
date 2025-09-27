export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";
export type OrderType = "delivery" | "pickup" | "dine-in";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  number: string;
  customer: string;
  customerPhone?: string;
  total: number;
  status: OrderStatus;
  type: OrderType;
  items: OrderItem[];
  address?: string;
  notes?: string;
  waitTime: number;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}
