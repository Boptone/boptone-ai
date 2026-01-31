import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Package, Truck, CheckCircle, XCircle } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-24">
        <h1 className="text-4xl font-black tracking-tighter mb-4">YOUR ORDERS</h1>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unfulfilled":
        return <Package className="w-5 h-5" />;
      case "partial":
        return <Truck className="w-5 h-5" />;
      case "fulfilled":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unfulfilled":
        return "text-yellow-600 bg-yellow-50";
      case "partial":
        return "text-blue-600 bg-blue-50";
      case "fulfilled":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <Link href="/my-store">
          <Button variant="outline" className="mb-4 border-2 border-black font-bold">
            ← BACK TO MY STORE
          </Button>
        </Link>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">YOUR ORDERS</h1>
        <p className="text-lg text-muted-foreground">
          Manage orders, update fulfillment status, and add tracking information
        </p>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <Card className="p-12 border-2 border-black text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">
            Orders will appear here when customers purchase your products
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-2 border-black overflow-hidden">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-black font-mono mb-1">
                      Order #{order.orderNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black font-mono mb-2">
                      ${(parseInt(order.total) / 100).toFixed(2)}
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 font-bold text-sm uppercase ${getStatusColor(
                        order.fulfillmentStatus
                      )}`}
                    >
                      {getStatusIcon(order.fulfillmentStatus)}
                      {order.fulfillmentStatus.replace("_", " ")}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="font-bold mb-2">CUSTOMER</div>
                    <div className="text-sm">
                      <div>{order.customerEmail}</div>
                      {order.customerPhone && <div>{order.customerPhone}</div>}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-2">SHIPPING ADDRESS</div>
                    <div className="text-sm">
                      <div>{order.shippingAddress.name}</div>
                      <div>{order.shippingAddress.line1}</div>
                      {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                      <div>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zip}
                      </div>
                      <div>{order.shippingAddress.country}</div>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="mb-6 p-4 bg-gray-50 border-2 border-black">
                    <div className="font-bold mb-2">TRACKING INFORMATION</div>
                    <div className="font-mono text-sm">{order.trackingNumber}</div>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Track Package →
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                {order.fulfillmentStatus === "unfulfilled" && (
                  <div className="border-t-2 border-black pt-6">
                    {selectedOrder === order.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tracking" className="font-bold">
                            TRACKING NUMBER *
                          </Label>
                          <Input
                            id="tracking"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="1Z999AA10123456784"
                            className="border-2 border-black mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trackingUrl" className="font-bold">
                            TRACKING URL (OPTIONAL)
                          </Label>
                          <Input
                            id="trackingUrl"
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder="https://www.ups.com/track?..."
                            className="border-2 border-black mt-1"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleMarkShipped(order.id)}
                            disabled={updateOrder.isPending}
                            className="bg-black text-white hover:bg-gray-800 font-bold"
                          >
                            {updateOrder.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                UPDATING...
                              </>
                            ) : (
                              <>
                                <Truck className="w-4 h-4 mr-2" />
                                MARK AS SHIPPED
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedOrder(null)}
                            className="border-2 border-black font-bold"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setSelectedOrder(order.id)}
                          className="bg-black text-white hover:bg-gray-800 font-bold"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          MARK AS SHIPPED
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCancelOrder(order.id)}
                          className="border-2 border-black font-bold text-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          CANCEL ORDER
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
