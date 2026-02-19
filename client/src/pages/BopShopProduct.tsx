import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

/**
 * BopShop Product Detail Page
 * Shows individual product with add to cart functionality
 */
export default function BopShopProduct() {
  const [, params] = useRoute("/shop/:slug");
  const slug = params?.slug || "";
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  // Fetch product
  const { data: product, isLoading } = trpc.ecommerce.products.getBySlug.useQuery({ slug });

  // Fetch variants if product exists
  const { data: variants } = trpc.ecommerce.variants.getByProduct.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  );

  // Add to cart mutation
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
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
      toast.error("Not enough stock available");
      return;
    }

    addToCart.mutate({
      productId: product.id,
      variantId: selectedVariant || undefined,
      quantity,
      priceAtAdd: product.price,
    });
  };

  const incrementQuantity = () => {
    if (product?.trackInventory && quantity >= product.inventoryQuantity) {
      toast.error("Maximum quantity reached");
      return;
    }
    setQuantity((q) => q + 1);
  };

  const decrementQuantity = () => {
    setQuantity((q) => Math.max(1, q - 1));
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
  const isLowStock = product.trackInventory && product.inventoryQuantity <= 5 && product.inventoryQuantity > 0;

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

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {product.primaryImageUrl ? (
                <img
                  src={product.primaryImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                  No Image Available
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-xl text-lg font-medium">
                  Featured
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-6xl font-bold mb-4">{product.name}</h1>
            
            {/* Price */}
            <div className="mb-6">
              <span className="text-5xl font-bold">
                ${(product.price / 100).toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="ml-4 text-2xl text-gray-400 line-through">
                  ${(product.compareAtPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {isOutOfStock && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-xl font-medium text-red-600">Out of Stock</p>
              </div>
            )}
            {isLowStock && (
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <p className="text-xl font-medium text-orange-600">
                  Only {product.inventoryQuantity} left in stock!
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Description</h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Options</h2>
                <div className="grid grid-cols-2 gap-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`p-4 border-2 rounded-xl transition-colors ${
                        selectedVariant === variant.id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      {variant.price && (
                        <div className="text-sm text-gray-600">
                          ${(variant.price / 100).toFixed(2)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Quantity</h2>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={decrementQuantity}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <span className="text-3xl font-bold w-16 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={incrementQuantity}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
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
              className="w-full bg-black text-white text-2xl py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              {isOutOfStock ? "Out of Stock" : addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>

            {/* Product Details */}
            <div className="mt-8 p-6 bg-white border-2 border-gray-200 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">Product Details</h2>
              <div className="space-y-2 text-lg">
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{product.weight}</span>
                  </div>
                )}
                {product.requiresShipping && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
