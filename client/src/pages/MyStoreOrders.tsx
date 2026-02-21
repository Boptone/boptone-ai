import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Package, Printer, Download, Truck } from "lucide-react";

/**
 * My Store Orders - Order Fulfillment Interface
 * Allows artists to view orders, update fulfillment status, and add tracking
 */
export default function MyStoreOrders() {
  const { user, loading: authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  
  // Shipping label dialog state
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [labelOrderId, setLabelOrderId] = useState<number | null>(null);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);
  const [isPurchasingLabel, setIsPurchasingLabel] = useState(false);

  // Fetch artist's orders
  const { data: orders, isLoading, refetch } = trpc.ecommerce.orders.getByArtist.useQuery(
    {},
    { enabled: !!user }
  );

  // Calculate rates mutation
  const calculateRates = trpc.shipping.calculateRates.useMutation({
    onSuccess: (data) => {
      setShippingRates(data.rates);
      setIsCalculatingRates(false);
      if (data.rates.length > 0) {
        // Auto-select cheapest rate
        const cheapest = data.rates.reduce((prev, curr) =>
          curr.amount < prev.amount ? curr : prev
        );
        setSelectedRate(cheapest.rateId);
        toast.success(`Found ${data.rates.length} shipping options`);
      } else {
        toast.error("No shipping rates available");
      }
    },
    onError: (error) => {
      setIsCalculatingRates(false);
      toast.error(error.message || "Failed to calculate rates");
    },
  });

  // Purchase label mutation
  const purchaseLabel = trpc.shipping.purchaseLabel.useMutation({
    onSuccess: (data) => {
      setIsPurchasingLabel(false);
      toast.success("Shipping label purchased!");
      
      // Download label PDF
      window.open(data.labelUrl, "_blank");
      
      // Close dialog and refresh orders
      setShowLabelDialog(false);
      setLabelOrderId(null);
      setShippingRates([]);
      setSelectedRate(null);
      refetch();
    },
    onError: (error) => {
      setIsPurchasingLabel(false);
      toast.error(error.message || "Failed to purchase label");
    },
  });

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

  const handlePrintLabel = (order: any) => {
    setLabelOrderId(order.id);
    setShowLabelDialog(true);
    setIsCalculatingRates(true);

    // Calculate shipping rates
    const parcel = {
      length: 12, // TODO: Get from product dimensions
      width: 9,
      height: 3,
      weight: 2,
    };

    calculateRates.mutate({
      orderId: order.id,
      addressTo: {
        name: order.shippingAddress.name,
        street1: order.shippingAddress.line1,
        street2: order.shippingAddress.line2 || "",
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country,
        phone: order.customerPhone || "",
      },
      parcel,
    });
  };

  const handlePurchaseLabel = () => {
    if (!selectedRate || !labelOrderId) return;

    const order = orders?.find((o) => o.id === labelOrderId);
    if (!order) return;

    setIsPurchasingLabel(true);

    const rateData = shippingRates.find((r) => r.rateId === selectedRate);
    if (!rateData) return;

    // TODO: Get artist's address from profile
    const addressFrom = {
      name: "Artist Name",
      street1: "123 Artist St",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "US",
    };

    purchaseLabel.mutate({
      orderId: labelOrderId,
      rateId: selectedRate,
      shipmentId: "temp", // TODO: Store shipment ID from calculateRates
      addressFrom,
      addressTo: {
        name: order.shippingAddress.name,
        street1: order.shippingAddress.line1,
        street2: order.shippingAddress.line2 || "",
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country,
      },
      parcel: {
        length: 12,
        width: 9,
        height: 3,
        weight: 2,
        distanceUnit: "in",
        massUnit: "lb",
      },
    });
  };

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
            <Button variant="outline" className="rounded-full mb-6 border-2 border-gray-200 bg-white hover:bg-gray-100 text-black font-bold">
              ← BACK TO STORE
            </Button>
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">YOUR ORDERS</h1>
          <p className="text-lg text-gray-600">
            Manage orders, update fulfillment status, and print shipping labels
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
                      <div className="inline-flex items-center px-4 py-2 font-bold text-sm border-2 border-gray-200 bg-white rounded-none">
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
                    <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-200 rounded-none">
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
                              className="border-2 border-gray-200 rounded-none h-12 text-base"
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
                              className="border-2 border-gray-200 rounded-none h-12 text-base"
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
                              className="rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 text-black font-bold px-6"
                            >
                              CANCEL
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 flex-wrap">
                          <Button
                            onClick={() => handlePrintLabel(order)}
                            className="rounded-full bg-black text-white hover:bg-gray-800 font-bold px-6 flex items-center gap-2"
                          >
                            <Printer className="h-4 w-4" />
                            PRINT SHIPPING LABEL
                          </Button>
                          <Button
                            onClick={() => setSelectedOrder(order.id)}
                            variant="outline"
                            className="rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 text-black font-bold px-6"
                          >
                            ENTER TRACKING MANUALLY
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-full border-2 border-gray-200 bg-white hover:bg-gray-100 text-black font-bold px-6"
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

      {/* Shipping Label Dialog */}
      <Dialog open={showLabelDialog} onOpenChange={setShowLabelDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8" />
              Print Shipping Label
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {isCalculatingRates ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Truck className="h-12 w-12 mx-auto mb-4 animate-pulse" />
                  <p className="text-lg text-gray-600">Calculating shipping rates...</p>
                </div>
              </div>
            ) : shippingRates.length > 0 ? (
              <>
                <div>
                  <h3 className="font-bold text-lg mb-4">Select Shipping Method</h3>
                  <RadioGroup value={selectedRate || ""} onValueChange={setSelectedRate}>
                    <div className="space-y-3">
                      {shippingRates.map((rate) => (
                        <div
                          key={rate.rateId}
                          className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedRate === rate.rateId
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedRate(rate.rateId)}
                        >
                          <RadioGroupItem value={rate.rateId} id={rate.rateId} />
                          <Label
                            htmlFor={rate.rateId}
                            className="flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-base">
                                {rate.carrier} - {rate.service}
                              </div>
                              <div className="text-sm text-gray-600">
                                {rate.estimatedDays > 0
                                  ? `Estimated ${rate.estimatedDays} business days`
                                  : "Standard delivery"}
                              </div>
                            </div>
                            <div className="font-bold text-lg">
                              ${rate.amount.toFixed(2)}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handlePurchaseLabel}
                    disabled={!selectedRate || isPurchasingLabel}
                    className="flex-1 bg-black text-white hover:bg-gray-800 font-bold py-6 text-lg rounded-xl flex items-center justify-center gap-2"
                  >
                    {isPurchasingLabel ? (
                      "Purchasing..."
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Purchase & Download Label
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLabelDialog(false)}
                    className="border-2 border-gray-200 rounded-xl px-8"
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Label will be charged to your Shippo account and automatically downloaded as PDF
                </p>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No shipping rates available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
