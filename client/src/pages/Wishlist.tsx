import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Zap, ShoppingCart, Package, Trash2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { getLoginUrl } from "@/const";

export default function Wishlist() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch wishlist items
  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(undefined, {
    enabled: !!user,
  });

  const utils = trpc.useUtils();

  // Remove from wishlist
  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate();
      utils.wishlist.count.invalidate();
      toastSuccess("Removed from wishlist");
    },
  });

  // Add to cart
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      utils.ecommerce.cart.get.invalidate();
      toastSuccess("Added to cart!", {
        action: {
          label: "View Cart",
          onClick: () => setLocation("/cart"),
        },
      });
    },
    onError: (error) => {
      toastError(error.message || "Failed to add to cart");
    },
  });

  const handleRemove = (productId: number) => {
    removeFromWishlist.mutate({ productId });
  };

  const handleAddToCart = (productId: number) => {
    addToCart.mutate({ productId, quantity: 1 });
  };

  // Require authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Zap className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
          <h1 className="text-4xl font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-8">
            Save your favorite products and access them anytime.
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="rounded-full px-8 py-6 text-lg font-semibold bg-cyan-500 text-black hover:bg-cyan-600"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Zap className="w-12 h-12 text-cyan-500 fill-cyan-500" />
            <h1 className="text-6xl md:text-7xl font-bold">Your Wishlist</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Products you've saved for later
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wishlist...</p>
            </div>
          ) : !wishlistItems || wishlistItems.length === 0 ? (
            <div className="text-center py-20">
              {/* Empty State Icon - BAP Protocol */}
              <div className="inline-flex items-center justify-center w-40 h-40 bg-[#0a1628] border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-8">
                <Zap className="w-20 h-20 text-[#0cc0df] fill-[#0cc0df]" strokeWidth={2} />
              </div>
              
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                Nothing here yet! Click the lightning bolt ⚡ to save products you love.
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Build your collection and never lose track of merch you want.
              </p>
              
              <Button
                onClick={() => setLocation("/shop")}
                className="bg-[#0cc0df] text-black text-xl px-8 py-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all font-bold"
              >
                Browse BopShop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlistItems.map((item: any) => {
                const product = item.product;
                const images = Array.isArray(product.images) ? product.images : [];
                
                return (
                  <Card
                    key={item.wishlistId}
                    className="rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Product Image */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setLocation(`/product/${product.id}`)}
                      >
                        {images.length > 0 ? (
                          <div className="aspect-square bg-gray-50 overflow-hidden">
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Package className="w-20 h-20 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6 space-y-4">
                        <h3 className="font-bold text-xl text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-base text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl font-bold text-gray-900">
                            ${product.price}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addToCart.isLoading}
                            className="flex-1 rounded-full bg-cyan-500 text-black hover:bg-cyan-600 font-semibold"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            onClick={() => handleRemove(product.id)}
                            disabled={removeFromWishlist.isLoading}
                            variant="outline"
                            className="rounded-full border-2 border-black hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
