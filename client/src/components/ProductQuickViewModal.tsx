import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toastSuccess, toastError, toastCartSuccess, toastWishlistSuccess } from "@/lib/toast";

// Wishlist Button Component for Modal
function WishlistButtonModal({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  
  // Check if product is in wishlist
  const { data: wishlistCheck } = trpc.wishlist.check.useQuery({ productId });
  const inWishlist = wishlistCheck?.inWishlist || false;

  // Add to wishlist mutation
  const addToWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate({ productId });
      utils.wishlist.count.invalidate();
      toastWishlistSuccess();
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate({ productId });
      utils.wishlist.count.invalidate();
      toastSuccess("Removed from wishlist");
    },
  });

  const handleToggle = () => {
    if (inWishlist) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({ productId });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Zap
        className={`w-5 h-5 transition-all ${
          inWishlist
            ? "fill-cyan-500 text-cyan-500"
            : "fill-none text-black"
        }`}
      />
    </button>
  );
}

interface ProductQuickViewModalProps {
  product: any;
  open: boolean;
  onClose: () => void;
}

export function ProductQuickViewModal({ product, open, onClose }: ProductQuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      toastCartSuccess();
      setIsAdding(false);
      onClose();
    },
    onError: (error) => {
      toastError(error.message || "Failed to add to cart");
      setIsAdding(false);
    },
  });

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart.mutate({
      productId: product.id,
      quantity,
    });
  };

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
          {/* Left: Image Gallery */}
          <div className="bg-gray-50 p-4 md:p-6">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ShoppingCart className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="p-4 md:p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Artist Name</p>
                </div>
                <div className="flex items-center gap-2">
                  <WishlistButtonModal productId={product.id} />
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.status === "active" && (
                <Badge
                  className="rounded-full font-bold text-xs px-3 py-1 text-white mb-6"
                  style={{ backgroundColor: "#0cc0df" }}
                >
                  In Stock
                </Badge>
              )}
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isAdding || product.status !== "active"}
                className="w-full bg-[#0cc0df] text-black hover:bg-[#0bb0cf] rounded-lg border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all py-6 text-base font-bold"
                size="lg"
              >
                {isAdding ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
