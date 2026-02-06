import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { productId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading } = trpc.ecommerce.products.getById.useQuery(
    { id: parseInt(productId!) },
    { enabled: !!productId }
  );

  // Fetch product variants
  // TODO: Implement getVariants procedure in ecommerceRouter
  const variants: any[] = []; // Temporarily disabled until backend implements getVariants

  // Fetch reviews
  const { data: reviews } = trpc.ecommerce.reviews.getByProduct.useQuery(
    { productId: parseInt(productId!) },
    { enabled: !!productId }
  );

  // Add to cart mutation
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (variants && variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    addToCart.mutate({
      productId: parseInt(productId!),
      priceAtAdd: product?.price || 0,
      variantId: selectedVariant || undefined,
      quantity,
    });
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-black">LOADING...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">PRODUCT NOT FOUND</h1>
          <Button onClick={() => setLocation("/shop")} className="rounded-xl border border-gray-200 font-black">
            <ArrowLeft className="mr-2" />
            BACK TO BOPSHOP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={() => setLocation("/shop")}
            variant="outline"
            className="rounded-full rounded-xl border-2 border-black font-semibold uppercase"
          >
            <ArrowLeft className="mr-2" />
            Back to BopShop
          </Button>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-gray-100 border border-gray-200 overflow-hidden">
                <img
                  src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center">
                <ShoppingCart className="h-32 w-32 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="rounded-xl border-2 border-black bg-white text-black font-semibold  mb-4">
                {product.type}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-semibold  mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {product.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-semibold font-mono" style={{ color: '#4285F4' }}>
                  ${product.price}
                </span>
                {product.status === "active" ? (
                  <Badge className="rounded-xl border-2 border-green-600 bg-green-50 text-green-600 font-semibold uppercase">
                    In Stock
                  </Badge>
                ) : (
                  <Badge className="rounded-xl border-2 border-red-600 bg-red-50 text-red-600 font-semibold uppercase">
                    Sold Out
                  </Badge>
                )}
              </div>

              {/* Reviews Summary */}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div className="border-t-4 border-black pt-6">
                <h3 className="font-semibold  mb-4">Select Option:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {variants.map((variant: any) => (
                    <Button key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      className="rounded-full rounded-xl border border-gray-200 font-semibold  h-auto py-4"
                      disabled={variant.stock === 0}
                    >
                      <div className="text-left w-full">
                        <div>{variant.name}</div>
                        {variant.stock === 0 && (
                          <div className="text-xs text-red-600">Out of Stock</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="border-t-4 border-black pt-6">
              <h3 className="font-semibold  mb-4">Quantity:</h3>
              <div className="flex items-center gap-4">
                <Button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  className="rounded-full rounded-xl border border-gray-200 font-semibold text-2xl w-12 h-12"
                >
                  -
                </Button>
                <span className="text-2xl font-semibold font-mono w-12 text-center">
                  {quantity}
                </span>
                <Button onClick={() => setQuantity(quantity + 1)}
                  variant="outline"
                  className="rounded-full rounded-xl border border-gray-200 font-semibold text-2xl w-12 h-12"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t-4 border-black pt-6">
              <Button className="rounded-full w-full rounded-xl border border-gray-200 bg-black text-white hover:bg-white hover:text-black font-semibold text-lg py-6" onClick={handleAddToCart}
                disabled={product.status !== "active" || addToCart.isPending}
              >
                <ShoppingCart className="mr-2" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <p className="text-center text-sm text-gray-600 mt-4 font-bold">
                90% OF YOUR PURCHASE GOES DIRECTLY TO THE ARTIST
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="mt-16 border-t-4 border-black pt-12">
            <h2 className="text-3xl font-semibold  mb-8">CUSTOMER REVIEWS</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-black">{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
