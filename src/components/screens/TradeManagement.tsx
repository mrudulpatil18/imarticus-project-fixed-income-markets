import  { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, AlertTriangle, CheckCircle, Clock, XCircle, MinusCircle } from 'lucide-react';
import type { Order } from '../types/Order';
import { OrderContext } from '@/App';


// Toast component
const Toast = ({ message, type, show, onHide }: { 
  message: string; 
  type: 'success' | 'error'; 
  show: boolean; 
  onHide: () => void;
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
        type === 'success' 
          ? 'bg-green-50 border border-green-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const config = {
    Filled: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    // Partial: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MinusCircle },
    Cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
  };

  const { color, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={`${color} border font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

// order row component
const OrderRow = ({ 
  order, 
  onCancel, 
  onAmend 
}: { 
  order: Order; 
  onCancel: (id: number) => void; 
  onAmend: (id: number) => void; 
}) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{order?.instrument}</h3>
              <p className="text-sm text-gray-500">{formatDateTime(order.time)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.side === 'Buy'
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {order.side}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-semibold">{order.quantity}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">{formatCurrency(order.price)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">{formatCurrency(order.quantity * order.price)}</p>
              </div>
              
              <StatusBadge status={order.status} />
            </div>
          </div>
          
          <div className="flex gap-2">
            {order.status === 'Pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAmend(order.id)}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Amend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(order.id)}
                  className="hover:bg-red-50 hover:border-red-300 text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Cancel confirmation modal
const CancelModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  orderName: string;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Cancel Order
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to cancel the order for <strong>{orderName}</strong>? 
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Keep Order
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Cancel Order
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Amend modal
const AmendModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  order 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (quantity: number, price: number) => void; 
  order: Order | null | undefined;
}) => {
  const [quantity, setQuantity] = useState(order?.quantity || 0);
  const [price, setPrice] = useState(order?.price || 0);

  useEffect(() => {
    if (order) {
      setQuantity(order.quantity);
      setPrice(order.price);
    }
  }, [order]);

  const handleSave = () => {
    onSave(quantity, price);
    onClose();
  };

  if (!order) return "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Amend Order - {order.instrument}
          </DialogTitle>
          <DialogDescription>
            Update the quantity and price for your {order.side.toLowerCase()} order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price (₹)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3"
              min="0"
              step="0.01"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>New Total:</strong> ₹{(quantity * price).toFixed(2)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component
export default function orderManagementWindow() {
  const context=useContext(OrderContext)
  const dataOrder=context?.orders ? context.orders : [];
  const addOrderContext=context?.addOrder;
  const cancelOrder=context?.cancelOrder;
  const updateOrder=context?.updateOrderList;
  const [orders, setorders] = useState<Order[]>(dataOrder);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [selectedorderId, setSelectedorderId] = useState<number | null | undefined>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const selectedorder:(undefined | null | Order) = selectedorderId ? orders.find(t => t.id === selectedorderId) : null;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleCancelClick = (orderId: number) => {
    setSelectedorderId(orderId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedorderId) {
      setorders(prev => 
        prev.map(order => 
          order.id === selectedorderId 
            ? { ...order, status: 'Cancelled' as const }
            : order
        )
      );
      cancelOrder?.(selectedorderId);

      showToast('Order cancelled successfully', 'success');
    }
    setCancelModalOpen(false);
    setSelectedorderId(null);
  };

  const handleAmendClick = (orderId: number) => {
    setSelectedorderId(orderId);
    setAmendModalOpen(true);
  };

  const handleAmendSave = (quantity: number, price: number) => {
    if (selectedorderId) {
      setorders(prev => 
        prev.map(order => 
          order.id === selectedorderId 
            ? { ...order, quantity, price }
            : order
        )
      );
      updateOrder?.(selectedorderId,quantity,price);

      showToast('Order amended successfully', 'success');
      // const newOrder=orders.find((id=>id.id===selectedorderId));
      // if(newOrder){
      // addOrderContext?.(newOrder)
      // }
    }
    setSelectedorderId(null);
  };
  console.log("[trade management][orders]",orders);
  const pendingorders = orders.filter(t => t.status === 'Pending').length;
  const executedorders = orders.filter(t => t.status === 'Filled').length;
  const partialorders = orders.filter(t => t.status === 'Cancelled').length;

  // ✅ Calculate total value using faceValue, cleanPrice, and accruedInterest
  const totalValue = orders
    .filter(t => t.status !== 'Cancelled')
    .reduce((sum, order) => {
      const orderValue =
        // order.faceValue * (order.cleanPrice / 100) + (order.accruedInterest || 0);
        order.price * order.quantity;
      return sum + orderValue;
    }, 0);
    
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage your open positions and orders</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingorders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Filled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{executedorders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{partialorders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                ₹{totalValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              View and manage all your trading positions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.map(order => (
              <OrderRow
                key={order.id}
                order={order}
                onCancel={handleCancelClick}
                onAmend={handleAmendClick}
              />
            ))}
          </CardContent>
        </Card>

        {/* Modals */}
        <CancelModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onConfirm={handleCancelConfirm}
          orderName={selectedorder?.instrument || ''}
        />

        <AmendModal
          isOpen={amendModalOpen}
          onClose={() => setAmendModalOpen(false)}
          onSave={handleAmendSave}
          order={selectedorder}
        />

        {/* Toast */}
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
      </div>
    </div>
  );
}