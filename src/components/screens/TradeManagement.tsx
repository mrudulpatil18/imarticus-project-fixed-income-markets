import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Trade {
  id: string;
  instrument: string;
  side: "Buy" | "Sell";
  quantity: number;
  price: number;
  filled: number;
  remaining: number;
  status: "Open" | "Partial" | "Filled";
  time: string;
}

const TradeManagement = () => {
  // Placeholder data
  const openTrades: Trade[] = [
    {
      id: "T001",
      instrument: "US10Y",
      side: "Buy",
      quantity: 1000,
      price: 101.25,
      filled: 800,
      remaining: 200,
      status: "Partial",
      time: "09:30:15",
    },
    {
      id: "T002",
      instrument: "CORP5Y",
      side: "Sell",
      quantity: 500,
      price: 102.75,
      filled: 0,
      remaining: 500,
      status: "Open",
      time: "09:45:22",
    },
    {
      id: "T003",
      instrument: "MUNI7Y",
      side: "Buy",
      quantity: 2000,
      price: 98.5,
      filled: 2000,
      remaining: 0,
      status: "Filled",
      time: "10:15:33",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade Management</CardTitle>
          <CardDescription>
            View and manage open trades, cancel or amend existing orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade ID</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Filled</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.id}</TableCell>
                    <TableCell>{trade.instrument}</TableCell>
                    <TableCell>
                      <Badge
                        variant={trade.side === "Buy" ? "default" : "secondary"}
                      >
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.quantity.toLocaleString()}</TableCell>
                    <TableCell>{trade.price}</TableCell>
                    <TableCell>{trade.filled.toLocaleString()}</TableCell>
                    <TableCell>{trade.remaining.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.status === "Filled"
                            ? "default"
                            : trade.status === "Partial"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.time}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {trade.status !== "Filled" && (
                          <>
                            <Button size="sm" variant="outline">
                              Amend
                            </Button>
                            <Button size="sm" variant="destructive">
                              Cancel
                            </Button>
                          </>
                        )}
                        {trade.status === "Filled" && (
                          <span className="text-sm text-gray-500">
                            Completed
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Cancel All Orders</Button>
            <Button variant="outline">Export Trades</Button>
            <Button variant="outline">Refresh Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeManagement;
