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

interface Position {
  instrument: string;
  position: number;
  avgPrice: number;
  marketPrice: number;
  notionalValue: number;
  mtmPnL: number;
  unrealizedPnL: number;
}

const NetPosition = () => {
  // Placeholder data
  const positions: Position[] = [
    {
      instrument: "US10Y",
      position: 2000,
      avgPrice: 101.15,
      marketPrice: 101.45,
      notionalValue: 202300,
      mtmPnL: 600,
      unrealizedPnL: 0.296,
    },
    {
      instrument: "CORP5Y",
      position: -500,
      avgPrice: 102.8,
      marketPrice: 102.65,
      notionalValue: -51325,
      mtmPnL: 75,
      unrealizedPnL: -0.146,
    },
    {
      instrument: "MUNI7Y",
      position: 1500,
      avgPrice: 98.5,
      marketPrice: 98.75,
      notionalValue: 148125,
      mtmPnL: 375,
      unrealizedPnL: 0.254,
    },
  ];

  const totalPnL = positions.reduce((sum, pos) => sum + pos.mtmPnL, 0);
  const totalNotional = positions.reduce(
    (sum, pos) => Math.abs(sum) + Math.abs(pos.notionalValue),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ${totalPnL >= 0 ? "+" : ""}
              {totalPnL.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Mark-to-Market</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-gray-600">Active instruments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalNotional / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-gray-600">Total exposure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-gray-600">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Net Positions</CardTitle>
          <CardDescription>
            Consolidated view of positions with FIFO/LIFO weighted average
            pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Market Price</TableHead>
                  <TableHead>Notional Value</TableHead>
                  <TableHead>MTM P&L</TableHead>
                  <TableHead>Unrealized P&L %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {position.instrument}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {position.position.toLocaleString()}
                        <Badge
                          variant={
                            position.position > 0 ? "default" : "secondary"
                          }
                        >
                          {position.position > 0 ? "Long" : "Short"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{position.avgPrice}</TableCell>
                    <TableCell>{position.marketPrice}</TableCell>
                    <TableCell>
                      ${position.notionalValue.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={
                        position.mtmPnL >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      ${position.mtmPnL >= 0 ? "+" : ""}
                      {position.mtmPnL}
                    </TableCell>
                    <TableCell
                      className={
                        position.unrealizedPnL >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {position.unrealizedPnL >= 0 ? "+" : ""}
                      {position.unrealizedPnL}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
          <CardDescription>
            Portfolio risk and duration analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">6.8</div>
              <div className="text-sm text-gray-600">Portfolio Duration</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">$8.5K</div>
              <div className="text-sm text-gray-600">Value at Risk (1D)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">0.24</div>
              <div className="text-sm text-gray-600">Beta</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">AA</div>
              <div className="text-sm text-gray-600">Avg Credit Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetPosition;
