import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProductDetail() {
  const { productId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading } = trpc.ecommerce.products.getById.useQuery(
    { id: parseInt(productId!) },
    { enabled: !!productId }
  );

  // Fetch product variants
  // TODO: Implement getVariants procedure in ecommerceRouter
  const variants: any[] = []; // Temporarily disabled until backend implements getVariants

  // Fetch reviews
  const { data: reviews } = trpc.ecommerce.reviews.getByProduct.useQuery(
    { productId: parseInt(productId!) },
    { enabled: !!productId }
  );

  // Add to cart mutation
  const addToCart = trpc.ecommerce.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (variants && variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    addToCart.mutate({
      productId: parseInt(productId!),
      priceAtAdd: product?.price || 0,
      variantId: selectedVariant || undefined,
      quantity,
    });
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold">LOADING...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">PRODUCT NOT FOUND</h1>
          <Button onClick={() => setLocation("/shop")} className="rounded-full border border-gray-200 font-bold">
            ← BACK TO BOPSHOP
          </Button>
        </div>
      </div>
    );
  }

  // Generate SEO metadata
  const seoData = useMemo(() => ({
    title: `${product.name} | BopShop`,
    description: product.description || `Buy ${product.name} on BopShop. ${product.type} for ${product.price}.`,
    image: product.images && product.images.length > 0 
      ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
      : undefined,
    url: `${window.location.origin}/shop/product/${productId}`,
    type: 'product' as const,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || undefined,
      image: product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : undefined,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: product.status === 'active' 
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `${window.location.origin}/shop/product/${productId}`
      },
      aggregateRating: reviews && reviews.length > 0 ? {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: reviews.length
      } : undefined
    }
  }), [product, productId, reviews, averageRating]);

  // @ts-ignore - BreadcrumbItem type inference issue
  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'BopShop', href: '/shop' },
    { title: product.type, href: `/shop?type=${product.type}` },
    { title: product.name, href: undefined }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...seoData} />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-6">
          <Button onClick={() => setLocation("/shop")}
            variant="outline"
            className="rounded-full border border-gray-200 font-semibold uppercase"
          >
            ← Back to BopShop
          </Button>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <div className="aspect-square bg-white border-4 border-black overflow-hidden">
                <img
                  src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square bg-white border-4 border-black flex items-center justify-center">
                <span className="text-9xl">$</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="rounded-full border border-gray-200 bg-white text-black font-semibold mb-4">
                {product.type}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-semibold mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {product.description}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-semibold font-mono text-black">
                  ${product.price}
                </span>
                {product.status === "active" ? (
                  <Badge className="rounded-full border border-gray-200 bg-white text-black font-semibold uppercase">
                    In Stock
                  </Badge>
                ) : (
                  <Badge className="rounded-full border border-gray-200 bg-black text-white font-semibold uppercase">
                    Sold Out
                  </Badge>
                )}
              </div>

              {/* Reviews Summary */}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-2xl ${
                          i < Math.round(averageRating)
                            ? "text-black"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-bold">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div className="border-t-4 border-black pt-6">
                <h3 className="font-semibold mb-4">Select Option:</h3>
                <div className="grid grid-cols-2 gap-4">
                  {variants.map((variant: any) => (
                    <Button key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      variant={selectedVariant === variant.id ? "default" : "outline"}
                      className="rounded-full border border-gray-200 font-semibold h-auto py-4"
                      disabled={variant.stock === 0}
                    >
                      <div className="text-left w-full">
                        <div>{variant.name}</div>
                        {variant.stock === 0 && (
                          <div className="text-xs">Out of Stock</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="border-t-4 border-black pt-6">
              <h3 className="font-semibold mb-4">Quantity:</h3>
              <div className="flex items-center gap-4">
                <Button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  className="rounded-full border border-gray-200 font-semibold text-2xl w-12 h-12"
                >
                  -
                </Button>
                <span className="text-2xl font-semibold font-mono w-12 text-center">
                  {quantity}
                </span>
                <Button onClick={() => setQuantity(quantity + 1)}
                  variant="outline"
                  className="rounded-full border border-gray-200 font-semibold text-2xl w-12 h-12"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t-4 border-black pt-6">
              <Button className="rounded-full w-full border border-gray-200 bg-black text-white hover:bg-white hover:text-black font-semibold text-lg py-6" onClick={handleAddToCart}
                disabled={product.status !== "active" || addToCart.isPending}
              >
                <span className="mr-2">$</span>
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <p className="text-center text-sm text-gray-600 mt-4 font-bold">
                90% OF YOUR PURCHASE GOES DIRECTLY TO THE ARTIST
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <div className="mt-16 border-t-4 border-black pt-12">
            <h2 className="text-3xl font-semibold mb-8">CUSTOMER REVIEWS</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 p-6 bg-white rounded-none">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < review.rating
                                ? "text-black"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-bold">{review.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
