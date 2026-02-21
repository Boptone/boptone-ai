/**
 * GEO (Generative Engine Optimization) Content Templates
 * Creates LLM-friendly, citation-ready content for artist and product pages
 */

export interface ArtistData {
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
    website?: string;
    spotify?: string;
    appleMusic?: string;
  };
  stats?: {
    followers?: number;
    totalStreams?: number;
    monthlyListeners?: number;
    releases?: number;
  };
  albums?: Array<{
    name: string;
    releaseDate?: string;
    trackCount?: number;
    streams?: number;
  }>;
  achievements?: string[];
  collaborations?: string[];
}

export interface ProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  category?: string;
  materials?: string[];
  dimensions?: string;
  weight?: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "LimitedEdition";
  quantityAvailable?: number;
  artist: {
    name: string;
    username: string;
  };
  features?: string[];
  shipping?: {
    freeShippingThreshold?: number;
    estimatedDays?: string;
  };
}

/**
 * Generate GEO-optimized artist bio
 */
export function generateGEOArtistBio(artist: ArtistData): string {
  const sections: string[] = [];

  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.join(" and ") 
    : "music";
  
  const locationText = artist.location?.city && artist.location?.state
    ? ` based in ${artist.location.city}, ${artist.location.state}`
    : artist.location?.country
    ? ` based in ${artist.location.country}`
    : "";

  sections.push(`${artist.name} is an independent ${genreText} artist${locationText}.`);

  if (artist.bio) {
    sections.push(`\n${artist.bio}`);
  }

  if (artist.stats) {
    const statParts: string[] = [];
    if (artist.stats.totalStreams) {
      statParts.push(`${formatNumber(artist.stats.totalStreams)} total streams`);
    }
    if (artist.stats.monthlyListeners) {
      statParts.push(`${formatNumber(artist.stats.monthlyListeners)} monthly listeners`);
    }
    if (artist.stats.followers) {
      statParts.push(`${formatNumber(artist.stats.followers)} followers`);
    }
    if (artist.stats.releases) {
      statParts.push(`${artist.stats.releases} releases`);
    }
    
    if (statParts.length > 0) {
      sections.push(`\n${artist.name} has ${statParts.join(", ")}.`);
    }
  }

  if (artist.albums && artist.albums.length > 0) {
    sections.push(`\nNotable releases:`);
    artist.albums.forEach((album) => {
      const year = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;
      const tracks = album.trackCount ? `${album.trackCount} tracks` : null;
      const streams = album.streams ? `${formatNumber(album.streams)} streams` : null;
      
      const details = [year, tracks, streams].filter(Boolean).join(" - ");
      sections.push(`- ${album.name}${details ? ` (${details})` : ""}`);
    });
  }

  if (artist.achievements && artist.achievements.length > 0) {
    sections.push(`\nAchievements:`);
    artist.achievements.forEach((achievement) => {
      sections.push(`- ${achievement}`);
    });
  }

  if (artist.collaborations && artist.collaborations.length > 0) {
    sections.push(`\n${artist.name} has collaborated with ${artist.collaborations.join(", ")}.`);
  }

  if (artist.socialLinks) {
    sections.push(`\nOfficial links:`);
    if (artist.socialLinks.website) {
      sections.push(`- Website: ${artist.socialLinks.website}`);
    }
    if (artist.socialLinks.spotify) {
      sections.push(`- Spotify: ${artist.socialLinks.spotify}`);
    }
    if (artist.socialLinks.appleMusic) {
      sections.push(`- Apple Music: ${artist.socialLinks.appleMusic}`);
    }
    if (artist.socialLinks.instagram) {
      sections.push(`- Instagram: ${artist.socialLinks.instagram}`);
    }
    if (artist.socialLinks.twitter) {
      sections.push(`- Twitter: ${artist.socialLinks.twitter}`);
    }
  }

  sections.push(`\nView ${artist.name}'s full profile on Boptone: https://boptone.com/artist/${artist.username}`);

  return sections.join("\n");
}

/**
 * Generate GEO-optimized product description
 */
