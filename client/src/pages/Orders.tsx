import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Package, Receipt, Truck, ExternalLink, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { toastError } from "@/lib/toast";
import { getLoginUrl } from "@/const";

/**
 * Order History Page - Enterprise-grade order management
 * 
 * Features:
 * - Paginated order list (10 per page)
 * - Order status badges (BAP Protocol styling)
 * - Order details modal with items and tracking
 * - Receipt downloads (Stripe receipts)
 * - Empty state for users with no orders
 * - Loading states and error handling
 */

export default function Orders() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const limit = 10;

  // Fetch orders with pagination
  const { data: ordersData, isLoading: ordersLoading } = trpc.orders.list.useQuery(
    { limit, offset: page * limit },
    { enabled: isAuthenticated }
  );

  // Fetch order details for modal
  const { data: orderDetails, isLoading: detailsLoading } = trpc.orders.getById.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  // Fetch order stats
  const { data: stats } = trpc.orders.getStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleDownloadReceipt = async (orderId: number) => {
    try {
      const result = await trpc.orders.getReceipt.useQuery({ orderId });
      if (result.data?.receiptUrl) {
        window.open(result.data.receiptUrl, "_blank");
      }
    } catch (error) {
      toastError("Receipt not available for this order");
    }
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-4xl font-bold mb-4">Sign in to view your orders</h1>
          <p className="text-gray-600 mb-8">
            Track your purchases and download receipts
          </p>
          <a href={getLoginUrl()}>
            <Button
              size="lg"
              className="bg-[#0cc0df] text-black text-xl px-8 py-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-bold"
            >
              Sign In
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.totalCount || 0;
  const hasMore = ordersData?.hasMore || false;
  const isEmpty = orders.length === 0 && page === 0;

  return (
    <div className="min-h-screen bg-[#f8f8f6] pb-24">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-6xl md:text-7xl font-bold mb-4">Order History</h1>
              <p className="text-xl text-gray-600">
                {stats ? `${stats.totalOrders} order${stats.totalOrders !== 1 ? "s" : ""} • $${stats.totalSpent.toFixed(2)} total` : "Track your purchases"}
              </p>
            </div>
            <Link href="/shop">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {isEmpty ? (
            // Empty State
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-40 h-40 bg-[#0a1628] border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-8">
                <ShoppingBag className="h-20 w-20 text-[#0cc0df]" strokeWidth={2} />
              </div>
              
              <h2 className="text-5xl font-bold mb-4">No orders yet</h2>
              <p className="text-xl text-gray-600 mb-2">
                You haven't placed any orders yet. Start shopping!
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Support your favorite artists with official merchandise.
              </p>
              
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-[#0cc0df] text-black text-xl px-8 py-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-bold"
                >
                  Browse BopShop
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Orders Grid */}
              <div className="space-y-4 mb-8">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="rounded-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">Order #{order.orderNumber}</h3>
                            <PaymentStatusBadge status={order.paymentStatus} />
                            <FulfillmentStatusBadge status={order.fulfillmentStatus} />
                          </div>
                          <p className="text-gray-600 mb-1">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${(order.total / 100).toFixed(2)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => setSelectedOrderId(order.id)}
                            variant="outline"
                            className="border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {order.paymentIntentId && (
                            <Button
                              onClick={() => toast.info("Receipt feature coming soon")}
                              variant="outline"
                              className="border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > limit && (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Showing {page * limit + 1}-{Math.min((page + 1) * limit, totalCount)} of {totalCount} orders
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      variant="outline"
                      className="border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!hasMore}
                      variant="outline"
                      className="border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              Order #{orderDetails?.order.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center gap-3">
                <PaymentStatusBadge status={orderDetails.order.paymentStatus} />
                <FulfillmentStatusBadge status={orderDetails.order.fulfillmentStatus} />
              </div>

              {/* Tracking Info */}
              {orderDetails.tracking && (
                <Card className="border-2 border-black rounded-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-6 h-6 text-[#0cc0df] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold mb-2">Shipping Tracking</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Carrier: {orderDetails.tracking.carrier}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Tracking: {orderDetails.tracking.trackingNumber}
                        </p>
                        {orderDetails.tracking.trackingUrl && (
                          <a
                            href={orderDetails.tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0cc0df] hover:underline text-sm flex items-center gap-1"
                          >
                            Track Package
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-xl mb-4">Items</h4>
                <div className="space-y-3">
                  {orderDetails.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border-2 border-gray-200 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.productImages && Array.isArray(item.productImages) && item.productImages[0] ? (
                          <img
                            src={typeof item.productImages[0] === 'string' ? item.productImages[0] : item.productImages[0].url}
                            alt={item.productName || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h5 className="font-bold mb-1">{item.productName || "Product"}</h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${(item.pricePerUnit / 100).toFixed(2)}
                        </p>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold">${(item.subtotal / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${parseFloat(typeof orderDetails.order.subtotal === 'number' ? orderDetails.order.subtotal.toString() : orderDetails.order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${((orderDetails.order.shippingAmount || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${((orderDetails.order.taxAmount || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-gray-200">
                    <span>Total</span>
                    <span>${((orderDetails.order.total) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Status Badge Components
function PaymentStatusBadge({ status }: { status: string }) {
  const colors = {
    paid: "bg-green-100 text-green-800 border-green-800",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-800",
    failed: "bg-red-100 text-red-800 border-red-800",
    refunded: "bg-gray-100 text-gray-800 border-gray-800",
  };

  return (
    <Badge
      className={`rounded-lg border-2 font-bold text-xs px-3 py-1 ${colors[status as keyof typeof colors] || colors.pending}`}
    >
      {status.toUpperCase()}
    </Badge>
  );
}

function FulfillmentStatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-gray-100 text-gray-800 border-gray-800",
    processing: "bg-blue-100 text-blue-800 border-blue-800",
    shipped: "bg-cyan-100 text-cyan-800 border-cyan-800",
    delivered: "bg-green-100 text-green-800 border-green-800",
    cancelled: "bg-red-100 text-red-800 border-red-800",
  };

  return (
    <Badge
      className={`rounded-lg border-2 font-bold text-xs px-3 py-1 ${colors[status as keyof typeof colors] || colors.pending}`}
    >
      {status.toUpperCase()}
    </Badge>
  );
}
