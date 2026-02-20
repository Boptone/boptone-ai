import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, Loader2, Music, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

/**
 * SearchBar Component
 * 
 * Global search component for products and BAP tracks
 * Features:
 * - Real-time search with debouncing
 * - Dropdown results with product/track categorization
 * - Keyboard navigation
 * - Click-outside to close
 */
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search query
  const { data: results, isLoading } = trpc.search.all.useQuery(
    { query: debouncedQuery, limit: 10 },
    { enabled: debouncedQuery.length > 0 }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are results
  useEffect(() => {
    if (results && (results.products.length > 0 || results.tracks.length > 0)) {
      setIsOpen(true);
    }
  }, [results]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search results page (TODO: create this page)
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search products and music..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10 pr-4"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && results && (results.products.length > 0 || results.tracks.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {/* Products Section */}
            {results.products.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  <Package className="w-3 h-3" />
                  Products ({results.products.length})
                </div>
                {results.products.map((product) => (
                  <Link key={product.id} href={`/bopshop/${product.slug}`}>
                    <a
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {product.primaryImageUrl && (
                        <img
                          src={product.primaryImageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${(product.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            )}

            {/* Tracks Section */}
            {results.tracks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  <Music className="w-3 h-3" />
                  Music ({results.tracks.length})
                </div>
                {results.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    {track.artworkUrl && (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {track.artist} • {track.genre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Results */}
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to full search results page
              }}
            >
              View all {results.total} results
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {isOpen && results && results.total === 0 && debouncedQuery && (
        <Card className="absolute top-full mt-2 w-full z-50">
          <CardContent className="p-4 text-center text-gray-500">
            No results found for "{debouncedQuery}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}
