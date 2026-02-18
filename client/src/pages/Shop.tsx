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
    { value: "physical", label: "Physical Merch", icon: "👕", description: "T-shirts, vinyl, posters" },
    { value: "digital", label: "Digital Downloads", icon: "💿", description: "Beats, samples, stems" },
    { value: "experience", label: "Experiences", icon: "🎫", description: "Meet & greets, studio sessions" },
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
            <Card 
              className={`rounded-none border-4 cursor-pointer transition-all ${
                selectedType === null 
                  ? 'border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
              }`}
              onClick={() => setSelectedType(null)}
            >
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className={`text-2xl font-bold mb-2 ${selectedType === null ? 'text-white' : 'text-black'}`}>
                  All Products
                </h3>
                <p className={`text-sm font-medium ${selectedType === null ? 'text-gray-300' : 'text-gray-600'}`}>
                  Browse everything
                </p>
              </CardContent>
            </Card>

            {/* Category Cards */}
            {productTypes.map((type) => {
              const isSelected = selectedType === type.value;

              return (
                <Card 
                  key={type.value}
                  className={`rounded-none border-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-black bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">{type.icon}</div>
                    <h3 className={`text-2xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-black'}`}>
                      {type.label}
                    </h3>
                    <p className={`text-sm font-medium ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
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
                      <span className="text-6xl">🛍️</span>
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
          <Card className="rounded-none border-4 border-black bg-white max-w-2xl mx-auto">
            <CardContent className="p-16 text-center">
              <div className="text-8xl mb-6">🎨</div>
              <h2 className="text-4xl font-bold text-black mb-4">Coming Soon</h2>
              <p className="text-xl text-gray-600 font-medium mb-8">
                Artists are preparing exclusive merchandise and digital content. Check back soon!
              </p>
              <Button
                onClick={() => setLocation("/discover")}
                className="rounded-full text-lg px-10 py-6 bg-black text-white hover:bg-gray-800 border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(129,230,254,1)] hover:shadow-[2px_2px_0px_0px_rgba(129,230,254,1)] transition-all"
              >
                Discover Artists
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
