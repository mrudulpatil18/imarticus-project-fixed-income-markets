import type { Order } from "./Order"

export interface OrderContextType {
  orders: Order[];
  addOrder: (newOrder: Order) => void;
  cancelOrder:(id:number)=>void;
  updateOrderList:(id:number,quantity:number,price:number)=>void;
}