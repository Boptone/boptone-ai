import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Ruler, Weight } from "lucide-react";
import { toast } from "sonner";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useCurrency } from "@/contexts/CurrencyContext";

/**
 * BopShop Product Detail Page
 * Gem-inspired layout with BAP Protocol aesthetic
 */
export default function BopShopProduct() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { currency, formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);

  // Fetch product by slug
  const { data: product, isLoading } = trpc.ecommerce.products.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  // Add to cart mutation
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      setLocation("/cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!product) return;

    // Check inventory
    if (product.trackInventory && product.inventoryQuantity < quantity) {
      toast.error("Not enough inventory available");
      return;
    }

    addToCart.mutate({
      productId: product.id,
      priceAtAdd: product.price,
      quantity,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <Link href="/bopshop">
            <Button className="bg-black text-white rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.trackInventory && product.inventoryQuantity === 0;
  const isLowStock = product.trackInventory && product.inventoryQuantity > 0 && product.inventoryQuantity <= 5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/bopshop">
            <Button
              variant="outline"
              className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
              {product.primaryImageUrl ? (
                <img
                  src={product.primaryImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  No Image
                </div>
              )}

              {/* Featured Badge - BAP Protocol */}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-xl text-base font-medium">
                  Featured
                </div>
              )}

              {/* Stock Status Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-white px-6 py-3 rounded-xl font-bold text-2xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title & Category */}
            <div>
              {product.category && (
                <p className="text-lg text-gray-500 mb-2">{product.category}</p>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{product.name}</h1>
            </div>

            {/* Price & Currency Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium">Currency:</label>
                <CurrencySelector />
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl md:text-4xl font-bold">
                  {formatPrice(product.price / 100)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-2xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice / 100)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            {isOutOfStock && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium text-lg">
                  This item is currently out of stock
                </p>
              </div>
            )}
            {isLowStock && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-orange-600 font-medium text-lg">
                  Only {product.inventoryQuantity} left in stock!
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <label className="text-lg font-medium block">Quantity</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors w-14 h-14"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="text-2xl font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      const maxQty = product.trackInventory
                        ? product.inventoryQuantity
                        : 99;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors w-14 h-14"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending}
              className="w-full bg-black text-white text-xl py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="mr-2 h-6 w-6" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            {/* Product Details */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="text-2xl font-bold mb-4">Product Details</h3>
              
              {product.sku && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">SKU:</span>
                  <span>{product.sku}</span>
                </div>
              )}

              {product.weight && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Weight className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Weight:</span>
                  <span>{product.weight} oz</span>
                </div>
              )}



              {product.trackInventory && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">In Stock:</span>
                  <span>{product.inventoryQuantity} units</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
