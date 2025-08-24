import { useState, useContext, useEffect } from 'react';
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

// Import the Instrument type from a shared types file
import type { Instrument } from "../types/Instrument";
import type { Order } from "../types/Order";
import type { OrderContextType } from '../types/OrderContextType';


// Corrected import path for the JSON data file relative to the component
import instruments from "../../data/instrument.json";

// A simplified portfolio to check for sell eligibility.
const userPortfolio: { [key: string]: number } = {
    'INDGOV33': 5000,
    'CORPBOND27': 1000,
};


// This is a dummy context for this file to satisfy TypeScript
// and is now properly imported from the parent component.
// NOTE: The actual provider is in App.tsx
import { OrderContext } from "../../App";


// --- The Order Execution Component (updated) ---
const OrderExecution = () => {
  // Access the context to get state and functions
  const context = useContext(OrderContext);
  if (!context) {
    // This error will be thrown if the component is used outside of the provider
    throw new Error("OrderExecution must be used within an OrderProvider");
  }
  const { orders, addOrder } = context;

  // State to hold the form data
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [disclosedQty, setDisclosedQty] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderCondition, setOrderCondition] = useState<string>('Market');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Function to handle form submission
  const handleSubmit = () => {
    setErrorMessage(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages

    // 1. Ticker validation: Check if the entered ticker exists in the fetched data.
    const foundInstrument = (instruments as Instrument[]).find(
      (inst) => inst.ticker.toUpperCase() === ticker.toUpperCase()
    );
    if (!foundInstrument) {
      setErrorMessage(`Invalid ticker. Please select from: ${(instruments as Instrument[]).map(i => i.ticker).join(', ')}`);
      return;
    }

    // 2. Sell trade validation: Check if the user has enough of the security to sell.
    if (orderType === 'Sell') {
      // Find the quantity the user owns. Use a fallback of 0 if not found.
      const hasSecurity = userPortfolio[ticker.toUpperCase()] || 0;
      if (hasSecurity < Number(quantity)) {
        setErrorMessage('You cannot sell more than you own for this security.');
        return;
      }
    }

    // 3. Basic validation: Ensure quantity and price are filled.
    if (!quantity || !price) {
      setErrorMessage('Please fill in Quantity and Price.');
      return;
    }

    // If all validations pass, create the new order object
    const newOrder: Order = {
      instrument: ticker.toUpperCase(),
      side: orderType,
      quantity: Number(quantity),
      price: Number(price),
      disclosedQty: disclosedQty !== '' ? Number(disclosedQty) : undefined,
      stopLoss: stopLoss !== '' ? Number(stopLoss) : undefined,
      condition: orderCondition,
      status: 'Pending',
      time: new Date().toLocaleTimeString(),
    };

    // Use the addOrder function from context to update the shared state
    addOrder(newOrder);
    setSuccessMessage('Order submitted successfully!');
    console.log(orders);

    // Reset the form fields
    setTicker('');
    setQuantity('');
    setPrice('');
    setDisclosedQty('');
    setStopLoss('');
  };

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
            {errorMessage && (
              <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-100 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Instrument</label>
                <Input
                  placeholder="Enter ticker..."
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Order Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'Buy' | 'Sell')}
                >
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  placeholder="1000"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  placeholder="100.50"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Disclosed Qty</label>
                <Input
                  placeholder="100"
                  type="number"
                  value={disclosedQty}
                  onChange={(e) => setDisclosedQty(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stop Loss</label>
                <Input
                  placeholder="99.00"
                  type="number"
                  step="0.01"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Order Condition</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={orderCondition}
                onChange={(e) => setOrderCondition(e.target.value)}
              >
                <option value="Market">Market</option>
                <option value="Limit">Limit</option>
                <option value="Stop">Stop</option>
                <option value="Stop Limit">Stop Limit</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={handleSubmit}>Submit Order</Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                setTicker('');
                setQuantity('');
                setPrice('');
                setDisclosedQty('');
                setStopLoss('');
              }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Orders - This now displays data from context */}
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>
              Monitor pending and partially filled orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.length === 0 && (
                <p className="text-center text-gray-500">No active orders.</p>
              )}
              {orders.map((order, index) => (
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