import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingCart, Shirt, Disc, Palette, Package, Heart, Sparkles, ArrowUpDown, List, Grid3x3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function Shop() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch all products
  const { data: products, isLoading } = trpc.ecommerce.products.getAllActive.useQuery({
    limit: 100,
  });

  // Get cart count
  const { data: cart } = trpc.ecommerce.cart.get.useQuery(undefined, {
    enabled: !!user,
  });

  const cartItemCount = cart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

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
          {/* BopShop Logo */}
          <img 
            src="/bopshop_main_logo_black.png" 
            alt="BopShop" 
            className="h-32 sm:h-40 md:h-48 lg:h-56 mx-auto mb-8"
          />
          <p className="text-2xl md:text-3xl text-gray-600 mb-12">
            Where artists sell direct. Where fans buy authentic.
          </p>

          {/* AI Chat Search */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for? T-shirt, Vinyl, Hoodie, Hat..."
                className="min-h-[120px] text-xl px-6 py-6 rounded-3xl border-2 border-gray-200 focus:border-black focus:ring-2 focus:ring-gray-300 resize-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                rows={3}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="font-medium">Powered by Boptone AI</span>
              </div>
            </div>
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
                    ? "bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-black hover:text-black"
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
              className="rounded-full px-6 py-6 bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
        <div className="bg-gray-900 rounded-3xl p-12 border-l-[6px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex-shrink-0"></div>
            <div className="flex-1">
              <Badge className="rounded-full bg-black text-white px-4 py-1 text-sm font-bold mb-4">
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
                className="rounded-full px-8 py-6 bg-black text-white hover:bg-gray-800 text-lg font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Shop Collection →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            {selectedType ? categories.find(c => c.value === selectedType)?.label : "All Products"}
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-600">
              {filteredProducts?.length || 0} items
            </p>
            <div className="flex items-center gap-4">
              {/* Sort By */}
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 hover:border-black transition-colors"
              >
                <ArrowUpDown className="w-5 h-5" />
                <span className="font-medium">Sort By</span>
              </button>
              {/* View As List */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 hover:border-black transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
                <span className="font-medium">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-100 text-gray-900 text-2xl font-bold">
              <div className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              Loading Products...
            </div>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className={`rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 bg-white overflow-hidden border border-gray-100 ${
                  viewMode === 'grid' ? 'hover:scale-[1.01]' : 'flex flex-row'
                }`}
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <CardContent className={viewMode === 'grid' ? 'p-0' : 'p-0 flex flex-row w-full'}>
                  {/* Product Image */}
                  {product.images && product.images.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'aspect-square bg-gray-50 overflow-hidden' : 'w-32 h-32 bg-gray-50 overflow-hidden flex-shrink-0'}>
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

                  {/* Product Info */}
                  <div className={viewMode === 'grid' ? 'p-4 space-y-2' : 'p-4 flex-1 flex flex-col justify-center'}>
                    <h3 className="font-semibold text-base text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Artist Name
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-gray-900">
                        From ${product.price}
                      </span>
                    </div>
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
              className="rounded-full text-lg px-10 py-7 bg-gray-900 hover:bg-gray-800 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
