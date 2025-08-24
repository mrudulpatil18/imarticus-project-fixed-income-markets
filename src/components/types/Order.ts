export interface Order {
  instrument: string;
  side: "Buy" | "Sell";
  quantity: number;
  price: number;
  disclosedQty?: number;
  stopLoss?: number;
  condition?: string;
  status: "Pending" | "Partial" | "Filled";
  time: string;
}