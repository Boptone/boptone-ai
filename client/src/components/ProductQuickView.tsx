import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Share2, Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface ProductQuickViewProps {
  productId: number;
  productSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Product Quick View Modal
 * Gem-inspired modal with image gallery, share, and save functionality
 * Includes robust alt-text and SEO metadata
 */
export function ProductQuickView({
  productId,
  productSlug,
  open,
  onOpenChange,
}: ProductQuickViewProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading } = trpc.ecommerce.products.getBySlug.useQuery(
    { slug: productSlug },
    { enabled: open && !!productSlug }
  );

  // Add to cart mutation
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });
  
  // Check if product is in wishlist
  const { data: isInWishlist } = trpc.ecommerce.wishlist.isInWishlist.useQuery(
    { productId },
    { enabled: open && isAuthenticated && !!productId }
  );
  
  // Wishlist mutations
  const utils = trpc.useUtils();
  const addToWishlist = trpc.ecommerce.wishlist.add.useMutation({
    onSuccess: () => {
      toast.success("Saved to wishlist!");
      utils.ecommerce.wishlist.isInWishlist.invalidate({ productId });
      utils.ecommerce.wishlist.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save to wishlist");
    },
  });
  
  const removeFromWishlist = trpc.ecommerce.wishlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from wishlist");
      utils.ecommerce.wishlist.isInWishlist.invalidate({ productId });
      utils.ecommerce.wishlist.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!product) return;

    addToCart.mutate({
      productId: product.id,
      priceAtAdd: product.price,
      quantity,
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/bopshop/${productSlug}`;
    const title = product?.name || "Check out this product";
    const text = product?.description || "";

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    
    if (!product) return;
    
    if (isInWishlist) {
      removeFromWishlist.mutate({ productId: product.id });
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  if (!product && !isLoading) {
    return null;
  }

  const images = product?.images || [];
  const currentImage = images[currentImageIndex]?.url || product?.primaryImageUrl;

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const isOutOfStock = product?.trackInventory && product.inventoryQuantity === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-gray-200 rounded-xl p-0"
        aria-describedby="product-quick-view-description"
      >
        {/* SEO Metadata - Hidden but accessible */}
        <div className="sr-only">
          <h1>{product?.name}</h1>
          <p id="product-quick-view-description">{product?.description}</p>
          <meta itemProp="price" content={product?.price ? (product.price / 100).toFixed(2) : ""} />
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="availability" content={isOutOfStock ? "OutOfStock" : "InStock"} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="relative bg-gray-100 aspect-square">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400 text-lg">Loading...</div>
              </div>
            ) : currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={images[currentImageIndex]?.alt || product?.name || "Product image"}
                  title={product?.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full border-2 border-gray-200 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full border-2 border-gray-200 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-white px-6 py-3 rounded-xl font-bold text-2xl">
                      Out of Stock
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                No Image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 space-y-6">
            {/* Header with Close Button */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {product?.category && (
                  <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
                    {product.category}
                  </p>
                )}
                <h2 className="text-3xl font-bold mb-2">{product?.name}</h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">
                ${product?.price ? (product.price / 100).toFixed(2) : "0.00"}
              </span>
              {product?.compareAtPrice && product.compareAtPrice > (product.price || 0) && (
                <span className="text-xl text-gray-400 line-through">
                  ${(product.compareAtPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product?.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <label className="text-sm font-medium block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    -
                  </Button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                className="w-full bg-black text-white rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all py-6 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                  className={`border-2 rounded-xl transition-colors ${
                    isInWishlist 
                      ? "border-red-500 bg-red-50 hover:bg-red-100" 
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${
                    isInWishlist ? "fill-red-500 text-red-500" : ""
                  }`} />
                  {isInWishlist ? "Saved" : "Save"}
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product?.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
