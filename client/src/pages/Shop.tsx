import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Shop() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch all products
  const { data: products, isLoading } = trpc.ecommerce.products.getAllActive.useQuery({
    limit: 100,
  });

  // Get cart count
  const { data: cart } = trpc.ecommerce.cart.get.useQuery(undefined, {
    enabled: !!user,
  });

  const cartItemCount = cart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const productTypes = [
    { value: "physical", label: "Physical Merch", description: "T-shirts, vinyl, posters" },
    { value: "digital", label: "Digital Downloads", description: "Beats, samples, stems" },
    { value: "experience", label: "Experiences", description: "Meet & greets, studio sessions" },
  ];

  // Filter products
  const filteredProducts = selectedType
    ? products?.filter((p: any) => p.type === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Width, Centered */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-5xl mx-auto mb-20">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6">
            BopShop.
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Support artists directly. 90% of every purchase goes straight to creators—no middlemen, no hidden fees.
          </p>
          
          {/* Value Props - Inline Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Badge className="rounded-full border-4 border-black bg-white text-black font-bold text-lg px-6 py-3">
              90% to Artists
            </Badge>
            <Badge className="rounded-full border-4 border-black bg-white text-black font-bold text-lg px-6 py-3">
              Exclusive Merch
            </Badge>
            <Badge className="rounded-full border-4 border-black bg-white text-black font-bold text-lg px-6 py-3">
              Verified Creators
            </Badge>
          </div>

          {user && cartItemCount > 0 && (
            <Button 
              onClick={() => setLocation("/cart")}
              className="rounded-full text-xl px-12 py-7 bg-black text-white hover:bg-gray-800 border-4 border-black font-bold shadow-[8px_8px_0px_0px_rgba(129,230,254,1)] hover:shadow-[4px_4px_0px_0px_rgba(129,230,254,1)] transition-all"
              size="lg"
            >
              View Cart ({cartItemCount})
            </Button>
          )}
        </div>

        {/* Browse by Category */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-10 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* All Products Card */}
            <div 
              className={`border-2 p-10 cursor-pointer transition-colors ${
                selectedType === null 
                  ? 'border-black bg-black' 
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
              onClick={() => setSelectedType(null)}
            >
              <h3 className={`text-3xl font-bold mb-4 ${selectedType === null ? 'text-white' : 'text-black'}`}>
                All Products
              </h3>
              <p className={`leading-relaxed text-lg ${selectedType === null ? 'text-gray-300' : 'text-gray-600'}`}>
                Browse everything
              </p>
            </div>

            {/* Category Cards */}
            {productTypes.map((type) => {
              const isSelected = selectedType === type.value;

              return (
                <div 
                  key={type.value}
                  className={`border-2 p-10 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-black bg-black' 
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <h3 className={`text-3xl font-bold mb-4 ${isSelected ? 'text-white' : 'text-black'}`}>
                    {type.label}
                  </h3>
                  <p className={`leading-relaxed text-lg ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-black text-white text-2xl font-bold border-4 border-black">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading Products...
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className="rounded-none border-4 border-black cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all bg-white"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <CardContent className="p-6">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className="aspect-square bg-gray-50 rounded-none border-2 border-black mb-4 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-none border-2 border-black mb-4 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-3">
                    <Badge className="rounded-full border-2 border-black bg-white text-black font-bold text-xs px-3 py-1 uppercase">
                      {product.type}
                    </Badge>
                    <h3 className="font-bold text-xl text-black line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-3xl font-bold text-black">
                        ${product.price}
                      </span>
                      {product.status === "active" ? (
                        <Badge className="rounded-full border-2 border-black bg-white text-black font-bold text-xs px-3 py-1">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-full border-2 border-black bg-black text-white font-bold text-xs px-3 py-1">
                          Sold Out
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center py-16">
            <h2 className="text-6xl font-bold mb-8">
              Coming Soon
            </h2>
            <p className="text-2xl text-gray-600 leading-relaxed mb-12">
              Artists are preparing exclusive merchandise and digital content. Check back soon!
            </p>
            <Button
              onClick={() => setLocation("/discover")}
              className="rounded-full text-lg px-10 py-7 bg-black hover:bg-gray-800 text-white shadow-[8px_8px_0px_0px_#81e6fe]"
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
