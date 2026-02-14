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
    { value: "physical", label: "Physical Merch", symbol: "📦" },
    { value: "digital", label: "Digital Downloads", symbol: "💾" },
    { value: "experience", label: "Experiences", symbol: "🎫" },
  ];

  // Filter products
  const filteredProducts = selectedType
    ? products?.filter((p: any) => p.type === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Content */}
          <div>
            <h1 className="text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6 text-black">
              Support Creators
            </h1>
            <p className="text-2xl text-gray-700 font-bold mb-8">
              90% goes directly to artists. Shop exclusive merch, digital content, and experiences.
            </p>
            {user && (
              <Button 
                onClick={() => setLocation("/cart")}
                className="rounded-none text-xl px-10 py-6 bg-black text-white hover:bg-gray-900 border-4 border-black font-bold relative"
                size="lg"
              >
                🛒 View Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 rounded-none border-4 border-white bg-black text-white font-bold text-lg px-3 py-1">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Right: Stats Card */}
          <Card className="rounded-none border-4 border-black bg-white">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-gray-100 flex items-center justify-center border-2 border-gray-900">
                    <span className="text-3xl font-bold text-gray-900">90%</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">To Artists</div>
                    <div className="text-lg text-gray-600 font-medium">Direct Support</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-gray-100 flex items-center justify-center border-2 border-gray-900">
                    <span className="text-3xl">📦</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Exclusive</div>
                    <div className="text-lg text-gray-600 font-medium">Limited Editions</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-gray-100 flex items-center justify-center border-2 border-gray-900">
                    <span className="text-3xl">✨</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Authentic</div>
                    <div className="text-lg text-gray-600 font-medium">Verified Creators</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* All Button */}
            <Card 
              className={`rounded-none border-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                selectedType === null 
                  ? 'border-black bg-black' 
                  : 'border-gray-900 bg-white'
              }`}
              onClick={() => setSelectedType(null)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-none flex items-center justify-center mx-auto mb-4 border-2 ${
                  selectedType === null 
                    ? 'bg-white border-white' 
                    : 'bg-gray-100 border-gray-900'
                }`}>
                  <span className="text-2xl">{selectedType === null ? '⚫' : '⚪'}</span>
                </div>
                <h3 className={`text-xl font-bold ${selectedType === null ? 'text-white' : 'text-gray-900'}`}>
                  All Products
                </h3>
              </CardContent>
            </Card>

            {/* Category Buttons */}
            {productTypes.map((type) => {
              const isSelected = selectedType === type.value;

              return (
                <Card 
                  key={type.value}
                  className={`rounded-none border-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                    isSelected ? 'border-black bg-black' : 'border-gray-900 bg-white'
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-none flex items-center justify-center mx-auto mb-4 border-2 ${
                      isSelected ? 'bg-white border-white' : 'bg-gray-100 border-gray-900'
                    }`}>
                      <span className="text-2xl">{type.symbol}</span>
                    </div>
                    <h3 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {type.label}
                    </h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-none bg-black text-white text-2xl font-bold border-4 border-black">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading Products...
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className="rounded-none border-4 border-gray-900 cursor-pointer hover:bg-gray-100 transition-colors bg-white"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <CardContent className="p-6">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className="aspect-square bg-gray-50 rounded-none border-2 border-gray-900 mb-4 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-none border-2 border-gray-900 mb-4 flex items-center justify-center">
                      <span className="text-6xl">🛒</span>
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-3">
                    <Badge className="rounded-none border-2 border-gray-900 bg-white text-gray-900 font-bold text-xs px-3 py-1">
                      {product.type}
                    </Badge>
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-2">
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
                        <Badge className="rounded-none border-2 border-gray-900 bg-white text-gray-900 font-bold text-xs px-3 py-1">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-none border-2 border-gray-900 bg-gray-900 text-white font-bold text-xs px-3 py-1">
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
          <Card className="rounded-none border-4 border-gray-900 bg-white">
            <CardContent className="p-24 text-center">
              <div className="w-32 h-32 rounded-none bg-gray-100 flex items-center justify-center border-4 border-gray-900 mx-auto mb-8">
                <span className="text-6xl">🛒</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">No Products Yet</h2>
              <p className="text-xl text-gray-600 font-medium">
                Check back soon for exclusive artist merchandise and digital content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
