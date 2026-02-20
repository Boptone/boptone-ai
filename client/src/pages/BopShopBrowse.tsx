import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { Search, SlidersHorizontal, ShoppingCart, X } from "lucide-react";
import "./BopShopBrowse.css";
import { ProductQuickView } from "@/components/ProductQuickView";


/**
 * BopShop - Public Storefront
 * Gem-inspired masonry layout with BAP Protocol aesthetic
 */
export default function BopShopBrowse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; slug: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all active products
  const { data: products, isLoading } = trpc.ecommerce.products.getAllActive.useQuery({
    limit: 100,
  });

  const handleProductClick = (product: any) => {
    setSelectedProduct({ id: product.id, slug: product.slug });
    setModalOpen(true);
    setLocation(`/bopshop/browse/${product.slug}`);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setLocation("/bopshop/browse");
      setSelectedProduct(null);
    }
  };

  // Filter and sort products
  const filteredProducts = products
    ?.filter((product: any) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // Get unique categories
  const categories = Array.from(
    new Set(products?.map((p: any) => p.category).filter(Boolean))
  );

  // Uniform card sizing - no aspect ratio variations

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-6xl font-bold mb-2">BopShop</h1>
              <p className="text-2xl text-gray-600">
                Official artist merchandise
              </p>
            </div>
            <Link href="/cart">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
              </Button>
            </Link>
          </div>

          {/* Search & Filter Row */}
          <div className="flex gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-12 pr-12 h-14 text-lg border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors px-8"
                >
                  <SlidersHorizontal className="mr-2 h-5 w-5" />
                  Filter
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-gray-200 rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold">
                    Filter Products
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-lg font-medium mb-3 block">
                      Category
                    </label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={String(cat)} value={String(cat)}>
                            {String(cat)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-lg font-medium mb-3 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Apply Button */}
                  <Button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-black text-white rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all"
                  >
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Sort Dropdown (Desktop) */}
            <div className="hidden md:block">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-14 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-2xl text-gray-600">Loading products...</div>
          </div>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold mb-4">No products found</h2>
            <p className="text-xl text-gray-600 mb-8">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              variant="outline"
              className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-xl text-gray-600">
                {filteredProducts.length.toLocaleString()}+ results
              </p>
            </div>

            {/* Pinterest-Style Masonry Grid */}
            <div className="masonry-grid">
              {filteredProducts.map((product: any, index: number) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="masonry-item group cursor-pointer w-full text-left"
                >
                  <div>
                    {/* Product Image Container */}
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-colors bg-white">
                      {/* Image */}
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                            No Image
                          </div>
                        )}

                        {/* Price Badge Overlay - BAP Protocol */}
                        <div className="absolute top-3 right-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm">
                          <span className="text-lg font-bold">
                            ${(product.price / 100).toFixed(2)}
                          </span>
                        </div>

                        {/* Featured Badge - BAP Protocol */}
                        {product.featured && (
                          <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-xl text-sm font-medium">
                            Featured
                          </div>
                        )}

                        {/* Stock Status */}
                        {product.trackInventory && product.inventoryQuantity === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-lg font-bold text-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {product.trackInventory &&
                          product.inventoryQuantity > 0 &&
                          product.inventoryQuantity <= 5 && (
                            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                              Only {product.inventoryQuantity} left
                            </div>
                          )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="text-sm text-gray-500">{product.category}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>        )}
      </div>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          productId={selectedProduct.id}
          productSlug={selectedProduct.slug}
          open={modalOpen}
          onOpenChange={handleModalClose}
        />
      )}
    </div>
  );
}
