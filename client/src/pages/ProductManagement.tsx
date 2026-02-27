import { useState } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * BopShop Product Management Dashboard
 * Artists can add, edit, and manage their merchandise products
 */
export default function ProductManagement() {
  useRequireArtist(); // Enforce artist authentication
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<"draft" | "active" | "archived" | undefined>(undefined);

  // Fetch artist's products
  const { data: products, isLoading, refetch } = trpc.ecommerce.products.getMy.useQuery(
    { status: statusFilter },
    { enabled: !!user }
  );

  // Delete product mutation
  const deleteMutation = trpc.ecommerce.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

  // Toggle product status mutation
  const updateMutation = trpc.ecommerce.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const handleDelete = (productId: number, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteMutation.mutate({ id: productId });
    }
  };

  const handleToggleStatus = (productId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "draft" : "active";
    updateMutation.mutate({
      id: productId,
      status: newStatus as "draft" | "active" | "archived",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in required</h2>
          <p className="text-gray-600 mb-6">You need to sign in to manage your BopShop products.</p>
          <Button onClick={() => setLocation("/auth-signup")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">BopShop Products</h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your merchandise, digital downloads, and experiences
          </p>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === undefined ? "default" : "outline"}
                onClick={() => setStatusFilter(undefined)}
                className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === "draft" ? "default" : "outline"}
                onClick={() => setStatusFilter("draft")}
                className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === "archived" ? "default" : "outline"}
                onClick={() => setStatusFilter("archived")}
                className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Archived
              </Button>
            </div>

            <Button
              onClick={() => setLocation("/products/new")}
              className="bg-black text-white rounded-xl border border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(6,182,212,1)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 rounded-xl">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-2">No products yet</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter
                ? `No ${statusFilter} products found. Try a different filter.`
                : "Start selling by adding your first product."}
            </p>
            {!statusFilter && (
              <Button
                onClick={() => setLocation("/products/new")}
                className="bg-black text-white rounded-xl border border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(6,182,212,1)]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors"
              >
                {/* Product Image */}
                {product.primaryImageUrl ? (
                  <img
                    src={product.primaryImageUrl}
                    alt={product.name}
                    className="w-full h-48 object-contain rounded-xl mb-4 bg-gray-50"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Product Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description || "No description"}
                  </p>
                  <p className="text-2xl font-bold">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                  {product.trackInventory && (
                    <p className="text-sm text-gray-600 mt-1">
                      Stock: {product.inventoryQuantity} units
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/products/edit/${product.id}`)}
                    className="flex-1 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(product.id, product.status)}
                    className="rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    {product.status === "active" ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id, product.name)}
                    className="rounded-xl border border-gray-200 hover:border-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
