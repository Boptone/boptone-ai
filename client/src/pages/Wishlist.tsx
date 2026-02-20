import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Link } from "wouter";

/**
 * Wishlist Page
 * Displays user's saved products with ability to add to cart or remove
 */
export default function Wishlist() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [removingId, setRemovingId] = useState<number | null>(null);

  // Fetch wishlist
  const { data: wishlist = [], isLoading, refetch } = trpc.ecommerce.wishlist.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const utils = trpc.useUtils();
  
  const removeFromWishlist = trpc.ecommerce.wishlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from wishlist");
      refetch();
      setRemovingId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
      setRemovingId(null);
    },
  });

  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      utils.ecommerce.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleRemove = (productId: number) => {
    setRemovingId(productId);
    removeFromWishlist.mutate({ productId });
  };

  const handleAddToCart = (productId: number, price: number) => {
    addToCart.mutate({
      productId,
      priceAtAdd: price,
      quantity: 1,
    });
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Heart className="h-10 w-10 fill-red-500 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && wishlist.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
            <Heart className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start saving products you love to buy them later!
            </p>
            <Link href="/bopshop/browse">
              <Button className="bg-black text-white rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all">
                Browse BopShop
              </Button>
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!isLoading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              const primaryImage = product.primaryImageUrl || 
                (product.images && Array.isArray(product.images) && product.images[0]?.url);
              const isRemoving = removingId === product.id;
              const isOutOfStock = product.trackInventory && product.inventoryQuantity <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-black transition-all group"
                >
                  {/* Product Image */}
                  <Link href={`/bopshop/${product.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white px-4 py-2 rounded-xl font-bold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <Link href={`/bopshop/${product.slug}`}>
                      <h3 className="font-bold text-lg hover:text-cyan-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${(product.compareAtPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product.id, product.price)}
                        disabled={isOutOfStock || addToCart.isPending}
                        className="w-full bg-black text-white rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/bopshop/${product.slug}`}>
                          <Button
                            variant="outline"
                            className="w-full border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleRemove(product.id)}
                          disabled={isRemoving}
                          className="border-2 border-red-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
