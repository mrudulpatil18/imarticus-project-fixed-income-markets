import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ActiveOrder {
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

const OrderExecution = () => {
  const activeOrders: ActiveOrder[] = [
    {
      instrument: "US10Y",
      side: "Buy",
      quantity: 1000,
      price: 101.25,
      disclosedQty: 100,
      status: "Pending",
      time: "09:30 AM",
    },
    {
      instrument: "CORP5Y",
      side: "Sell",
      quantity: 500,
      price: 102.75,
      stopLoss: 101.5,
      status: "Partial",
      time: "09:45 AM",
    },
    {
      instrument: "MUNI7Y",
      side: "Buy",
      quantity: 2000,
      price: 98.5,
      condition: "Limit",
      status: "Pending",
      time: "10:15 AM",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Order Entry</CardTitle>
            <CardDescription>
              Create buy/sell orders for fixed income instruments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Instrument</label>
                <Input placeholder="Enter ticker..." />
              </div>
              <div>
                <label className="text-sm font-medium">Order Type</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input placeholder="1000" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input placeholder="100.50" type="number" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Disclosed Qty</label>
                <Input placeholder="100" type="number" />
              </div>
              <div>
                <label className="text-sm font-medium">Stop Loss</label>
                <Input placeholder="99.00" type="number" step="0.01" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Order Condition</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Market</option>
                <option>Limit</option>
                <option>Stop</option>
                <option>Stop Limit</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Submit Order</Button>
              <Button variant="outline" className="flex-1">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>
              Monitor pending and partially filled orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {order.instrument} - {order.side}
                    </div>
                    <div className="text-sm text-gray-600">
                      Qty: {order.quantity} @ {order.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.disclosedQty && `Disclosed: ${order.disclosedQty}`}
                      {order.stopLoss && `Stop Loss: ${order.stopLoss}`}
                      {order.condition && `Condition: ${order.condition}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        order.status === "Pending" ? "secondary" : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {order.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderExecution;
