import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";
import { ProductForm } from "@/components/ProductForm";
import { ConnectPrintfulDialog } from "@/components/ConnectPrintfulDialog";
import { Badge } from "@/components/ui/badge";

/**
 * My Store - Artist Storefront Management Dashboard
 * Allows creators to add/edit products, manage inventory, and fulfill orders
 */
export default function MyStore() {
  const { user, loading: authLoading } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showConnectPrintful, setShowConnectPrintful] = useState(false);

  // Fetch POD connections
  const { data: podAccounts, refetch: refetchPodAccounts } = trpc.pod.getConnectedAccounts.useQuery(
    undefined,
    { enabled: !!user }
  );

  const printfulAccount = podAccounts?.find((acc) => acc.provider?.name === "printful");

  // Fetch artist's products
  const { data: products, isLoading: productsLoading } = trpc.ecommerce.products.getMy.useQuery(
    {},
    { enabled: !!user }
  );

  // Fetch artist's orders
  const { data: orders, isLoading: ordersLoading } = trpc.ecommerce.orders.getByArtist.useQuery(
    {},
    { enabled: !!user }
  );

  if (authLoading || productsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-xl font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user && !DEV_MODE) {
    return (
      <div className="container py-24">
        <h1 className="text-4xl font-semibold tracking-tight mb-4 text-black">YOUR STORE</h1>
        <p className="text-lg text-gray-600">Please log in to manage your store.</p>
      </div>
    );
  }

  const pendingOrders = orders?.filter((o) => o.fulfillmentStatus === "unfulfilled") ?? [];
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.total / 100), 0) ?? 0;

  return (
    <div className="container py-12 bg-white">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 text-black">YOUR STORE</h1>
        <p className="text-lg text-gray-600">
          Manage your products, inventory, and orders. You keep 90% of every sale.
        </p>
      </div>

      {/* POD Connection Status */}
      <Card className="rounded-none p-6 border-4 border-black mb-8 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-black">PRINT-ON-DEMAND</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect Printful to sell merchandise with zero inventory. We handle fulfillment, you keep 90% of profit.
            </p>
            {printfulAccount ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-black text-white rounded-full">
                  Connected
                </Badge>
                <span className="text-sm text-gray-600">
                  {printfulAccount.metadata && typeof printfulAccount.metadata === 'object' && 'email' in printfulAccount.metadata
                    ? (printfulAccount.metadata as { email?: string }).email
                    : 'Connected'}
                </span>
              </div>
            ) : (
              <Badge className="bg-white text-black border-2 border-black rounded-full">Not Connected</Badge>
            )}
          </div>
          <Button className="rounded-full" onClick={() => setShowConnectPrintful(true)}
            variant={printfulAccount ? "outline" : "default"}
            size="lg"
          >
            {printfulAccount ? "Reconnect" : "Connect Printful"}
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="rounded-none p-6 border-4 border-black bg-white">
          <div className="text-sm font-bold mb-2 text-black">YOUR PRODUCTS</div>
          <div className="text-4xl font-semibold font-mono text-black">{products?.length ?? 0}</div>
        </Card>
        <Card className="rounded-none p-6 border-4 border-black bg-white">
          <div className="text-sm font-bold mb-2 text-black">PENDING ORDERS</div>
          <div className="text-4xl font-semibold font-mono text-black">{pendingOrders.length}</div>
        </Card>
        <Card className="rounded-none p-6 border-4 border-black bg-white">
          <div className="text-sm font-bold mb-2 text-black">YOUR REVENUE</div>
          <div className="text-4xl font-semibold font-mono text-black">${totalRevenue.toFixed(2)}</div>
        </Card>
      </div>

      {/* Products Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold tracking-tighter text-black">YOUR PRODUCTS</h2>
          <Button onClick={() => setShowAddProduct(true)}
            className="rounded-full bg-black text-white hover:bg-gray-800 font-bold"
          >
            <span className="mr-2">+</span>
            ADD PRODUCT
          </Button>
        </div>

        {!products || products.length === 0 ? (
          <Card className="rounded-none p-12 border-4 border-black text-center bg-white">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-400 rounded-none flex items-center justify-center">
              <span className="text-3xl text-gray-400">□</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-black">No products yet</h3>
            <p className="text-gray-600 mb-6">
              Start selling by adding your first product
            </p>
            <Button onClick={() => setShowAddProduct(true)}
              className="rounded-full bg-black text-white hover:bg-gray-800 font-bold"
            >
              <span className="mr-2">+</span>
              ADD YOUR FIRST PRODUCT
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card className="rounded-none border-4 border-black overflow-hidden bg-white" key={product.id}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">□</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-black">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-semibold font-mono text-black">${product.price}</span>
                    <span className="text-sm text-gray-600 uppercase">
                      {product.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-mono">
                    <div>
                      <div className="text-gray-600">Stock</div>
                      <div className="font-bold text-black">{product.inventoryQuantity ?? "∞"}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Status</div>
                      <div className="font-bold uppercase text-black">{product.status}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="rounded-full flex-1 border-2 border-black font-bold bg-white hover:bg-gray-100 text-black" variant="outline"
                      size="sm"
                    >
                      <span className="mr-1">E</span>
                      EDIT
                    </Button>
                    <Button className="rounded-full border-2 border-black font-bold bg-white hover:bg-gray-100 text-black" variant="outline"
                      size="sm"
                    >
                      <span>×</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold tracking-tighter text-black">RECENT ORDERS</h2>
          <Link href="/my-store/orders">
            <Button variant="outline" className="rounded-full border-2 border-black font-bold bg-white hover:bg-gray-100 text-black">
              VIEW ALL ORDERS
            </Button>
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="rounded-none p-12 border-4 border-black text-center bg-white">
            <h3 className="text-xl font-bold mb-2 text-black">No orders yet</h3>
            <p className="text-gray-600">
              Orders will appear here when customers purchase your products
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <Card className="rounded-none p-4 border-4 border-black bg-white" key={order.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold font-mono text-black">Order #{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold font-mono text-black">${order.total}</div>
                    <div className="text-sm font-bold uppercase text-black">
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      {showAddProduct && (
        <ProductForm
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => {
            setShowAddProduct(false);
          }}
        />
      )}

      {/* Connect Printful Dialog */}
      <ConnectPrintfulDialog
        open={showConnectPrintful}
        onOpenChange={setShowConnectPrintful}
        onSuccess={() => refetchPodAccounts()}
      />
    </div>
  );
}
