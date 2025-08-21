import { Badge } from "@/components/ui/badge";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Order Execution System
            </h1>
            <Badge variant="secondary">Fixed Income Trading</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Market Status:{" "}
              <Badge variant="outline" className="text-green-600">
                Open
              </Badge>
            </div>
            <div className="text-sm text-gray-600">User: Trader001</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
