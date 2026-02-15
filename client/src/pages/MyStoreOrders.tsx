import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

/**
 * My Store Orders - Order Fulfillment Interface
 * Allows artists to view orders, update fulfillment status, and add tracking
 */
export default function MyStoreOrders() {
  const { user, loading: authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  // Fetch artist's orders
  const { data: orders, isLoading, refetch } = trpc.ecommerce.orders.getByArtist.useQuery(
    {},
    { enabled: !!user }
  );

  // Update order mutation
  const updateOrder = trpc.ecommerce.orders.update.useMutation({
    onSuccess: () => {
      toast.success("Order updated successfully!");
      setSelectedOrder(null);
      setTrackingNumber("");
      setTrackingUrl("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user && !DEV_MODE) {
    return (
      <div className="container py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-4">YOUR ORDERS</h1>
        <p className="text-lg">Please log in to view your orders.</p>
      </div>
    );
  }

  const handleMarkShipped = (orderId: number) => {
    if (!trackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }

    updateOrder.mutate({
      id: orderId,
      fulfillmentStatus: "fulfilled",
      trackingNumber,
      trackingUrl: trackingUrl || undefined,
    });
  };

  const handleCancelOrder = (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    updateOrder.mutate({
      id: orderId,
      fulfillmentStatus: "cancelled",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "unfulfilled":
        return "PENDING";
      case "partial":
        return "PARTIAL";
      case "fulfilled":
        return "SHIPPED";
      case "cancelled":
        return "CANCELLED";
      default:
        return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/my-store">
            <Button variant="outline" className="rounded-full mb-6 border-2 border-black bg-white hover:bg-gray-100 text-black font-bold">
              ← BACK TO STORE
            </Button>
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">YOUR ORDERS</h1>
          <p className="text-lg text-gray-600">
            Manage orders, update fulfillment status, and add tracking information
          </p>
        </div>

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <div className="p-12 border-4 border-black bg-white rounded-none text-center">
            <div className="text-6xl mb-4">□</div>
            <h3 className="text-2xl font-bold mb-2">NO ORDERS YET</h3>
            <p className="text-gray-600">
              Orders will appear here when customers purchase your products
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div className="border-4 border-black bg-white rounded-none overflow-hidden" key={order.id}>
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-8 pb-6 border-b-4 border-black">
                    <div>
                      <div className="text-3xl font-bold font-mono mb-2">
                        ORDER #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold font-mono mb-3">
                        ${(order.total / 100).toFixed(2)}
                      </div>
                      <div className="inline-flex items-center px-4 py-2 font-bold text-sm border-2 border-black bg-white rounded-none">
                        {getStatusLabel(order.fulfillmentStatus)}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="font-bold text-xs tracking-wider mb-3 text-gray-600">CUSTOMER</div>
                      <div className="text-sm space-y-1">
                        <div className="font-medium">{order.customerEmail}</div>
                        {order.customerPhone && <div className="text-gray-600">{order.customerPhone}</div>}
                      </div>
                    </div>
                    {order.shippingAddress && (
                      <div>
                        <div className="font-bold text-xs tracking-wider mb-3 text-gray-600">SHIPPING ADDRESS</div>
                        <div className="text-sm space-y-1">
                          <div className="font-medium">{order.shippingAddress.name}</div>
                          <div className="text-gray-700">{order.shippingAddress.line1}</div>
                          {order.shippingAddress.line2 && <div className="text-gray-700">{order.shippingAddress.line2}</div>}
                          <div className="text-gray-700">
                            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zip}
                          </div>
                          <div className="text-gray-700">{order.shippingAddress.country}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div className="mb-8 p-6 bg-gray-50 border-2 border-black rounded-none">
                      <div className="font-bold text-xs tracking-wider mb-3 text-gray-600">TRACKING INFORMATION</div>
                      <div className="font-mono text-lg font-bold mb-2">{order.trackingNumber}</div>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:underline text-sm font-medium"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {order.fulfillmentStatus === "unfulfilled" && (
                    <div className="border-t-4 border-black pt-8">
                      {selectedOrder === order.id ? (
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="tracking" className="font-bold text-sm mb-2 block">
                              TRACKING NUMBER *
                            </Label>
                            <Input
                              id="tracking"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              placeholder="1Z999AA10123456784"
                              className="border-2 border-black rounded-none h-12 text-base"
                            />
                          </div>
                          <div>
                            <Label htmlFor="trackingUrl" className="font-bold text-sm mb-2 block">
                              TRACKING URL (OPTIONAL)
                            </Label>
                            <Input
                              id="trackingUrl"
                              value={trackingUrl}
                              onChange={(e) => setTrackingUrl(e.target.value)}
                              placeholder="https://www.ups.com/track?..."
                              className="border-2 border-black rounded-none h-12 text-base"
                            />
                          </div>
                          <div className="flex gap-4">
                            <Button 
                              onClick={() => handleMarkShipped(order.id)}
                              disabled={updateOrder.isPending}
                              className="rounded-full bg-black text-white hover:bg-gray-800 font-bold px-6"
                            >
                              {updateOrder.isPending ? "UPDATING..." : "MARK AS SHIPPED"}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedOrder(null)}
                              className="rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black font-bold px-6"
                            >
                              CANCEL
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <Button 
                            onClick={() => setSelectedOrder(order.id)}
                            className="rounded-full bg-black text-white hover:bg-gray-800 font-bold px-6"
                          >
                            MARK AS SHIPPED
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black font-bold px-6"
                          >
                            CANCEL ORDER
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