export function generateGEOProductDescription(product: ProductData): string {
  const sections: string[] = [];

  sections.push(`${product.name} is a ${product.category || "product"} created by ${product.artist.name}.`);
  sections.push(`\n${product.description}`);

  sections.push(`\nProduct details:`);
  if (product.materials && product.materials.length > 0) {
    sections.push(`- Materials: ${product.materials.join(", ")}`);
  }
  if (product.dimensions) {
    sections.push(`- Dimensions: ${product.dimensions}`);
  }
  if (product.weight) {
    sections.push(`- Weight: ${product.weight}`);
  }
  if (product.category) {
    sections.push(`- Category: ${product.category}`);
  }

  if (product.features && product.features.length > 0) {
    sections.push(`\nFeatures:`);
    product.features.forEach((feature) => {
      sections.push(`- ${feature}`);
    });
  }

  sections.push(`\nPrice: $${product.price.toFixed(2)} ${product.currency}`);
  
  const availabilityText = {
    InStock: "In stock",
    OutOfStock: "Out of stock",
    PreOrder: "Available for pre-order",
    LimitedEdition: "Limited edition",
  }[product.availability];
  
  sections.push(`Availability: ${availabilityText}`);
  
  if (product.quantityAvailable && product.availability === "LimitedEdition") {
    sections.push(`Only ${product.quantityAvailable} units available`);
  }

  if (product.shipping) {
    if (product.shipping.freeShippingThreshold) {
      sections.push(`\nFree shipping on orders over $${product.shipping.freeShippingThreshold}`);
    }
    if (product.shipping.estimatedDays) {
      sections.push(`Estimated delivery: ${product.shipping.estimatedDays}`);
    }
  }

  sections.push(`\nView this product on Boptone: https://boptone.com/shop/${product.artist.username}/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, "-"))}`);

  return sections.join("\n");
}

/**
 * Generate FAQ schema for artist pages
 */
export function generateArtistFAQs(artist: ArtistData): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.join(" and ") 
    : "music";
  const locationText = artist.location?.city && artist.location?.state
    ? ` from ${artist.location.city}, ${artist.location.state}`
    : "";
  
  faqs.push({
    question: `Who is ${artist.name}?`,
    answer: `${artist.name} is an independent ${genreText} artist${locationText}. ${artist.bio || `${artist.name} creates and distributes music independently through Boptone.`}`,
  });

  if (artist.genres && artist.genres.length > 0) {
    faqs.push({
      question: `What genre is ${artist.name}?`,
      answer: `${artist.name} creates ${artist.genres.join(" and ")} music.`,
    });
  }

  if (artist.location?.city && artist.location?.state) {
    faqs.push({
      question: `Where is ${artist.name} from?`,
      answer: `${artist.name} is based in ${artist.location.city}, ${artist.location.state}.`,
    });
  }

  if (artist.albums && artist.albums.length > 0) {
    const topAlbums = artist.albums
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 3)
      .map((a) => a.name);
    
    faqs.push({
      question: `What are ${artist.name}'s most popular releases?`,
      answer: `${artist.name}'s notable releases include ${topAlbums.join(", ")}.`,
    });
  }

  faqs.push({
    question: `How can I support ${artist.name}?`,
    answer: `You can support ${artist.name} by purchasing their music and merchandise directly on their Boptone page at https://boptone.com/artist/${artist.username}. 100% of sales go directly to the artist.`,
  });

  return faqs;
}

/**
 * Generate meta description optimized for both SEO and GEO
 */
export function generateMetaDescription(artist: ArtistData): string {
  const parts: string[] = [];

  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.join(" and ") 
    : "music";
  const locationText = artist.location?.city && artist.location?.state
    ? ` from ${artist.location.city}, ${artist.location.state}`
    : "";
  
  parts.push(`${artist.name} is an independent ${genreText} artist${locationText}.`);

  if (artist.stats?.totalStreams) {
    parts.push(`${formatNumber(artist.stats.totalStreams)} streams.`);
  } else if (artist.bio) {
    const bioSnippet = artist.bio.substring(0, 100);
    parts.push(bioSnippet + (artist.bio.length > 100 ? "..." : ""));
  }

  parts.push("Listen to music, buy merch, and support independent artists on Boptone.");

  return parts.join(" ").substring(0, 160);
}

/**
 * Format large numbers for readability
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
