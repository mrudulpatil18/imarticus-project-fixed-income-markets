import { useState, useMemo, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { OrderContext } from "../../App";

import type { Instrument } from "../types/Instrument";
import instrumentsData from "../../data/instrument.json";

interface Order {
  id: number;
  instrument: string;
  side: "Buy" | "Sell";
  quantity: number;
  price: number;
  condition?: string;
  status: string;
  time: string;
}

interface Position {
  instrument: string;
  position: number;
  avgPrice: number;
  marketPrice: number;
  notionalValue: number;
  mtmPnL: number;
  unrealizedPnLPercent: number;
  transactions: Order[];
  calculationBreakdown: {
    method: string;
    usedTrades: Array<{ order: Order; qtyUsed: number }>;
    calculation: string;
  };
}

type InventoryMethod = "FIFO" | "LIFO" | "WEIGHTED_AVG";

const instruments = instrumentsData as Instrument[];

// Update the getMarketPrice function to handle missing instruments better:
const getMarketPrice = (ticker: string): number => {
  const instrument = instruments.find(
    (inst) => inst.ticker.toUpperCase() === ticker.toUpperCase(),
  );

  if (!instrument) {
    console.warn(`Instrument ${ticker} not found in market data`);
    return 0; // or return a default price
  }

  return (instrument.bid + instrument.ask) / 2;
};

const NetPosition = () => {
  const [inventoryMethod, setInventoryMethod] =
    useState<InventoryMethod>("FIFO");

  // Sample transactions to demonstrate calculations
  const sampleTransactions: Order[] = [
    {
      id: 999001,
      instrument: "INDGOV33",
      side: "Buy",
      quantity: 1000,
      price: 101.5,
      condition: "Market",
      status: "Filled",
      time: "09:30:15",
    },
    {
      id: 999002,
      instrument: "INDGOV33",
      side: "Buy",
      quantity: 500,
      price: 102.0,
      condition: "Market",
      status: "Filled",
      time: "10:15:22",
    },
    {
      id: 999003,
      instrument: "INDGOV33",
      side: "Sell",
      quantity: 300,
      price: 102.5,
      condition: "Market",
      status: "Filled",
      time: "11:45:33",
    },
    {
      id: 999004,
      instrument: "CORPBOND27",
      side: "Buy",
      quantity: 2000,
      price: 99.75,
      condition: "Market",
      status: "Filled",
      time: "09:45:12",
    },
    {
      id: 999005,
      instrument: "CORPBOND27",
      side: "Buy",
      quantity: 1000,
      price: 100.25,
      condition: "Market",
      status: "Filled",
      time: "14:20:45",
    },
    {
      id: 999006,
      instrument: "CORPBOND27",
      side: "Sell",
      quantity: 800,
      price: 101.0,
      condition: "Market",
      status: "Filled",
      time: "15:30:10",
    },
  ];

  // Get orders from context
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("NetPosition must be used within an OrderProvider");
  }

  const { orders: contextOrders } = context;

  // Convert context orders to the format expected by this component
  const contextOrdersFormatted: Order[] = contextOrders.map((order) => ({
    id: order.id,
    instrument: order.instrument,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
    condition: order.condition || "Market",
    status: order.status,
    time: order.time,
  }));

  // Combine sample transactions with context orders
  const orders: Order[] = [...sampleTransactions, ...contextOrdersFormatted];

  type Lot = { qty: number; price: number; order: Order };

  function matchAndGetRemaining(
    sortedOrders: Order[],
    method: InventoryMethod,
  ) {
    const longLots: Lot[] = [];
    const shortLots: Lot[] = [];

    for (const o of sortedOrders) {
      let qty = o.quantity;
      if (o.side === "Buy") {
        while (qty > 0 && shortLots.length > 0) {
          const idx = method === "LIFO" ? shortLots.length - 1 : 0;
          const lot = shortLots[idx];
          const use = Math.min(qty, lot.qty);
          lot.qty -= use;
          qty -= use;
          if (lot.qty === 0) shortLots.splice(idx, 1);
        }
        if (qty > 0) longLots.push({ qty, price: o.price, order: o });
      } else {
        while (qty > 0 && longLots.length > 0) {
          const idx = method === "LIFO" ? longLots.length - 1 : 0;
          const lot = longLots[idx];
          const use = Math.min(qty, lot.qty);
          lot.qty -= use;
          qty -= use;
          if (lot.qty === 0) longLots.splice(idx, 1);
        }
        if (qty > 0) shortLots.push({ qty, price: o.price, order: o });
      }
    }

    const longQty = longLots.reduce((s, l) => s + l.qty, 0);
    const shortQty = shortLots.reduce((s, l) => s + l.qty, 0);
    const netRemaining = longQty - shortQty;
    const remainingLots = netRemaining > 0 ? longLots : shortLots;
    const absQty = remainingLots.reduce((s, l) => s + l.qty, 0);
    const weightedSum = remainingLots.reduce((s, l) => s + l.qty * l.price, 0);
    const avgPrice = absQty > 0 ? weightedSum / absQty : 0;

    const usedTrades = remainingLots.map((l) => ({
      order: l.order,
      qtyUsed: l.qty,
    }));

    const calculation =
      usedTrades.map((t) => `${t.qtyUsed} × ₹${t.order.price}`).join(" + ") +
      (absQty
        ? ` = ₹${weightedSum.toFixed(2)} ÷ ${absQty} = ₹${avgPrice.toFixed(2)}`
        : "");

    return { avgPrice, usedTrades, calculation, netRemaining };
  }

  // Calculate positions based on inventory method
  const positions = useMemo(() => {
    const positionMap = new Map<string, Position>();

    // Only consider filled orders for positions
    const filledOrders = orders.filter((order) => order.status === "Filled");

    if (filledOrders.length === 0) {
      return [];
    }

    // Group orders by instrument
    const ordersByInstrument = filledOrders.reduce(
      (acc, order) => {
        if (!acc[order.instrument]) {
          acc[order.instrument] = [];
        }
        acc[order.instrument].push(order);
        return acc;
      },
      {} as Record<string, Order[]>,
    );

    Object.entries(ordersByInstrument).forEach(
      ([instrument, instrumentOrders]) => {
        // Sort orders by time for FIFO/LIFO calculations
        const sortedOrders = [...instrumentOrders].sort((a, b) => {
          // Parse time strings to compare them properly
          const timeA = new Date(`1970-01-01T${a.time}Z`).getTime();
          const timeB = new Date(`1970-01-01T${b.time}Z`).getTime();
          return timeA - timeB;
        });

        let result;
        // Calculate average price based on inventory method
        switch (inventoryMethod) {
          case "FIFO":
          case "LIFO":
          case "WEIGHTED_AVG":
            result = matchAndGetRemaining(sortedOrders, inventoryMethod);
            break;
          default:
            result = {
              avgPrice: 0,
              usedTrades: [],
              calculation: "",
              netRemaining: 0,
            };
        }

        const netPosition = result.netRemaining;

        if (netPosition !== 0) {
          const marketPrice = getMarketPrice(instrument);
          const notionalValue = netPosition * marketPrice;
          const costBasis = Math.abs(netPosition) * result.avgPrice;
          const mtmPnL =
            notionalValue - (netPosition > 0 ? costBasis : -costBasis);
          const unrealizedPnLPercent =
            costBasis !== 0 ? (mtmPnL / costBasis) * 100 : 0;

          positionMap.set(instrument, {
            instrument,
            position: netPosition,
            avgPrice: result.avgPrice,
            marketPrice,
            notionalValue,
            mtmPnL,
            unrealizedPnLPercent,
            transactions: sortedOrders,
            calculationBreakdown: {
              method: inventoryMethod,
              usedTrades: result.usedTrades,
              calculation: result.calculation,
            },
          });
        }
      },
    );

    return Array.from(positionMap.values());
  }, [orders, inventoryMethod]);

  // Calculate summary metrics
  const totalPnL = positions.reduce((sum, pos) => sum + pos.mtmPnL, 0);

  return (
    <div className="space-y-6">
      {/* Inventory Method Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Net Position Calculation</CardTitle>
          <CardDescription>
            Select inventory method for calculating average cost basis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Method:</Label>
            <Select
              value={inventoryMethod}
              onValueChange={(value) =>
                setInventoryMethod(value as InventoryMethod)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO (First In, First Out)</SelectItem>
                <SelectItem value="LIFO">LIFO (Last In, First Out)</SelectItem>
                <SelectItem value="WEIGHTED_AVG">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Method explanation */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">
              How {inventoryMethod} works:
            </h4>
            <p className="text-sm text-gray-600">
              {inventoryMethod === "FIFO" &&
                "First In, First Out: When selling, the oldest (first purchased) lots are sold first. Remaining position uses the cost basis of the most recent purchases."}
              {inventoryMethod === "LIFO" &&
                "Last In, First Out: When selling, the newest (most recently purchased) lots are sold first. Remaining position uses the cost basis of the oldest purchases."}
              {inventoryMethod === "WEIGHTED_AVG" &&
                "Weighted Average: All purchases are averaged together based on quantity weights. When selling, this average cost is used consistently."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall P&L Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div
                className={`text-3xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ₹{totalPnL >= 0 ? "+" : ""}
                {totalPnL.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Overall Profit/Loss
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{positions.length}</div>
              <div className="text-sm text-gray-600 mt-1">Open Positions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold">{inventoryMethod}</div>
              <div className="text-sm text-gray-600 mt-1">
                Calculation Method
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status message when no data */}
      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No orders found. Create some orders in the Order Execution tab to
              see positions here.
            </p>
          </CardContent>
        </Card>
      )}

      {orders.length > 0 && positions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              No net positions found. Only filled orders contribute to
              positions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Net Positions Table */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Net Positions by Asset</CardTitle>
            <CardDescription>
              Mark-to-Market profits/losses per instrument using{" "}
              {inventoryMethod.replace("_", " ")} method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Net Position</TableHead>
                    <TableHead>Avg Cost Price</TableHead>
                    <TableHead>Current Market Price</TableHead>
                    <TableHead>Market Value</TableHead>
                    <TableHead>MTM P&L</TableHead>
                    <TableHead>Unrealized P&L %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {position.instrument}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {position.instrument} - Position Details
                                </DialogTitle>
                                <DialogDescription>
                                  Transaction history and calculation breakdown
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                {/* Position Summary */}
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      Net Position
                                    </div>
                                    <div className="text-lg font-semibold">
                                      {position.position.toLocaleString()}{" "}
                                      shares
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      Average Price
                                    </div>
                                    <div className="text-lg font-semibold">
                                      ₹{position.avgPrice.toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      Market Value
                                    </div>
                                    <div className="text-lg font-semibold">
                                      ₹
                                      {position.notionalValue.toLocaleString(
                                        undefined,
                                        {
                                          maximumFractionDigits: 0,
                                        },
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-600">
                                      MTM P&L
                                    </div>
                                    <div
                                      className={`text-lg font-semibold ${
                                        position.mtmPnL >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      ₹{position.mtmPnL >= 0 ? "+" : ""}
                                      {position.mtmPnL.toLocaleString(
                                        undefined,
                                        {
                                          maximumFractionDigits: 0,
                                        },
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Transaction History */}
                                <div>
                                  <h4 className="font-semibold text-lg mb-3">
                                    Transaction History
                                  </h4>
                                  <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Time</TableHead>
                                          <TableHead>Side</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {position.transactions.map(
                                          (tx, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="font-mono text-sm">
                                                {tx.time}
                                              </TableCell>
                                              <TableCell>
                                                <Badge
                                                  variant={
                                                    tx.side === "Buy"
                                                      ? "default"
                                                      : "destructive"
                                                  }
                                                >
                                                  {tx.side}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {tx.quantity.toLocaleString()}
                                              </TableCell>
                                              <TableCell>₹{tx.price}</TableCell>
                                              <TableCell>
                                                <Badge variant="outline">
                                                  {tx.status}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          ),
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                {/* Calculation Breakdown */}
                                <div>
                                  <h4 className="font-semibold text-lg mb-3">
                                    {position.calculationBreakdown.method}{" "}
                                    Calculation
                                  </h4>

                                  <div className="space-y-4">
                                    <div>
                                      <div className="text-sm font-medium text-gray-700 mb-2">
                                        Remaining Lots Used for Average Price:
                                      </div>
                                      <div className="space-y-2">
                                        {position.calculationBreakdown.usedTrades.map(
                                          (ut, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between items-center p-3 bg-gray-50 rounded border-l-4 border-blue-500"
                                            >
                                              <div>
                                                <span className="font-medium">
                                                  {ut.qtyUsed} shares
                                                </span>
                                                <span className="text-gray-600 ml-2">
                                                  @ ₹{ut.order.price}
                                                </span>
                                              </div>
                                              <div className="text-sm text-gray-500">
                                                {ut.order.time} •{" "}
                                                {ut.order.side}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-sm font-medium text-gray-700 mb-2">
                                        Calculation Formula:
                                      </div>
                                      <div className="p-3 bg-slate-100 rounded font-mono text-sm break-all">
                                        {
                                          position.calculationBreakdown
                                            .calculation
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                      <TableCell>
                        {position.position.toLocaleString()}
                      </TableCell>
                      <TableCell>₹{position.avgPrice.toFixed(2)}</TableCell>
                      <TableCell>₹{position.marketPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        ₹
                        {position.notionalValue.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell
                        className={
                          position.mtmPnL >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        ₹{position.mtmPnL >= 0 ? "+" : ""}
                        {position.mtmPnL.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell
                        className={
                          position.unrealizedPnLPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {position.unrealizedPnLPercent >= 0 ? "+" : ""}
                        {position.unrealizedPnLPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetPosition;
