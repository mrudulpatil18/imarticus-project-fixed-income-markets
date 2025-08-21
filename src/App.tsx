import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import MarketWatch from "@/components/screens/MarketWatch";
import OrderExecution from "@/components/screens/OrderExecution";
import TradeManagement from "@/components/screens/TradeManagement";
import NetPosition from "@/components/screens/NetPosition";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("market-watch");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="market-watch">Market Watch</TabsTrigger>
            <TabsTrigger value="order-execution">Order Execution</TabsTrigger>
            <TabsTrigger value="trade-management">Trade Management</TabsTrigger>
            <TabsTrigger value="net-position">Net Position</TabsTrigger>
          </TabsList>

          <TabsContent value="market-watch">
            <MarketWatch />
          </TabsContent>

          <TabsContent value="order-execution">
            <OrderExecution />
          </TabsContent>

          <TabsContent value="trade-management">
            <TradeManagement />
          </TabsContent>

          <TabsContent value="net-position">
            <NetPosition />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
