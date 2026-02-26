import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingCart, Shirt, Disc, Palette, Package, Heart, Zap, Plus } from "lucide-react";
import { toastCartSuccess, toastError } from "@/lib/toast";

// Wishlist Button Component with Lightning Bolt
function WishlistButton({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  
  // Check if product is in wishlist
  const { data: wishlistCheck } = trpc.wishlist.check.useQuery({ productId });
  const inWishlist = wishlistCheck?.inWishlist || false;

  // Add to wishlist mutation
  const addToWishlist = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate({ productId });
      utils.wishlist.count.invalidate();
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate({ productId });
      utils.wishlist.count.invalidate();
    },
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (inWishlist) {
      removeFromWishlist.mutate({ productId });
    } else {
      addToWishlist.mutate({ productId });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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

export default function Shop() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Get cart item count
  const { data: cartItemCount = 0 } = trpc.cart.count.useQuery(undefined, {
    enabled: !!user,
  });
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch all products
  const { data: products, isLoading } = trpc.ecommerce.products.getAllActive.useQuery({
    limit: 100,
  });

  const utils = trpc.useUtils();

  // Add to cart mutation
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      toastCartSuccess();
    },
    onError: () => {
      toastError("Failed to add to cart");
    },
  });

  const categories = [
    { value: null, label: "All", icon: Package },
    { value: "physical", label: "Apparel", icon: Shirt },
    { value: "digital", label: "Music", icon: Disc },
    { value: "experience", label: "Art", icon: Palette },
  ];

  // Filter products
  const filteredProducts = selectedType
    ? products?.filter((p: any) => p.type === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-8xl md:text-9xl font-bold mb-6 tracking-tight">
            Shop Your Sound.
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-4">
            Where artists sell direct. Where fans buy authentic.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-50 border-l-4 border-cyan-400 rounded-r-xl">
            <Heart className="w-5 h-5 text-cyan-600" />
            <span className="text-lg font-semibold text-gray-900">
              90% goes directly to artists
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.value || "all"}
                onClick={() => setSelectedType(cat.value)}
                variant={selectedType === cat.value ? "default" : "outline"}
                className={`rounded-full px-8 py-6 text-lg font-semibold transition-all ${
                  selectedType === cat.value
                    ? "bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-cyan-400 hover:text-cyan-600"
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Cart Button */}
        {user && cartItemCount > 0 && (
          <div className="fixed top-24 right-8 z-50">
            <Button
              onClick={() => setLocation("/cart")}
              className="rounded-full px-6 py-6 bg-black text-white hover:bg-gray-800 shadow-2xl"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart ({cartItemCount})
            </Button>
          </div>
        )}
      </div>

      {/* Featured Collection */}
      <div className="container mx-auto px-4 mb-20">
        <div className="bg-gray-900 rounded-3xl p-12 border-l-[6px] border-cyan-400 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1">
              <Badge className="rounded-full bg-cyan-500 text-white px-4 py-1 text-sm font-bold mb-4">
                FEATURED COLLECTION
              </Badge>
              <h2 className="text-7xl md:text-8xl font-bold text-white mb-4">
                Luna Rivers
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Exclusive merch drop from the artist behind "Midnight Dreams". Limited edition apparel, vinyl, and art prints.
              </p>
              <Button
                onClick={() => setLocation("/artist/luna-rivers")}
                className="rounded-full px-8 py-6 bg-cyan-500 text-white hover:bg-cyan-600 text-lg font-semibold shadow-lg"
              >
                Shop Collection →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-5xl font-bold">
            {selectedType ? categories.find(c => c.value === selectedType)?.label : "All Products"}
          </h2>
          <p className="text-xl text-gray-600">
            {filteredProducts?.length || 0} items
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-100 text-gray-900 text-2xl font-bold">
              <div className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              Loading Products...
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className="rounded-3xl border-l-4 border-cyan-400 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white overflow-hidden relative"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative" onClick={() => setLocation(`/product/${product.id}`)}>
                    {product.images && product.images.length > 0 ? (
                      <div className="aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={product.images[0]}
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

                  {/* Wishlist Lightning Bolt */}
                  {user && (
                    <WishlistButton productId={product.id} />
                  )}

                  {/* Product Info */}
                  <div className="p-6 space-y-3">
                    <Badge className="rounded-full border border-gray-200 bg-white text-gray-900 font-bold text-xs px-3 py-1 uppercase">
                      {product.type}
                    </Badge>
                    <h3 className="font-bold text-2xl text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-base text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-4xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.status === "active" ? (
                        <Badge className="rounded-full bg-cyan-500 text-white font-bold text-xs px-3 py-1">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-gray-900 text-white font-bold text-xs px-3 py-1">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                    
                    {/* Add to Cart Button */}
                    {product.status === "active" && user && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart.mutate({
                            productId: product.id,
                            quantity: 1,
                          });
                        }}
                        disabled={addToCart.isPending}
                        className="w-full mt-4 rounded-full bg-[#0cc0df] hover:bg-[#0aa0bf] text-black text-lg font-bold h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center py-24">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-6xl font-bold mb-6 text-gray-900">
              Coming Soon
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed mb-12">
              Artists are preparing exclusive merchandise and digital content. Check back soon!
            </p>
            <Button
              onClick={() => setLocation("/music")}
              className="rounded-full text-lg px-10 py-7 bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
              size="lg"
            >
              Discover Artists
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
