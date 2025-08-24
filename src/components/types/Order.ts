export interface Order {
  id: number;
  instrument: string;
  side: "Buy" | "Sell";
  quantity: number;
  price: number;
  disclosedQty?: number;
  stopLoss?: number;
  condition?: string;
  status: "Pending" | "Cancelled" | "Filled";
  time: string;
}