import React, { useState, useContext, useEffect, useRef } from 'react';
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
//import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox component
import { Label } from "@/components/ui/label" 

// Import the Instrument type from a shared types file
import type { Instrument } from "../types/Instrument";
import type { Order } from "../types/Order";
import type { OrderContextType } from '../types/OrderContextType';

// Corrected import path for the JSON data file relative to the component
import instruments from "../../data/instrument.json";

// A simplified portfolio to check for sell eligibility.
// const userPortfolio: { [key: string]: number } = {
//     'INDGOV33': 5000,
//     'CORPBOND27': 1000,
// };

// --- Track user’s own holdings from successful buys ---


// Define the OrderContext for use in this file
// interface Order {
//   instrument: string;
//   side: "Buy" | "Sell";
//   quantity: number;
//   price: number;
//   disclosedQty?: number;
//   stopLoss?: number;
//   condition?: string;
//   status: "Pending" | "Partial" | "Filled";
//   time: string;
// }

// interface OrderContextType {
//   orders: Order[];
//   addOrder: (newOrder: Order) => void;
//   // This function is new to the context
//   clearOrders: () => void;
// }
// This is a dummy context for this file to satisfy TypeScript
// and is now properly imported from the parent component.
import { OrderContext } from "../../App";


// --- The Order Execution Component (updated) ---
const OrderExecution = () => {
  // Access the context to get state and functions
  const context = useContext(OrderContext);
  const [userHoldings, setUserHoldings] = useState<{ [key: string]: number }>({});
  if (!context) {
    // This error will be thrown if the component is used outside of the provider
    throw new Error("OrderExecution must be used within an OrderProvider");
  }
  const { orders, addOrder } = context;

  // inside component
  const getMarketPrice = (): number | undefined => {
    const foundInstrument = (instruments as Instrument[]).find(
      (inst) => inst.ticker.toUpperCase() === ticker.toUpperCase()
    );
    if (!foundInstrument) return undefined;
    return orderType === "Buy" ? foundInstrument.bid : foundInstrument.ask;
  };

  // --- add new state to track instrument quantities ---
  const initialQuantities: { [key: string]: number } = {};
  (instruments as Instrument[]).forEach(inst => {
    initialQuantities[inst.ticker] = 100; // initialize all with 100
  });

  const [instrumentQuantities, setInstrumentQuantities] = useState<{ [key: string]: number }>(initialQuantities);



  // State to hold the form data
  const id = useRef<number>(1);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [disclosedQty, setDisclosedQty] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [orderType, setOrderType] = useState<'Buy' | 'Sell'>('Buy');
  const [orderCondition, setOrderCondition] = useState<string>('Market');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // New state for the market price checkbox
  //const [isMarketPrice, setIsMarketPrice] = useState(false);
  const [useMarketPrice, setUseMarketPrice] = useState(false);

  // useEffect hook to update price based on market price checkbox and ticker
  useEffect(() => {
    if (useMarketPrice) {
      const market = getMarketPrice();
      if (market !== undefined) {
        setPrice(market);
      }
    }
  }, [useMarketPrice, ticker, orderType]);
 // Dependencies: run this effect when these states change

  // Function to handle form submission
  const handleSubmit = () => {
  setErrorMessage('');
  setSuccessMessage('');

  const foundInstrument = (instruments as Instrument[]).find(
    (inst) => inst.ticker.toUpperCase() === ticker.toUpperCase()
  );
  if (!foundInstrument) {
    setErrorMessage(`Invalid ticker. Please select from: ${(instruments as Instrument[]).map(i => i.ticker).join(', ')}`);
    return;
  }

  if (!quantity || !price) {
    setErrorMessage('Please fill in Quantity and Price.');
    return;
  }

  let status: "Filled" | "Pending" = "Filled";

  if (orderType === "Buy") {
    const availableQty = instrumentQuantities[ticker.toUpperCase()] ?? 0;

    if (availableQty >= Number(quantity)) {
      // Fill order: reduce market, increase holdings
      setInstrumentQuantities(prev => ({
        ...prev,
        [ticker.toUpperCase()]: prev[ticker.toUpperCase()] - Number(quantity)
      }));
      setUserHoldings(prev => ({
        ...prev,
        [ticker.toUpperCase()]: (prev[ticker.toUpperCase()] || 0) + Number(quantity)
      }));
      console.log("[filled check before]",status);
      status = "Filled";
      console.log("[filled check after]",status);
    } else {
      status = "Pending";
    }
  }

  if (orderType === "Sell") {
    const ownedQty = userHoldings[ticker.toUpperCase()] || 0;

    if (ownedQty < Number(quantity)) {
      setErrorMessage("You cannot sell more than you own for this security.");
      return;
    } else {
      // Successful sell: decrease holdings, increase market supply
      setUserHoldings(prev => ({
        ...prev,
        [ticker.toUpperCase()]: prev[ticker.toUpperCase()] - Number(quantity)
      }));
      setInstrumentQuantities(prev => ({
        ...prev,
        [ticker.toUpperCase()]: prev[ticker.toUpperCase()] + Number(quantity)
      }));
      status = "Filled";
    }
  }

  const newOrder: Order = {
    id:Date.now(),
    instrument: ticker.toUpperCase(),
    side: orderType,
    quantity: Number(quantity),
    price: Number(price),
    disclosedQty: disclosedQty !== '' ? Number(disclosedQty) : undefined,
    stopLoss: stopLoss !== '' ? Number(stopLoss) : undefined,
    condition: orderCondition,
    status: status,
    time: new Date().toLocaleTimeString(),
  };

  if (status === "Pending") {
    addOrder(newOrder); // only pending orders go to Active Orders
    setSuccessMessage("Order submitted and pending.");
  } else {
    addOrder(newOrder);
    setSuccessMessage(orderType === "Buy" ? "Buy order filled successfully!" : "Sell order executed successfully!");
  }

  // Reset form
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
                  placeholder="Enter Quantity.."
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Price</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="marketPrice"
                      type="checkbox"
                      checked={useMarketPrice}
                      onChange={(e) => setUseMarketPrice(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="marketPrice" className="text-xs text-gray-600">
                      Market Price
                    </Label>
                  </div>
                </div>

                {(() => {
                  const market = getMarketPrice();

                  return (
                    <>
                      <Input
                        placeholder="Enter Price.."
                        type="number"
                        step="1"
                        value={price}
                        onChange={(e) => {
                          // let user type freely
                          setPrice(Number(e.target.value));
                        }}
                        onBlur={() => {
                          // clamp only after input loses focus
                          const market = getMarketPrice();
                          if (market !== undefined && price !== '') {
                            const min = Math.ceil(market * 0.95);
                            const max = Math.floor(market * 1.05);

                            if (Number(price) < min) {
                              setPrice(min);
                            } else if (Number(price) > max) {
                              setPrice(max);
                            } else {
                              setPrice(Math.floor(Number(price)));
                            }
                          }
                        }}
                        disabled={useMarketPrice}
                        className={useMarketPrice ? "bg-gray-100 cursor-not-allowed" : ""}
                      />

                      {!useMarketPrice && market !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Allowed range: {Math.ceil(market * 0.95)} – {Math.floor(market * 1.05)}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Disclosed Qty</label>
                <Input
                  placeholder="Enter Disclosed Qty.."
                  type="number"
                  value={disclosedQty}
                  onChange={(e) => setDisclosedQty(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stop Loss</label>
                <Input
                  placeholder="Enter Stop Loss.."
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
                //setIsMarketPrice(false);
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
            {/* New "Clear All Orders" button */}
            {/* {orders.length > 0 && (
              <Button
                onClick={clearOrders}
                variant="destructive"
                className="w-full mt-4"
              >
                Clear All Orders
              </Button>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderExecution;