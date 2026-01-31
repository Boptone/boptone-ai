import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { ProductForm } from "@/components/ProductForm";

/**
 * My Store - Artist Storefront Management Dashboard
 * Allows creators to add/edit products, manage inventory, and fulfill orders
 * Implements brutalist design with ownership-focused language
 */
export default function MyStore() {
  const { user, loading: authLoading } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-24">
        <h1 className="text-4xl font-black tracking-tighter mb-4">YOUR STORE</h1>
        <p className="text-lg">Please log in to manage your store.</p>
      </div>
    );
  }

  const pendingOrders = orders?.filter((o) => o.fulfillmentStatus === "unfulfilled") ?? [];
  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) ?? 0;

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">YOUR STORE</h1>
        <p className="text-lg text-muted-foreground">
          Manage your products, inventory, and orders. You keep 90% of every sale.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 border-2 border-black">
          <div className="text-sm font-bold mb-2">YOUR PRODUCTS</div>
          <div className="text-4xl font-black font-mono">{products?.length ?? 0}</div>
        </Card>
        <Card className="p-6 border-2 border-black">
          <div className="text-sm font-bold mb-2">PENDING ORDERS</div>
          <div className="text-4xl font-black font-mono">{pendingOrders.length}</div>
        </Card>
        <Card className="p-6 border-2 border-black">
          <div className="text-sm font-bold mb-2">YOUR REVENUE</div>
          <div className="text-4xl font-black font-mono">${totalRevenue.toFixed(2)}</div>
        </Card>
      </div>

      {/* Products Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black tracking-tighter">YOUR PRODUCTS</h2>
          <Button
            onClick={() => setShowAddProduct(true)}
            className="bg-black text-white hover:bg-gray-800 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADD PRODUCT
          </Button>
        </div>

        {!products || products.length === 0 ? (
          <Card className="p-12 border-2 border-black text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Start selling by adding your first product
            </p>
            <Button
              onClick={() => setShowAddProduct(true)}
              className="bg-black text-white hover:bg-gray-800 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              ADD YOUR FIRST PRODUCT
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-2 border-black overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono">${product.price}</span>
                    <span className="text-sm text-muted-foreground uppercase">
                      {product.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm font-mono">
                    <div>
                      <div className="text-muted-foreground">Stock</div>
                      <div className="font-bold">{product.inventory ?? "∞"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className="font-bold uppercase">{product.status}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 border-black font-bold"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      EDIT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-black font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <h2 className="text-3xl font-black tracking-tighter">RECENT ORDERS</h2>
          <Link href="/my-store/orders">
            <Button variant="outline" className="border-2 border-black font-bold">
              VIEW ALL ORDERS
            </Button>
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="p-12 border-2 border-black text-center">
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              Orders will appear here when customers purchase your products
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <Card key={order.id} className="p-4 border-2 border-black">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold font-mono">Order #{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono">${order.total}</div>
                    <div className="text-sm font-bold uppercase">
                      {order.fulfillmentStatus.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <ProductForm
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => setShowAddProduct(false)}
        />
      )}
    </div>
  );
}
