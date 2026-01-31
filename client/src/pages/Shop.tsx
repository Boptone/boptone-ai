import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Filter } from "lucide-react";
import { useLocation } from "wouter";

export default function Shop() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  // Fetch all products
  const { data: products, isLoading } = trpc.ecommerce.products.list.useQuery({
    type: selectedType || undefined,
    artistId: selectedArtist || undefined,
  });

  // Get cart count
  const { data: cart } = trpc.ecommerce.cart.getCart.useQuery(undefined, {
    enabled: !!user,
  });

  const cartItemCount = cart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const productTypes = [
    { value: "physical", label: "Physical Merch" },
    { value: "digital", label: "Digital Downloads" },
    { value: "experience", label: "Experiences" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">
                BOPSHOP
              </h1>
              <p className="text-xl font-bold mt-3">
                SUPPORT ARTISTS DIRECTLY. 90% GOES TO CREATORS.
              </p>
            </div>
            {user && (
              <Button
                onClick={() => setLocation("/cart")}
                className="relative rounded-none border-4 border-black bg-white text-black hover:bg-black hover:text-white font-black uppercase"
                size="lg"
              >
                <ShoppingCart className="mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 rounded-none border-2 border-black bg-blue-600 text-white font-black"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b-4 border-black bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-black uppercase text-sm">Filter:</span>
            </div>
            <Button
              onClick={() => setSelectedType(null)}
              variant={selectedType === null ? "default" : "outline"}
              className="rounded-none border-2 border-black font-black uppercase"
            >
              All
            </Button>
            {productTypes.map((type) => (
              <Button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                variant={selectedType === type.value ? "default" : "outline"}
                className="rounded-none border-2 border-black font-black uppercase"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-2xl font-black">LOADING PRODUCTS...</div>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-4 border-black">
            {products.map((product: any, idx: number) => {
              const isLastInRow = (idx + 1) % 4 === 0;
              const isLastRow = idx >= products.length - 4;
              
              return (
                <div
                  key={product.id}
                  className={`bg-white p-6 cursor-pointer hover:bg-gray-50 transition-colors
                    ${!isLastInRow ? 'border-r-4 border-black' : ''}
                    ${!isLastRow ? 'border-b-4 border-black' : ''}
                  `}
                  onClick={() => setLocation(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className="aspect-square bg-gray-100 border-4 border-black mb-4 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 border-4 border-black mb-4 flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2">
                    <Badge
                      className="rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs"
                    >
                      {product.type}
                    </Badge>
                    <h3 className="font-black text-lg uppercase line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-black font-mono" style={{ color: '#4285F4' }}>
                        ${product.price}
                      </span>
                      {product.status === "active" ? (
                        <Badge className="rounded-none border-2 border-green-600 bg-green-50 text-green-600 font-black uppercase">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-none border-2 border-red-600 bg-red-50 text-red-600 font-black uppercase">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border-4 border-black">
            <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-gray-300" />
            <h2 className="text-3xl font-black uppercase mb-4">No Products Yet</h2>            <p className="text-lg text-gray-600 mb-8">
              Check back soon for exclusive artist merchandise and digital content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
