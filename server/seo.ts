/**
 * SEO (Search Engine Optimization) Utilities
 * Generates structured data, meta tags, and SEO-optimized content
 */

export interface ArtistSEO {
  name: string;
  username: string;
  bio?: string;
  genres?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    appleMusic?: string;
    website?: string;
  };
  avatarUrl?: string;
  albums?: Array<{
    name: string;
    releaseDate?: string;
    trackCount?: number;
  }>;
}

export interface ProductSEO {
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "LimitedEdition";
  imageUrl: string;
  artist: {
    name: string;
    username: string;
  };
  sku?: string;
  category?: string;
  rating?: {
    value: number;
    count: number;
  };
}

export interface StoreSEO {
  name: string;
  description: string;
  artist: {
    name: string;
    username: string;
  };
  productCount?: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  if (process.env.VITE_FRONTEND_URL) {
    return process.env.VITE_FRONTEND_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://boptone.com";
  }
  return "http://localhost:3000";
}

/**
 * Generate Artist JSON-LD for artist pages
 */
export function generateArtistStructuredData(artist: ArtistSEO, baseUrl: string) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "url": `${baseUrl}/artist/${artist.username}`,
  };

  if (artist.bio) {
    structuredData.description = artist.bio;
  }

  if (artist.genres && artist.genres.length > 0) {
    structuredData.genre = artist.genres;
  }

  if (artist.location) {
    const locationParts = [];
    if (artist.location.city) locationParts.push(artist.location.city);
    if (artist.location.state) locationParts.push(artist.location.state);
    if (artist.location.country) locationParts.push(artist.location.country);
    if (locationParts.length > 0) {
      structuredData.address = {
        "@type": "PostalAddress",
        "addressLocality": artist.location.city,
        "addressRegion": artist.location.state,
        "addressCountry": artist.location.country,
      };
    }
  }

  if (artist.avatarUrl) {
    structuredData.image = artist.avatarUrl;
  }

  const sameAs = [];
  if (artist.socialLinks?.instagram) sameAs.push(artist.socialLinks.instagram);
  if (artist.socialLinks?.twitter) sameAs.push(artist.socialLinks.twitter);
  if (artist.socialLinks?.spotify) sameAs.push(artist.socialLinks.spotify);
  if (artist.socialLinks?.appleMusic) sameAs.push(artist.socialLinks.appleMusic);
  if (artist.socialLinks?.website) sameAs.push(artist.socialLinks.website);
  if (sameAs.length > 0) {
    structuredData.sameAs = sameAs;
  }

  if (artist.albums && artist.albums.length > 0) {
    structuredData.album = artist.albums.map((album) => ({
      "@type": "MusicAlbum",
      "name": album.name,
      ...(album.releaseDate && { "datePublished": album.releaseDate }),
      ...(album.trackCount && { "numTracks": album.trackCount }),
    }));
  }

  return structuredData;
}

/**
 * Generate Product JSON-LD for product pages
 */
export function generateProductStructuredData(product: ProductSEO, baseUrl: string) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl,
    "brand": {
      "@type": "Brand",
      "name": product.artist.name,
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/shop/${product.artist.username}/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, "-"))}`,
      "priceCurrency": product.currency,
      "price": product.price.toFixed(2),
      "availability": `https://schema.org/${product.availability}`,
      "seller": {
        "@type": "Organization",
        "name": product.artist.name,
      },
    },
  };

  if (product.sku) {
    structuredData.sku = product.sku;
  }

  if (product.category) {
    structuredData.category = product.category;
  }

  if (product.rating) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating.value.toFixed(1),
      "reviewCount": product.rating.count.toString(),
    };
  }

  return structuredData;
}

/**
 * Generate Store JSON-LD for shop pages
 */
export function generateStoreStructuredData(store: StoreSEO, baseUrl: string) {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": store.name,
    "description": store.description,
    "url": `${baseUrl}/shop/${store.artist.username}`,
  };

  if (store.productCount) {
    structuredData.numberOfItems = store.productCount;
  }

  return structuredData;
}

/**
 * Generate Breadcrumb JSON-LD
 */
export function generateBreadcrumbStructuredData(items: BreadcrumbItem[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate meta tags for artist pages
 */
export function generateArtistMetaTags(artist: ArtistSEO, baseUrl: string) {
  const title = `${artist.name} - Independent Artist on Boptone`;
  const description = artist.bio
    ? `${artist.bio.substring(0, 155)}...`
    : `Listen to ${artist.name}'s music, buy exclusive merch, and support independent artists on Boptone.`;
  const url = `${baseUrl}/artist/${artist.username}`;
  const image = artist.avatarUrl || `${baseUrl}/default-artist-og.jpg`;

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      image,
    },
    twitter: {
      card: "summary_large_image",
      url,
      title,
      description,
      image,
    },
  };
}

/**
 * Generate meta tags for product pages
 */
export function generateProductMetaTags(product: ProductSEO, baseUrl: string) {
  const title = `${product.name} by ${product.artist.name} | Boptone`;
  const description = `${product.description.substring(0, 155)}... $${product.price.toFixed(2)}`;
  const url = `${baseUrl}/shop/${product.artist.username}/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, "-"))}`;
  const image = product.imageUrl;

  return {
    title,
    description,
    canonical: url,
    openGraph: {
      type: "product",
      url,
      title,
      description,
      image,
      productPrice: product.price.toFixed(2),
      productCurrency: product.currency,
    },
    twitter: {
      card: "summary_large_image",
      url,
      title,
      description,
      image,
    },
  };
}
