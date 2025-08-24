import type { Order } from "./Order"

export interface OrderContextType {
  orders: Order[];
  addOrder: (newOrder: Order) => void;
}