import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Instrument } from "../types/Instrument";
import instruments from "../../data/instrument.json";
import { Label } from "@/components/ui/label";

const MarketWatch = () => {
  const [bondTypeFilter, setBondTypeFilter] = useState<string>("All");
  const [seriesFilter, setSeriesFilter] = useState<string>("All");

  // Collect unique bond types & series from JSON
  const bondTypes = [
    "All",
    ...new Set((instruments as Instrument[]).map((i) => i.bondType)),
  ];
  const seriesList = [
    "All",
    ...new Set((instruments as Instrument[]).map((i) => i.series)),
  ];

  // Apply both filters
  const filteredInstruments = (instruments as Instrument[]).filter(
    (instrument) =>
      (bondTypeFilter === "All" || instrument.bondType === bondTypeFilter) &&
      (seriesFilter === "All" || instrument.series === seriesFilter)
  );

  return (
    <><div className="space-y-6">
      <Card>
        <div className="p-6">
  {/* First Row */}
  <div className="grid grid-cols-5 gap-4 mb-6">
    <div className="col-span-2 h-24 flex flex-col justify-center">
      <p className="font-bold text-2xl">IndiaGov 2033</p>
      <p className="text-base text-gray-600">Ticker: INDGOV33</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Face Value</p>
      <p className="text-base">₹1000</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Bid</p>
      <p className="text-base">₹980</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Ask</p>
      <p className="text-base">₹985</p>
    </div>
  </div>

  {/* Second Row */}
  <div className="grid grid-cols-5 gap-4 mb-6">
    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Coupon</p>
      <p className="text-base">7.18%</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">YTM</p>
      <p className="text-base">7.25%</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Current Yield</p>
      <p className="text-base">7.10%</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Modified Duration</p>
      <p className="text-base">6.5 yrs</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Days to Maturity</p>
      <p className="text-base">3,200</p>
    </div>
  </div>

  {/* Third Row */}
  <div className="grid grid-cols-5 gap-4">
    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Issue Date</p>
      <p className="text-base">01-Jan-2023</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Maturity Date</p>
      <p className="text-base">01-Jan-2033</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Next Coupon</p>
      <p className="text-base">01-Jan-2026</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Bond Type</p>
      <p className="text-base">Government</p>
    </div>

    <div className="text-left p-2  ">
      <p className="font-bold text-lg">Credit Rating</p>
      <p className="text-base">AAA</p>
    </div>
  </div>
</div>



      </Card>
    </div><div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Watch - Fixed Income Instruments</CardTitle>
            <CardDescription>
              Real-time market data for bonds and fixed income securities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              {/* Bond Type Filter */}
              <Label>Bond Type</Label>
              <Select
                onValueChange={(value) => setBondTypeFilter(value)}
                defaultValue="All"
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Bond Type" />
                </SelectTrigger>
                <SelectContent>
                  {bondTypes.map((type, idx) => (
                    <SelectItem key={idx} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Series Filter */}
              <Label>Series</Label>
              <Select
                onValueChange={(value) => setSeriesFilter(value)}
                defaultValue="All"
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Series" />
                </SelectTrigger>
                <SelectContent>
                  {seriesList.map((s, idx) => (
                    <SelectItem key={idx} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Bid</TableHead>
                    <TableHead>Ask</TableHead>
                    <TableHead>YTM</TableHead>
                    <TableHead>Coupon Rate</TableHead>
                    <TableHead>Series</TableHead>
                    <TableHead>Current Yield</TableHead>
                    <TableHead>Face Value</TableHead>
                    <TableHead>Days to Maturity</TableHead>
                    <TableHead>Mod Duration</TableHead>
                    <TableHead>Bond Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstruments.map((instrument, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {instrument.ticker}
                      </TableCell>
                      <TableCell>{instrument.bid}</TableCell>
                      <TableCell>{instrument.ask}</TableCell>
                      <TableCell>{instrument.ytm}</TableCell>
                      <TableCell>{instrument.couponRate}</TableCell>
                      <TableCell>{instrument.series}</TableCell>
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
      </div></>
  );
};

export default MarketWatch;
