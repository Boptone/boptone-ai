/**
 * Google Review Schema Generator
 * 
 * Generates JSON-LD structured data for product reviews to appear in Google search results.
 * Follows schema.org/Product and schema.org/Review specifications.
 */

interface ReviewPhoto {
  photoUrl: string;
  altText: string;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string;
  reviewerName: string | null;
  verifiedPurchase: boolean;
  createdAt: Date;
  photos?: ReviewPhoto[];
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  sku: string | null;
}

/**
 * Generate Google Review schema for a product
 * 
 * Creates Product schema with aggregateRating and individual reviews
 */
export function generateProductReviewSchema(
  product: Product,
  stats: ReviewStats,
  reviews: Review[]
): object {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.imageUrl || undefined,
    sku: product.sku || undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: stats.totalReviews > 0 ? {
      "@type": "AggregateRating",
      ratingValue: stats.averageRating.toString(),
      reviewCount: stats.totalReviews.toString(),
      bestRating: "5",
      worstRating: "1",
    } : undefined,
    review: reviews.map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.reviewerName || "Anonymous",
      },
      datePublished: review.createdAt.toISOString(),
      reviewBody: review.content,
      name: review.title || undefined,
      // Add verified purchase badge
      ...(review.verifiedPurchase && {
        additionalType: "https://schema.org/VerifiedBuyer",
      }),
      // Add review photos
      ...(review.photos && review.photos.length > 0 && {
        image: review.photos.map((photo) => ({
          "@type": "ImageObject",
          url: photo.photoUrl,
          description: photo.altText,
        })),
      }),
    })),
  };

  return schema;
}

/**
 * Generate minimal review schema for products without reviews
 */
export function generateMinimalProductSchema(product: Product): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.imageUrl || undefined,
    sku: product.sku || undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

/**
 * Generate review snippet for individual review pages
 */
export function generateReviewSnippetSchema(
  review: Review,
  product: Product
): object {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: product.name,
      image: product.imageUrl || undefined,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: review.reviewerName || "Anonymous",
    },
    datePublished: review.createdAt.toISOString(),
    reviewBody: review.content,
    name: review.title || undefined,
    ...(review.verifiedPurchase && {
      additionalType: "https://schema.org/VerifiedBuyer",
    }),
    ...(review.photos && review.photos.length > 0 && {
      image: review.photos.map((photo) => ({
        "@type": "ImageObject",
        url: photo.photoUrl,
        description: photo.altText,
      })),
    }),
  };
}
