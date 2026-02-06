import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Filter, Sparkles, Package, Download, Ticket } from "lucide-react";
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
    { value: "physical", label: "Physical Merch", icon: Package },
    { value: "digital", label: "Digital Downloads", icon: Download },
    { value: "experience", label: "Experiences", icon: Ticket },
  ];

  // Filter products
  const filteredProducts = selectedType
    ? products?.filter((p: any) => p.type === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Revolutionary Header with Asymmetric Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="h-5 w-5" />
              BopShop Marketplace
            </div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
              Support
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                Creators
              </span>
              <span className="text-black">.</span>
            </h1>
            <p className="text-2xl text-gray-700 font-bold mb-8">
              90% goes directly to artists. Shop exclusive merch, digital content, and experiences.
            </p>
            {user && (
              <Button 
                onClick={() => setLocation("/cart")}
                className="rounded-full text-xl px-10 py-7 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 shadow-2xl font-black relative"
                size="lg"
              >
                <ShoppingCart className="mr-3 h-6 w-6" />
                View Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 rounded-full border-4 border-white bg-green-500 text-white font-black text-lg px-3 py-1">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Right: Stats Card */}
          <Card className="rounded-3xl border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-pink-50">
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-black text-white">90%</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gray-900">To Artists</div>
                    <div className="text-lg text-gray-600 font-medium">Direct Support</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gray-900">Exclusive</div>
                    <div className="text-lg text-gray-600 font-medium">Limited Editions</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gray-900">Authentic</div>
                    <div className="text-lg text-gray-600 font-medium">Verified Creators</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons - Color-Coded Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* All Button */}
            <Card 
              className={`rounded-3xl border-4 shadow-xl cursor-pointer hover:scale-105 transition-transform ${
                selectedType === null 
                  ? 'border-black bg-gradient-to-br from-gray-900 to-black' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => setSelectedType(null)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 ${
                  selectedType === null 
                    ? 'bg-white' 
                    : 'bg-gradient-to-br from-gray-200 to-gray-300'
                }`}>
                  <Filter className={`h-7 w-7 ${selectedType === null ? 'text-black' : 'text-gray-600'}`} />
                </div>
                <h3 className={`text-xl font-black ${selectedType === null ? 'text-white' : 'text-gray-900'}`}>
                  All Products
                </h3>
              </CardContent>
            </Card>

            {/* Category Buttons */}
            {productTypes.map((type) => {
              const isSelected = selectedType === type.value;
              const Icon = type.icon;
              const colorMap = {
                physical: { 
                  border: 'border-blue-500', 
                  bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
                  iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
                  selectedBg: 'bg-gradient-to-br from-blue-600 to-indigo-600'
                },
                digital: { 
                  border: 'border-purple-500', 
                  bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
                  iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500',
                  selectedBg: 'bg-gradient-to-br from-purple-600 to-pink-600'
                },
                experience: { 
                  border: 'border-green-500', 
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
                  iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
                  selectedBg: 'bg-gradient-to-br from-green-600 to-emerald-600'
                },
              };
              const colors = colorMap[type.value as keyof typeof colorMap];

              return (
                <Card 
                  key={type.value}
                  className={`rounded-3xl border-4 shadow-xl cursor-pointer hover:scale-105 transition-transform ${
                    isSelected ? `${colors.border} ${colors.selectedBg}` : `${colors.border} ${colors.bg}`
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 ${
                      isSelected ? 'bg-white' : colors.iconBg
                    }`}>
                      <Icon className={`h-7 w-7 ${isSelected ? colors.iconBg.replace('bg-gradient-to-br', 'text').split(' ')[0].replace('bg', 'text') : 'text-white'}`} />
                    </div>
                    <h3 className={`text-xl font-black ${isSelected ? 'text-white' : 'text-gray-900'}`}>
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
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-2xl font-black shadow-xl">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading Products...
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className="rounded-3xl border-4 border-gray-300 shadow-xl cursor-pointer hover:scale-105 hover:border-orange-500 transition-all bg-white"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <CardContent className="p-6">
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-gray-200 mb-4 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 mb-4 flex items-center justify-center">
                      <ShoppingCart className="h-20 w-20 text-gray-400" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-3">
                    <Badge className="rounded-full border-2 border-orange-500 bg-orange-50 text-orange-600 font-black text-xs px-3 py-1">
                      {product.type}
                    </Badge>
                    <h3 className="font-black text-xl text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                        ${product.price}
                      </span>
                      {product.status === "active" ? (
                        <Badge className="rounded-full border-2 border-green-500 bg-green-50 text-green-600 font-black text-xs px-3 py-1">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="rounded-full border-2 border-red-500 bg-red-50 text-red-600 font-black text-xs px-3 py-1">
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
          <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
            <CardContent className="p-24 text-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-8">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">No Products Yet</h2>
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
