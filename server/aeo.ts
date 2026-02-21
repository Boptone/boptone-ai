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


// ============================================================================
// BOPAUDIO CONTENT AEO
// ============================================================================

export interface TrackAEOData {
  id: number;
  name: string;
  artist: {
    name: string;
    username: string;
  };
  album?: {
    name: string;
    releaseDate: string;
  };
  duration: number; // in seconds
  genre?: string;
  releaseDate: string;
  streams?: number;
  lyrics?: string;
  isExplicit: boolean;
  isrc?: string; // International Standard Recording Code
}

export interface AlbumAEOData {
  id: number;
  name: string;
  artist: {
    name: string;
    username: string;
  };
  releaseDate: string;
  trackCount: number;
  totalDuration: number; // in seconds
  genres?: string[];
  streams?: number;
  tracks: Array<{
    id: number;
    name: string;
    duration: number;
    trackNumber: number;
  }>;
  coverArt?: string;
  label?: string;
  upc?: string; // Universal Product Code
}

export interface PlaylistAEOData {
  id: number;
  name: string;
  description?: string;
  curator: {
    name: string;
    username: string;
  };
  trackCount: number;
  totalDuration: number;
  genres?: string[];
  followers?: number;
  isPublic: boolean;
  lastUpdated: Date;
  tracks: Array<{
    id: number;
    name: string;
    artist: string;
  }>;
}

/**
 * Generate direct answer for music tracks
 */
export function generateTrackDirectAnswer(track: TrackAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core identity
  parts.push(`"${track.name}" is a ${track.genre || "music"} track by ${track.artist.name}`);
  
  // Album context
  if (track.album) {
    const year = new Date(track.album.releaseDate).getFullYear();
    parts.push(` from the album ${track.album.name} (${year})`);
  } else {
    const year = new Date(track.releaseDate).getFullYear();
    parts.push(`, released in ${year}`);
  }
  
  // Duration and stats
  const durationMin = Math.floor(track.duration / 60);
  const durationSec = track.duration % 60;
  parts.push(`. The track runs ${durationMin}:${durationSec.toString().padStart(2, '0')}`);
  
  if (track.streams) {
    parts.push(` and has ${formatNumber(track.streams)} streams on BopAudio`);
  }
  
  // Explicit content warning
  if (track.isExplicit) {
    parts.push(". Contains explicit content");
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is "${track.name}" by ${track.artist.name}?`,
    answer,
    wordCount,
    confidence: 0.95,
    lastVerified: new Date()
  };
}

/**
 * Generate direct answer for albums
 */
export function generateAlbumDirectAnswer(album: AlbumAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core identity
  const year = new Date(album.releaseDate).getFullYear();
  const genreText = album.genres && album.genres.length > 0 
    ? album.genres.slice(0, 2).join(" and ")
    : "music";
  
  parts.push(`${album.name} is a ${genreText} album by ${album.artist.name}, released in ${year}`);
  
  // Track count and duration
  const totalMin = Math.floor(album.totalDuration / 60);
  parts.push(`. The album features ${album.trackCount} tracks with a total runtime of ${totalMin} minutes`);
  
  // Streaming stats
  if (album.streams) {
    parts.push(` and has accumulated ${formatNumber(album.streams)} streams on BopAudio`);
  }
  
  // Label info
  if (album.label) {
    parts.push(`. Released under ${album.label}`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is ${album.name} by ${album.artist.name}?`,
    answer,
    wordCount,
    confidence: 0.95,
    lastVerified: new Date()
  };
}

/**
 * Generate direct answer for playlists
 */
