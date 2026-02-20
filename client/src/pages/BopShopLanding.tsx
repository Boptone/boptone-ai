import { Search, TrendingUp, Sparkles, DollarSign, Shirt, Headphones, Palette, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * BopShop Landing Page
 * Discovery-driven marketplace inspired by Gem's UX patterns
 * Text-forward brutalist design with curated collections
 */
export default function BopShopLanding() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch products for curated collections
  const { data: allProducts = [] } = trpc.ecommerce.products.getAllActive.useQuery({ limit: 100 });
  
  // Curated collections logic
  const newThisWeek = allProducts
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  
  const trendingNow = allProducts
    .filter((p: any) => p.stock && p.stock > 0)
    .slice(0, 8);
  
  const limitedEdition = allProducts
    .filter((p: any) => p.stock && p.stock < 10)
    .slice(0, 8);
  
  const underFifty = allProducts
    .filter((p: any) => p.price < 50)
    .slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/bopshop/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { name: "Apparel", icon: Shirt, link: "/bopshop/browse?category=apparel" },
    { name: "Accessories", icon: ShoppingBag, link: "/bopshop/browse?category=accessories" },
    { name: "Music", icon: Headphones, link: "/bopshop/browse?category=music" },
    { name: "Art", icon: Palette, link: "/bopshop/browse?category=art" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Search First */}
      <section className="bg-white border-b-2 border-gray-200">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              BopShop
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              Where artists sell direct. Where fans buy authentic.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for artists, products, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg border-2 border-gray-300 rounded-xl focus:border-cyan-500 focus:ring-0"
                />
              </div>
            </form>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Link key={cat.name} href={cat.link}>
                  <Button
                    variant="outline"
                    className="rounded-full border-2 border-gray-300 hover:border-gray-400 px-6 py-2"
                  >
                    <cat.icon className="h-4 w-4 mr-2" />
                    {cat.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New This Week */}
      {newThisWeek.length > 0 && (
        <section className="py-16 bg-white border-b-2 border-gray-200">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-cyan-500" />
                <h2 className="text-3xl md:text-4xl font-black">New This Week</h2>
              </div>
              <Link href="/bopshop/browse?sort=newest">
                <Button variant="ghost" className="text-lg font-semibold">
                  View All →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newThisWeek.map((product: any) => (
                <Link key={product.id} href={`/bopshop/product/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden mb-3 group-hover:border-gray-400 transition-colors">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${product.price}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trendingNow.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-cyan-500" />
                <h2 className="text-3xl md:text-4xl font-black">Trending Now</h2>
              </div>
              <Link href="/bopshop/browse?sort=popular">
                <Button variant="ghost" className="text-lg font-semibold">
                  View All →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trendingNow.map((product: any) => (
                <Link key={product.id} href={`/bopshop/product/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-3 group-hover:border-gray-400 transition-colors">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${product.price}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Limited Edition */}
      {limitedEdition.length > 0 && (
        <section className="py-16 bg-white border-b-2 border-gray-200">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-cyan-500" />
                <h2 className="text-3xl md:text-4xl font-black">Limited Edition</h2>
              </div>
              <Link href="/bopshop/browse?stock=low">
                <Button variant="ghost" className="text-lg font-semibold">
                  View All →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {limitedEdition.map((product: any) => (
                <Link key={product.id} href={`/bopshop/product/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden mb-3 group-hover:border-gray-400 transition-colors">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Only {product.stock} left
                      </div>
                      <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${product.price}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Under $50 */}
      {underFifty.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <DollarSign className="h-7 w-7 text-cyan-500" />
                <h2 className="text-3xl md:text-4xl font-black">Under $50</h2>
              </div>
              <Link href="/bopshop/browse?maxPrice=50">
                <Button variant="ghost" className="text-lg font-semibold">
                  View All →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {underFifty.map((product: any) => (
                <Link key={product.id} href={`/bopshop/product/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative aspect-square bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-3 group-hover:border-gray-400 transition-colors">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                        ${product.price}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="py-20 bg-white border-t-2 border-gray-200">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-black mb-12 text-center">Browse by Category</h2>
          
          {/* Text-forward category links */}
          <div className="max-w-3xl mx-auto space-y-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.link}>
                <div className="group cursor-pointer border-2 border-gray-200 rounded-xl p-6 hover:border-black transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black group-hover:translate-x-2 transition-transform">
                      {cat.name}
                    </h3>
                    <div className="text-4xl font-black text-gray-300 group-hover:text-black group-hover:translate-x-2 transition-all">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA to Full Catalog */}
          <div className="mt-16 text-center">
            <Link href="/bopshop/browse">
              <Button
                size="lg"
                className="rounded-full px-12 py-7 text-xl font-black shadow-[0_4px_0_0_rgb(6,182,212)] hover:shadow-[0_2px_0_0_rgb(6,182,212)] transition-all"
              >
                Browse All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
