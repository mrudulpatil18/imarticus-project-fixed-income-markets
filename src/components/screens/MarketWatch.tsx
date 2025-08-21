import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Instrument {
  ticker: string;
  bid: string;
  ask: string;
  ytm: string;
  currentYield: string;
  faceValue: string;
  daysToMaturity: string;
  modifiedDuration: string;
  bondType: string;
}

const MarketWatch = () => {
  // Placeholder data - you'll replace this with real data later
  const instruments: Instrument[] = [
    {
      ticker: "US10Y",
      bid: "4.125",
      ask: "4.135",
      ytm: "4.130",
      currentYield: "4.08",
      faceValue: "1000",
      daysToMaturity: "3650",
      modifiedDuration: "8.5",
      bondType: "Government",
    },
    {
      ticker: "CORP5Y",
      bid: "5.250",
      ask: "5.275",
      ytm: "5.265",
      currentYield: "5.12",
      faceValue: "1000",
      daysToMaturity: "1825",
      modifiedDuration: "4.2",
      bondType: "Corporate",
    },
    {
      ticker: "MUNI7Y",
      bid: "3.850",
      ask: "3.875",
      ytm: "3.862",
      currentYield: "3.75",
      faceValue: "1000",
      daysToMaturity: "2555",
      modifiedDuration: "6.1",
      bondType: "Municipal",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Watch - Fixed Income Instruments</CardTitle>
          <CardDescription>
            Real-time market data for bonds and fixed income securities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Bid</TableHead>
                  <TableHead>Ask</TableHead>
                  <TableHead>YTM</TableHead>
                  <TableHead>Current Yield</TableHead>
                  <TableHead>Face Value</TableHead>
                  <TableHead>Days to Maturity</TableHead>
                  <TableHead>Mod Duration</TableHead>
                  <TableHead>Bond Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instruments.map((instrument, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {instrument.ticker}
                    </TableCell>
                    <TableCell>{instrument.bid}</TableCell>
                    <TableCell>{instrument.ask}</TableCell>
                    <TableCell>{instrument.ytm}</TableCell>
                    <TableCell>{instrument.currentYield}</TableCell>
                    <TableCell>{instrument.faceValue}</TableCell>
                    <TableCell>{instrument.daysToMaturity}</TableCell>
                    <TableCell>{instrument.modifiedDuration}</TableCell>
                    <TableCell>{instrument.bondType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketWatch;
