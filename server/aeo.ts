/**
 * AEO (Answer Engine Optimization) Utilities
 * Generates AI-citation-ready content for ChatGPT, Perplexity, Google AI Overviews
 * 
 * Core Principle: Every answer is optimized for LLM extraction first, humans second
 */

export interface ArtistAEOData {
  id: number;
  name: string;
  username: string;
  bio?: string;
  genres?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  stats?: {
    totalStreams?: number;
    monthlyListeners?: number;
    followers?: number;
    releases?: number;
  };
  albums?: Array<{
    id: number;
    name: string;
    releaseDate?: string;
    trackCount?: number;
    streams?: number;
  }>;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    appleMusic?: string;
    website?: string;
  };
  topGenre?: string;
  topAlbum?: {
    name: string;
    year: number;
    streams: number;
  };
  verified?: boolean;
  updatedAt: Date;
}

export interface ProductAEOData {
  id: number;
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
  rating?: {
    value: number;
    count: number;
  };
}

export interface DirectAnswer {
  question: string;
  answer: string;
  wordCount: number;
  confidence: number;
  lastVerified: Date;
}

export interface PredictedQuery {
  question: string;
  answer: string;
  priority: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SummaryBlock {
  oneSentenceSummary: string;
  keyTakeaways: string[];
  relatedLinks: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Generate direct answer layer (40-60 words)
 * This is the PRIMARY answer that LLMs will cite
 */
export function generateDirectAnswer(artist: ArtistAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core identity
  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.slice(0, 2).join(" and ") 
    : "music";
  
  const locationText = artist.location?.city && artist.location?.state
    ? ` based in ${artist.location.city}, ${artist.location.state}`
    : artist.location?.country
    ? ` based in ${artist.location.country}`
    : "";
  
  parts.push(`${artist.name} is an independent ${genreText} artist${locationText}`);
  
  // Quantifiable metrics
  if (artist.stats?.totalStreams && artist.stats?.releases) {
    parts.push(` with ${formatNumber(artist.stats.totalStreams)} streams across ${artist.stats.releases} releases`);
  } else if (artist.stats?.totalStreams) {
    parts.push(` with ${formatNumber(artist.stats.totalStreams)} streams`);
  } else if (artist.stats?.releases) {
    parts.push(` with ${artist.stats.releases} releases`);
  }
  
  // Defining characteristic (top album)
  if (artist.topAlbum) {
    parts.push(`. Known for ${artist.topGenre || genreText} music and ${artist.topAlbum.name} (${artist.topAlbum.year})`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `Who is ${artist.name}?`,
    answer,
    wordCount,
    confidence: calculateConfidenceScore(artist),
    lastVerified: artist.updatedAt
  };
}

/**
 * Generate direct answer for products
 */
export function generateProductDirectAnswer(product: ProductAEOData): DirectAnswer {
  const parts: string[] = [];
  
  parts.push(`${product.name} is a ${product.category || "product"} created by ${product.artist.name}`);
  
  // Price and availability
  parts.push(`, priced at $${product.price.toFixed(2)} ${product.currency}`);
  
  // Key features
  if (product.materials && product.materials.length > 0) {
    parts.push(`. Made from ${product.materials.slice(0, 2).join(" and ")}`);
  }
  
  // Availability
  const availabilityText = {
    InStock: "in stock",
    OutOfStock: "currently out of stock",
    PreOrder: "available for pre-order",
    LimitedEdition: "limited edition"
  }[product.availability];
  
  parts.push(` and ${availabilityText}`);
  
  // Rating if available
  if (product.rating) {
    parts.push(` with a ${product.rating.value.toFixed(1)}/5.0 rating from ${product.rating.count} reviews`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is ${product.name}?`,
    answer,
    wordCount,
    confidence: 0.95, // Products have high confidence if data is complete
    lastVerified: new Date()
  };
}

/**
 * Calculate confidence score for answer quality
 * Range: 0.5 (low confidence) to 1.0 (high confidence)
 */
export function calculateConfidenceScore(artist: ArtistAEOData): number {
  let score = 1.0;
  
  // Reduce confidence if data is stale
  const daysSinceUpdate = Math.floor(
    (new Date().getTime() - artist.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceUpdate > 30) score -= 0.1;
  if (daysSinceUpdate > 90) score -= 0.2;
  if (daysSinceUpdate > 180) score -= 0.3;
  
  // Reduce confidence if critical fields are missing
  if (!artist.bio) score -= 0.05;
  if (!artist.genres || artist.genres.length === 0) score -= 0.1;
  if (!artist.location) score -= 0.05;
  if (!artist.stats?.totalStreams) score -= 0.1;
  
  // Increase confidence if artist-verified
  if (artist.verified) score += 0.05;
  
  // Increase confidence if has albums
  if (artist.albums && artist.albums.length > 0) score += 0.05;
  
  return Math.max(0.5, Math.min(1.0, score));
}

/**
 * Generate predicted follow-up queries (5-7 questions)
 */
export function generatePredictedQueries(artist: ArtistAEOData): PredictedQuery[] {
  const queries: PredictedQuery[] = [];
  
  // Genre query (priority 1)
  if (artist.genres && artist.genres.length > 0) {
    queries.push({
      question: `What genre is ${artist.name}?`,
      answer: `${artist.name} creates ${artist.genres.join(" and ")} music.`,
      priority: 1
    });
  }
  
  // Location query (priority 2)
  if (artist.location?.city && artist.location?.state) {
    queries.push({
      question: `Where is ${artist.name} from?`,
      answer: `${artist.name} is based in ${artist.location.city}, ${artist.location.state}.`,
      priority: 2
    });
  } else if (artist.location?.country) {
    queries.push({
      question: `Where is ${artist.name} from?`,
      answer: `${artist.name} is based in ${artist.location.country}.`,
      priority: 2
    });
  }
  
  // Popular releases query (priority 3)
  if (artist.albums && artist.albums.length > 0) {
    const topAlbums = artist.albums
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 3)
      .map(a => a.name);
    
    queries.push({
      question: `What are ${artist.name}'s most popular releases?`,
      answer: `${artist.name}'s notable releases include ${topAlbums.join(", ")}.`,
      priority: 3
    });
  }
  
  // Listening platforms query (priority 4)
  queries.push({
    question: `Where can I listen to ${artist.name}?`,
    answer: `${artist.name} is available on BopAudio (Boptone's streaming platform), Spotify, Apple Music, and other major streaming services.`,
    priority: 4
  });
  
  // Support query (priority 5)
  queries.push({
    question: `How can I support ${artist.name}?`,
    answer: `Purchase music and merch directly on ${artist.name}'s BopShop at boptone.com/shop/${artist.username}. 100% of sales go directly to the artist.`,
    priority: 5
  });
  
  // Stats query (priority 6)
  if (artist.stats?.totalStreams) {
    queries.push({
      question: `How many streams does ${artist.name} have?`,
      answer: `${artist.name} has ${formatNumber(artist.stats.totalStreams)} total streams${artist.stats.monthlyListeners ? ` and ${formatNumber(artist.stats.monthlyListeners)} monthly listeners` : ""}.`,
      priority: 6
    });
  }
  
  // Social links query (priority 7)
  if (artist.socialLinks && Object.keys(artist.socialLinks).length > 0) {
    const platforms = [];
    if (artist.socialLinks.instagram) platforms.push("Instagram");
    if (artist.socialLinks.twitter) platforms.push("Twitter");
    if (artist.socialLinks.spotify) platforms.push("Spotify");
    
    if (platforms.length > 0) {
      queries.push({
        question: `Where can I follow ${artist.name} on social media?`,
        answer: `${artist.name} is active on ${platforms.join(", ")}. Visit their Boptone profile at boptone.com/artist/${artist.username} for all links.`,
        priority: 7
      });
    }
  }
  
  return queries.sort((a, b) => a.priority - b.priority);
}

/**
 * Generate FAQ items for FAQPage schema
 */
export function generateFAQs(artist: ArtistAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.join(" and ") 
    : "music";
  const locationText = artist.location?.city && artist.location?.state
    ? ` from ${artist.location.city}, ${artist.location.state}`
    : "";
  
  // Who is [Artist]?
  faqs.push({
    question: `Who is ${artist.name}?`,
    answer: generateDirectAnswer(artist).answer
  });
  
  // What genre?
  if (artist.genres && artist.genres.length > 0) {
    faqs.push({
      question: `What genre is ${artist.name}?`,
      answer: `${artist.name} creates ${artist.genres.join(" and ")} music.`
    });
  }
  
  // Where from?
  if (artist.location?.city && artist.location?.state) {
    faqs.push({
      question: `Where is ${artist.name} from?`,
      answer: `${artist.name} is based in ${artist.location.city}, ${artist.location.state}.`
    });
  }
  
  // Popular releases?
  if (artist.albums && artist.albums.length > 0) {
    const topAlbums = artist.albums
      .sort((a, b) => (b.streams || 0) - (a.streams || 0))
      .slice(0, 3)
      .map(a => a.name);
    
    faqs.push({
      question: `What are ${artist.name}'s most popular releases?`,
      answer: `${artist.name}'s notable releases include ${topAlbums.join(", ")}.`
    });
  }
  
  // How to support?
  faqs.push({
    question: `How can I support ${artist.name}?`,
    answer: `You can support ${artist.name} by purchasing their music and merchandise directly on their Boptone page at boptone.com/artist/${artist.username}. 100% of sales go directly to the artist.`
  });
  
  return faqs;
}

/**
 * Generate product FAQs
 */
export function generateProductFAQs(product: ProductAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is [Product]?
  faqs.push({
    question: `What is ${product.name}?`,
    answer: generateProductDirectAnswer(product).answer
  });
  
  // How much?
  faqs.push({
    question: `How much does ${product.name} cost?`,
    answer: `${product.name} costs $${product.price.toFixed(2)} ${product.currency}.`
  });
  
  // Materials?
  if (product.materials && product.materials.length > 0) {
    faqs.push({
      question: `What materials is ${product.name} made from?`,
      answer: `${product.name} is made from ${product.materials.join(", ")}.`
    });
  }
  
  // Where to buy?
  faqs.push({
    question: `Where can I buy ${product.name}?`,
    answer: `${product.name} is available on ${product.artist.name}'s BopShop at boptone.com/shop/${product.artist.username}.`
  });
  
  // Features?
  if (product.features && product.features.length > 0) {
    faqs.push({
      question: `What are the features of ${product.name}?`,
      answer: `${product.name} features ${product.features.join(", ")}.`
    });
  }
  
  return faqs;
}

/**
 * Generate summary block for page end
 */
export function generateSummaryBlock(artist: ArtistAEOData): SummaryBlock {
  const genreText = artist.genres && artist.genres.length > 0 
    ? artist.genres.slice(0, 2).join(" and ") 
    : "music";
  
  // One-sentence summary
  const oneSentenceSummary = artist.stats?.totalStreams && artist.stats?.releases
    ? `${artist.name} is an independent ${genreText} artist with ${formatNumber(artist.stats.totalStreams)} streams and ${artist.stats.releases} releases available on Boptone.`
    : `${artist.name} is an independent ${genreText} artist available on Boptone.`;
  
  // Key takeaways (3 facts)
  const keyTakeaways: string[] = [];
  
  if (artist.topGenre) {
    keyTakeaways.push(`${artist.name} specializes in ${artist.topGenre} music`);
  }
  
  if (artist.topAlbum) {
    keyTakeaways.push(`Top release: ${artist.topAlbum.name} with ${formatNumber(artist.topAlbum.streams)} streams`);
  } else if (artist.albums && artist.albums.length > 0) {
    const topAlbum = artist.albums.sort((a, b) => (b.streams || 0) - (a.streams || 0))[0];
    keyTakeaways.push(`Notable release: ${topAlbum.name}`);
  }
  
  keyTakeaways.push(`Available for direct purchase on BopShop at boptone.com/shop/${artist.username}`);
  
  // Related links (3 links)
  const relatedLinks: Array<{ title: string; url: string }> = [];
  
  if (artist.topGenre) {
    relatedLinks.push({
      title: `More ${artist.topGenre} Artists`,
      url: `/genres/${artist.topGenre.toLowerCase().replace(/\s+/g, "-")}`
    });
  }
  
  if (artist.location?.city) {
    relatedLinks.push({
      title: `Artists from ${artist.location.city}`,
      url: `/locations/${artist.location.city.toLowerCase().replace(/\s+/g, "-")}`
    });
  }
  
  relatedLinks.push({
    title: `Shop ${artist.name}'s Merch`,
    url: `/shop/${artist.username}`
  });
  
  return {
    oneSentenceSummary,
    keyTakeaways,
    relatedLinks
  };
}

/**
 * Generate product summary block
 */
export function generateProductSummaryBlock(product: ProductAEOData): SummaryBlock {
  const oneSentenceSummary = `${product.name} is a ${product.category || "product"} by ${product.artist.name}, priced at $${product.price.toFixed(2)} and available on BopShop.`;
  
  const keyTakeaways: string[] = [];
  
  if (product.materials && product.materials.length > 0) {
    keyTakeaways.push(`Made from ${product.materials.join(", ")}`);
  }
  
  if (product.rating) {
    keyTakeaways.push(`Rated ${product.rating.value.toFixed(1)}/5.0 by ${product.rating.count} customers`);
  }
  
  const availabilityText = {
    InStock: "In stock and ready to ship",
    OutOfStock: "Currently out of stock",
    PreOrder: "Available for pre-order",
    LimitedEdition: "Limited edition - order soon"
  }[product.availability];
  
  keyTakeaways.push(availabilityText);
  
  const relatedLinks = [
    {
      title: `More ${product.category || "Products"} by ${product.artist.name}`,
      url: `/shop/${product.artist.username}`
    },
    {
      title: `${product.artist.name}'s Music`,
      url: `/artist/${product.artist.username}`
    },
    {
      title: `All ${product.category || "Products"}`,
      url: `/shop/category/${product.category?.toLowerCase().replace(/\s+/g, "-") || "all"}`
    }
  ];
  
  return {
    oneSentenceSummary,
    keyTakeaways,
    relatedLinks
  };
}

/**
 * Format large numbers for readability (1.2M, 45.3K)
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

/**
 * Generate question-oriented H2 headers from natural language
 */
export function generateQuestionHeader(topic: string, entityName: string): string {
  const templates: Record<string, string> = {
    genre: `What genre is ${entityName}?`,
    location: `Where is ${entityName} from?`,
    releases: `What are ${entityName}'s most popular releases?`,
    support: `How can I support ${entityName}?`,
    listen: `Where can I listen to ${entityName}?`,
    stats: `How many streams does ${entityName} have?`,
    social: `Where can I follow ${entityName} on social media?`,
    bio: `Who is ${entityName}?`,
    price: `How much does ${entityName} cost?`,
    materials: `What materials is ${entityName} made from?`,
    features: `What are the features of ${entityName}?`,
    buy: `Where can I buy ${entityName}?`
  };
  
  return templates[topic] || `${topic}`;
}