export function generatePlaylistDirectAnswer(playlist: PlaylistAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core identity
  const genreText = playlist.genres && playlist.genres.length > 0
    ? ` featuring ${playlist.genres.slice(0, 2).join(" and ")} music`
    : "";
  
  parts.push(`${playlist.name} is a ${playlist.isPublic ? "public" : "private"} playlist curated by ${playlist.curator.name}${genreText}`);
  
  // Track count and duration
  const totalMin = Math.floor(playlist.totalDuration / 60);
  parts.push(`. The playlist contains ${playlist.trackCount} tracks with a total runtime of ${totalMin} minutes`);
  
  // Followers
  if (playlist.followers) {
    parts.push(` and has ${formatNumber(playlist.followers)} followers on BopAudio`);
  }
  
  // Last updated
  const daysSinceUpdate = Math.floor(
    (new Date().getTime() - playlist.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceUpdate < 7) {
    parts.push(`. Last updated ${daysSinceUpdate} days ago`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is the ${playlist.name} playlist?`,
    answer,
    wordCount,
    confidence: 0.90,
    lastVerified: playlist.lastUpdated
  };
}

/**
 * Generate FAQs for music tracks
 */
export function generateTrackFAQs(track: TrackAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is this track?
  faqs.push({
    question: `What is "${track.name}" by ${track.artist.name}?`,
    answer: generateTrackDirectAnswer(track).answer
  });
  
  // Genre
  if (track.genre) {
    faqs.push({
      question: `What genre is "${track.name}"?`,
      answer: `"${track.name}" is a ${track.genre} track.`
    });
  }
  
  // Duration
  const durationMin = Math.floor(track.duration / 60);
  const durationSec = track.duration % 60;
  faqs.push({
    question: `How long is "${track.name}"?`,
    answer: `"${track.name}" has a runtime of ${durationMin}:${durationSec.toString().padStart(2, '0')}.`
  });
  
  // Where to listen
  faqs.push({
    question: `Where can I listen to "${track.name}"?`,
    answer: `You can stream "${track.name}" on BopAudio at boptone.com/audio/${track.artist.username}/${encodeURIComponent(track.name.toLowerCase().replace(/\s+/g, "-"))}.`
  });
  
  // Support artist
  faqs.push({
    question: `How can I support ${track.artist.name}?`,
    answer: `Stream "${track.name}" on BopAudio where ${track.artist.name} earns 90% of streaming revenue, or purchase their music and merch on BopShop.`
  });
  
  return faqs;
}

/**
 * Generate FAQs for albums
 */
export function generateAlbumFAQs(album: AlbumAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is this album?
  faqs.push({
    question: `What is ${album.name} by ${album.artist.name}?`,
    answer: generateAlbumDirectAnswer(album).answer
  });
  
  // How many tracks?
  faqs.push({
    question: `How many tracks are on ${album.name}?`,
    answer: `${album.name} contains ${album.trackCount} tracks.`
  });
  
  // When was it released?
  const releaseDate = new Date(album.releaseDate);
  faqs.push({
    question: `When was ${album.name} released?`,
    answer: `${album.name} was released on ${releaseDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
  });
  
  // Track listing
  if (album.tracks && album.tracks.length > 0) {
    const trackList = album.tracks
      .sort((a, b) => a.trackNumber - b.trackNumber)
      .slice(0, 5)
      .map(t => t.name)
      .join(", ");
    
    faqs.push({
      question: `What are the tracks on ${album.name}?`,
      answer: `${album.name} includes tracks such as ${trackList}${album.tracks.length > 5 ? ", and more" : ""}.`
    });
  }
  
  // Where to listen
  faqs.push({
    question: `Where can I listen to ${album.name}?`,
    answer: `You can stream ${album.name} on BopAudio at boptone.com/audio/${album.artist.username}/${encodeURIComponent(album.name.toLowerCase().replace(/\s+/g, "-"))}.`
  });
  
  return faqs;
}

/**
 * Generate FAQs for playlists
 */
export function generatePlaylistFAQs(playlist: PlaylistAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is this playlist?
  faqs.push({
    question: `What is the ${playlist.name} playlist?`,
    answer: generatePlaylistDirectAnswer(playlist).answer
  });
  
  // Who curated it?
  faqs.push({
    question: `Who created the ${playlist.name} playlist?`,
    answer: `The ${playlist.name} playlist was curated by ${playlist.curator.name}.`
  });
  
  // How many tracks?
  faqs.push({
    question: `How many songs are in ${playlist.name}?`,
    answer: `${playlist.name} contains ${playlist.trackCount} tracks.`
  });
  
  // Sample tracks
  if (playlist.tracks && playlist.tracks.length > 0) {
    const sampleTracks = playlist.tracks
      .slice(0, 3)
      .map(t => `"${t.name}" by ${t.artist}`)
      .join(", ");
    
    faqs.push({
      question: `What songs are in ${playlist.name}?`,
      answer: `${playlist.name} features tracks like ${sampleTracks}, and ${playlist.trackCount - 3} more.`
    });
  }
  
  // Where to listen
  faqs.push({
    question: `Where can I listen to ${playlist.name}?`,
    answer: `You can stream ${playlist.name} on BopAudio at boptone.com/playlists/${encodeURIComponent(playlist.name.toLowerCase().replace(/\s+/g, "-"))}.`
  });
  
  return faqs;
}

// ============================================================================
// GENRE PAGES AEO
// ============================================================================

export interface GenreAEOData {
  name: string;
  description: string;
  characteristics: string[];
  topArtists: Array<{
    name: string;
    username: string;
    streams: number;
  }>;
  totalArtists: number;
  totalTracks: number;
  relatedGenres: string[];
}

/**
 * Generate direct answer for genre pages
 */
export function generateGenreDirectAnswer(genre: GenreAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core definition
  parts.push(`${genre.name} is a music genre ${genre.description}`);
  
  // Characteristics
  if (genre.characteristics && genre.characteristics.length > 0) {
    parts.push(`, characterized by ${genre.characteristics.slice(0, 2).join(" and ")}`);
  }
  
  // Platform stats
  parts.push(`. On Boptone, ${genre.name} features ${genre.totalArtists} independent artists with ${formatNumber(genre.totalTracks)} tracks available on BopAudio`);
  
  // Top artists
  if (genre.topArtists && genre.topArtists.length > 0) {
    const topArtistNames = genre.topArtists.slice(0, 2).map(a => a.name).join(" and ");
    parts.push(`. Top ${genre.name} artists include ${topArtistNames}`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is ${genre.name} music?`,
    answer,
    wordCount,
    confidence: 0.92,
    lastVerified: new Date()
  };
}

/**
 * Generate FAQs for genre pages
 */
export function generateGenreFAQs(genre: GenreAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is this genre?
  faqs.push({
    question: `What is ${genre.name} music?`,
    answer: generateGenreDirectAnswer(genre).answer
  });
  
  // Who are top artists?
  if (genre.topArtists && genre.topArtists.length > 0) {
    const topArtistsList = genre.topArtists.slice(0, 5).map(a => a.name).join(", ");
    faqs.push({
      question: `Who are the top ${genre.name} artists on Boptone?`,
      answer: `Top ${genre.name} artists on Boptone include ${topArtistsList}.`
    });
  }
  
  // Related genres
  if (genre.relatedGenres && genre.relatedGenres.length > 0) {
    faqs.push({
      question: `What genres are similar to ${genre.name}?`,
      answer: `Genres similar to ${genre.name} include ${genre.relatedGenres.slice(0, 3).join(", ")}.`
    });
  }
  
  // Where to discover
  faqs.push({
    question: `Where can I discover ${genre.name} music?`,
    answer: `Discover ${genre.name} music on BopAudio at boptone.com/genres/${genre.name.toLowerCase().replace(/\s+/g, "-")}, featuring ${genre.totalArtists} independent artists.`
  });
  
  return faqs;
}

// ============================================================================
// LOCATION PAGES AEO
// ============================================================================

export interface LocationAEOData {
  city: string;
  state: string;
  country: string;
  description: string;
  musicScene: string;
  topArtists: Array<{
    name: string;
    username: string;
    genres: string[];
    streams: number;
  }>;
  totalArtists: number;
  topGenres: string[];
}

/**
 * Generate direct answer for location pages
 */
export function generateLocationDirectAnswer(location: LocationAEOData): DirectAnswer {
  const parts: string[] = [];
  
  const locationName = `${location.city}, ${location.state}`;
  
  // Core description
  parts.push(`${locationName} ${location.description}`);
  
  // Music scene
  if (location.musicScene) {
    parts.push(`. ${location.musicScene}`);
  }
  
  // Platform stats
  parts.push(` On Boptone, ${locationName} is home to ${location.totalArtists} independent artists`);
  
  // Top genres
  if (location.topGenres && location.topGenres.length > 0) {
    parts.push(`, primarily creating ${location.topGenres.slice(0, 2).join(" and ")} music`);
  }
  
  // Notable artists
  if (location.topArtists && location.topArtists.length > 0) {
    const topArtist = location.topArtists[0];
    parts.push(`. Notable artists include ${topArtist.name}`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is the music scene in ${locationName}?`,
    answer,
    wordCount,
    confidence: 0.88,
    lastVerified: new Date()
  };
}

/**
 * Generate FAQs for location pages
 */
export function generateLocationFAQs(location: LocationAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  const locationName = `${location.city}, ${location.state}`;
  
  // What is the music scene?
  faqs.push({
    question: `What is the music scene in ${locationName}?`,
    answer: generateLocationDirectAnswer(location).answer
  });
  
  // Who are top artists?
  if (location.topArtists && location.topArtists.length > 0) {
    const topArtistsList = location.topArtists.slice(0, 5).map(a => a.name).join(", ");
    faqs.push({
      question: `Who are the top artists from ${locationName}?`,
      answer: `Top independent artists from ${locationName} on Boptone include ${topArtistsList}.`
    });
  }
  
  // What genres?
  if (location.topGenres && location.topGenres.length > 0) {
    faqs.push({
      question: `What music genres are popular in ${locationName}?`,
      answer: `${locationName} artists primarily create ${location.topGenres.join(", ")} music.`
    });
  }
  
  // Where to discover
  faqs.push({
    question: `Where can I discover artists from ${locationName}?`,
    answer: `Discover ${location.totalArtists} independent artists from ${locationName} on Boptone at boptone.com/locations/${location.city.toLowerCase().replace(/\s+/g, "-")}.`
  });
  
  return faqs;
}

// ============================================================================
// PLATFORM PAGES AEO
// ============================================================================

export interface PlatformAEOData {
  name: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  revenueShare?: number; // For BopAudio
  pricing?: {
    free: string[];
    paid?: {
      price: number;
      features: string[];
    };
  };
  stats: {
    artists?: number;
    tracks?: number;
    products?: number;
  };
  competitors?: Array<{
    name: string;
    differentiator: string;
  }>;
}

/**
 * Generate direct answer for platform pages
 */
export function generatePlatformDirectAnswer(platform: PlatformAEOData): DirectAnswer {
  const parts: string[] = [];
  
  // Core identity
  parts.push(`${platform.name} is ${platform.description}`);
  
  // Key differentiator
  if (platform.revenueShare) {
    parts.push(`, where artists retain ${platform.revenueShare}% of streaming revenue`);
  }
  
  // Platform stats
  const stats = [];
  if (platform.stats.artists) stats.push(`${formatNumber(platform.stats.artists)} artists`);
  if (platform.stats.tracks) stats.push(`${formatNumber(platform.stats.tracks)} tracks`);
  if (platform.stats.products) stats.push(`${formatNumber(platform.stats.products)} products`);
  
  if (stats.length > 0) {
    parts.push(`. The platform features ${stats.join(", ")}`);
  }
  
  // Top features
  if (platform.keyFeatures && platform.keyFeatures.length > 0) {
    parts.push(`. Key features include ${platform.keyFeatures.slice(0, 2).join(" and ")}`);
  }
  
  const answer = parts.join("") + ".";
  const wordCount = answer.split(/\s+/).length;
  
  return {
    question: `What is ${platform.name}?`,
    answer,
    wordCount,
    confidence: 0.98,
    lastVerified: new Date()
  };
}

/**
 * Generate FAQs for platform pages
 */
export function generatePlatformFAQs(platform: PlatformAEOData): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  // What is this platform?
  faqs.push({
    question: `What is ${platform.name}?`,
    answer: generatePlatformDirectAnswer(platform).answer
  });
  
  // How does it work?
  if (platform.keyFeatures && platform.keyFeatures.length > 0) {
    faqs.push({
      question: `How does ${platform.name} work?`,
      answer: `${platform.name} provides ${platform.keyFeatures.join(", ")} to help independent artists grow their careers.`
    });
  }
  
  // Revenue/pricing
  if (platform.revenueShare) {
    faqs.push({
      question: `How much do artists earn on ${platform.name}?`,
      answer: `Artists on ${platform.name} retain ${platform.revenueShare}% of streaming revenue, compared to 10-15% on traditional platforms like Spotify.`
    });
  }
  
  if (platform.pricing) {
    faqs.push({
      question: `How much does ${platform.name} cost?`,
      answer: `${platform.name} offers ${platform.pricing.free.join(", ")} for free${platform.pricing.paid ? `, with premium features available for $${platform.pricing.paid.price}/month` : ""}.`
    });
  }
  
  // vs Competitors
  if (platform.competitors && platform.competitors.length > 0) {
    const competitor = platform.competitors[0];
    faqs.push({
      question: `How is ${platform.name} different from ${competitor.name}?`,
      answer: `Unlike ${competitor.name}, ${platform.name} ${competitor.differentiator}.`
    });
  }
  
  return faqs;
}
