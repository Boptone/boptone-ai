/**
 * AEO Schema Generation
 * Enhanced structured data for AI answer engines
 * Includes FAQPage, Article, DefinedTerm, and semantic graph linking
 */

import type { ArtistAEOData, ProductAEOData, FAQItem } from "./aeo";
import { getBaseUrl } from "./seo";

/**
 * Generate FAQPage schema (critical for answer engine citations)
 */
export function generateFAQPageSchema(faqs: FAQItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "dateModified": new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "Boptone",
          "url": "https://boptone.com"
        }
      }
    })),
    "url": pageUrl,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  };
}

/**
 * Generate Article schema with temporal metadata
 */
export function generateArticleSchema(
  title: string,
  description: string,
  pageUrl: string,
  lastModified: Date,
  imageUrl?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": pageUrl,
    "datePublished": lastModified.toISOString(),
    "dateModified": lastModified.toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Boptone",
      "url": "https://boptone.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://boptone.com/logo.png"
      }
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl
      }
    })
  };
}

/**
 * Generate DefinedTerm schema for proprietary terminology
 */
export function generateDefinedTermSchema(
  term: string,
  definition: string,
  termSetUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term,
    "description": definition,
    "inDefinedTermSet": termSetUrl,
    "url": `${termSetUrl}#${term.toLowerCase().replace(/\s+/g, "-")}`
  };
}

/**
 * Generate enhanced MusicGroup schema with semantic graph linking
 */
export function generateEnhancedArtistSchema(artist: ArtistAEOData, baseUrl: string) {
  const artistUrl = `${baseUrl}/artist/${artist.username}`;
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "url": artistUrl,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "Boptone Artist ID",
      "value": artist.id.toString()
    }
  };
  
  // Bio
  if (artist.bio) {
    schema.description = artist.bio;
  }
  
  // Genres with semantic linking
  if (artist.genres && artist.genres.length > 0) {
    schema.genre = artist.genres.map(genre => ({
      "@type": "DefinedTerm",
      "name": genre,
      "inDefinedTermSet": `${baseUrl}/genres`,
      "url": `${baseUrl}/genres/${genre.toLowerCase().replace(/\s+/g, "-")}`
    }));
  }
  
  // Location with semantic linking
  if (artist.location) {
    const locationParts = [];
    if (artist.location.city) locationParts.push(artist.location.city);
    if (artist.location.state) locationParts.push(artist.location.state);
    if (artist.location.country) locationParts.push(artist.location.country);
    
    if (locationParts.length > 0) {
      schema.location = {
        "@type": "Place",
        "name": locationParts.join(", "),
        "address": {
          "@type": "PostalAddress",
          "addressLocality": artist.location.city,
          "addressRegion": artist.location.state,
          "addressCountry": artist.location.country || "US"
        },
        ...(artist.location.city && {
          "url": `${baseUrl}/locations/${artist.location.city.toLowerCase().replace(/\s+/g, "-")}`
        })
      };
    }
  }
  
  // Social links
  const sameAs = [];
  if (artist.socialLinks?.instagram) sameAs.push(artist.socialLinks.instagram);
  if (artist.socialLinks?.twitter) sameAs.push(artist.socialLinks.twitter);
  if (artist.socialLinks?.spotify) sameAs.push(artist.socialLinks.spotify);
  if (artist.socialLinks?.appleMusic) sameAs.push(artist.socialLinks.appleMusic);
  if (artist.socialLinks?.website) sameAs.push(artist.socialLinks.website);
  
  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }
  
  // Albums
  if (artist.albums && artist.albums.length > 0) {
    schema.album = artist.albums.map(album => ({
      "@type": "MusicAlbum",
      "name": album.name,
      ...(album.releaseDate && { "datePublished": album.releaseDate }),
      ...(album.trackCount && { "numTracks": album.trackCount }),
      ...(album.streams && {
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ListenAction",
          "userInteractionCount": album.streams
        }
      })
    }));
  }
  
  // Subject of (topic cluster reinforcement)
  if (artist.topGenre) {
    schema.subjectOf = [
      {
        "@type": "Article",
        "headline": `Top ${artist.topGenre} Artists on Boptone`,
        "url": `${baseUrl}/genres/${artist.topGenre.toLowerCase().replace(/\s+/g, "-")}/artists`
      }
    ];
  }
  
  // Member of (platform association)
  schema.memberOf = {
    "@type": "Organization",
    "name": "Boptone Independent Artists",
    "url": `${baseUrl}/artists`
  };
  
  return schema;
}

/**
 * Generate enhanced Product schema with temporal metadata
 */
export function generateEnhancedProductSchema(product: ProductAEOData, baseUrl: string) {
  const productUrl = `${baseUrl}/shop/${product.artist.username}/${encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, "-"))}`;
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.artist.name
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": product.currency,
      "price": product.price.toFixed(2),
      "availability": `https://schema.org/${product.availability}`,
      "seller": {
        "@type": "Organization",
        "name": product.artist.name,
        "url": `${baseUrl}/artist/${product.artist.username}`
      },
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }
  };
  
  // Category with semantic linking
  if (product.category) {
    schema.category = {
      "@type": "DefinedTerm",
      "name": product.category,
      "inDefinedTermSet": `${baseUrl}/shop/categories`,
      "url": `${baseUrl}/shop/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`
    };
  }
  
  // Materials
  if (product.materials && product.materials.length > 0) {
    schema.material = product.materials.join(", ");
  }
  
  // Dimensions
  if (product.dimensions) {
    schema.depth = product.dimensions;
  }
  
  // Weight
  if (product.weight) {
    schema.weight = product.weight;
  }
  
  // Rating
  if (product.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating.value.toFixed(1),
      "reviewCount": product.rating.count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }
  
  return schema;
}

/**
 * Generate AudioObject schema for answer snippets
 */
export function generateAudioAnswerSchema(
  audioUrl: string,
  transcript: string,
  duration: number,
  artistName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    "name": `Who is ${artistName}? - Answer Snippet`,
    "description": "Audio answer optimized for AI citation and voice search",
    "contentUrl": audioUrl,
    "encodingFormat": "audio/mpeg",
    "duration": `PT${duration}S`,
    "transcript": transcript,
    "inLanguage": "en-US",
    "creator": {
      "@type": "Organization",
      "name": "Boptone"
    }
  };
}

/**
 * Generate BreadcrumbList schema with AEO enhancements
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate WebPage schema with temporal metadata
 */
export function generateWebPageSchema(
  title: string,
  description: string,
  pageUrl: string,
  lastModified: Date,
  breadcrumbs?: Array<{ name: string; url: string }>
) {
  const baseUrl = getBaseUrl();
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": pageUrl,
    "datePublished": lastModified.toISOString(),
    "dateModified": lastModified.toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "Boptone",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };
  
  if (breadcrumbs && breadcrumbs.length > 0) {
    schema.breadcrumb = generateBreadcrumbSchema(breadcrumbs, baseUrl);
  }
  
  return schema;
}

/**
 * Boptone proprietary terms for DefinedTerm schema
 */
export const BOPTONE_TERMS = {
  "Boptone": "The autonomous operating system for independent artists, providing distribution, analytics, e-commerce, and financial tools to help creators grow their careers.",
  "BopShop": "Boptone's e-commerce platform where artists sell merchandise and music directly to fans with 100% of sales going to the artist.",
  "BopAudio": "Boptone's streaming platform where artists retain 90% of streaming revenue and control distribution rights.",
  "BAP Protocol": "Boptone Artist Protocol (BAP) is Boptone's proprietary streaming infrastructure that ensures artists receive 90% of streaming revenue and maintain full control over their music distribution.",
  "Kick-In": "Boptone's micro-lending system that provides artists with advances on future streaming revenue to fund tours, recording, and career development.",
  "Distribution": "Boptone's third-party platform distribution system that delivers artist music to Spotify, Apple Music, Tidal, Deezer, YouTube Music, and other major streaming services."
};

/**
 * Generate all DefinedTerm schemas for Boptone glossary
 */
export function generateBoptoneGlossarySchemas(baseUrl: string) {
  const glossaryUrl = `${baseUrl}/glossary`;
  
  return Object.entries(BOPTONE_TERMS).map(([term, definition]) =>
    generateDefinedTermSchema(term, definition, glossaryUrl)
  );
}

// ============================================================================
// BOPAUDIO SCHEMAS
// ============================================================================

import type { TrackAEOData, AlbumAEOData, PlaylistAEOData, GenreAEOData, LocationAEOData, PlatformAEOData } from "./aeo";

/**
 * Generate enhanced MusicRecording schema for tracks
 */
export function generateTrackSchema(track: TrackAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "@id": `${baseUrl}/audio/${track.artist.username}/${encodeURIComponent(track.name.toLowerCase().replace(/\s+/g, "-"))}`,
    name: track.name,
    byArtist: {
      "@type": "MusicGroup",
      name: track.artist.name,
      url: `${baseUrl}/artist/${track.artist.username}`
    },
    duration: `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S`,
    datePublished: track.releaseDate,
    genre: track.genre,
    isrcCode: track.isrc,
    inLanguage: "en",
    isFamilyFriendly: !track.isExplicit
  };
  
  // Add album if present
  if (track.album) {
    schema.inAlbum = {
      "@type": "MusicAlbum",
      name: track.album.name,
      datePublished: track.album.releaseDate
    };
  }
  
  // Add aggregated rating if streams available
  if (track.streams) {
    // Estimate rating based on streams (simplified)
    const estimatedRating = Math.min(5, 3 + (track.streams / 50000));
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: estimatedRating.toFixed(1),
      ratingCount: Math.floor(track.streams / 100),
      bestRating: 5,
      worstRating: 1
    };
  }
  
  // Add temporal metadata
  schema.dateModified = new Date().toISOString();
  
  // Add semantic relationships
  if (track.genre) {
    schema.about = {
      "@type": "DefinedTerm",
      name: track.genre,
      inDefinedTermSet: `${baseUrl}/genres/${track.genre.toLowerCase().replace(/\s+/g, "-")}`
    };
  }
  
  return schema;
}

/**
 * Generate enhanced MusicAlbum schema
 */
export function generateAlbumSchema(album: AlbumAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    "@id": `${baseUrl}/audio/${album.artist.username}/${encodeURIComponent(album.name.toLowerCase().replace(/\s+/g, "-"))}`,
    name: album.name,
    byArtist: {
      "@type": "MusicGroup",
      name: album.artist.name,
      url: `${baseUrl}/artist/${album.artist.username}`
    },
    datePublished: album.releaseDate,
    numTracks: album.trackCount,
    genre: album.genres,
    image: album.coverArt,
    recordLabel: album.label,
    catalogNumber: album.upc
  };
  
  // Add track listing
  if (album.tracks && album.tracks.length > 0) {
    schema.track = album.tracks.map(track => ({
      "@type": "MusicRecording",
      name: track.name,
      position: track.trackNumber,
      duration: `PT${Math.floor(track.duration / 60)}M${track.duration % 60}S`
    }));
  }
  
  // Add aggregated rating if streams available
  if (album.streams) {
    const estimatedRating = Math.min(5, 3 + (album.streams / 100000));
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: estimatedRating.toFixed(1),
      ratingCount: Math.floor(album.streams / 100),
      bestRating: 5,
      worstRating: 1
    };
  }
  
  // Add temporal metadata
  schema.dateModified = new Date().toISOString();
  
  return schema;
}

/**
 * Generate enhanced MusicPlaylist schema
 */
export function generatePlaylistSchema(playlist: PlaylistAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    "@id": `${baseUrl}/playlists/${encodeURIComponent(playlist.name.toLowerCase().replace(/\s+/g, "-"))}`,
    name: playlist.name,
    description: playlist.description,
    numTracks: playlist.trackCount,
    genre: playlist.genres,
    creator: {
      "@type": "Person",
      name: playlist.curator.name,
      url: `${baseUrl}/artist/${playlist.curator.username}`
    },
    dateModified: playlist.lastUpdated.toISOString(),
    datePublished: playlist.lastUpdated.toISOString()
  };
  
  // Add track listing (sample)
  if (playlist.tracks && playlist.tracks.length > 0) {
    schema.track = playlist.tracks.slice(0, 10).map((track, index) => ({
      "@type": "MusicRecording",
      name: track.name,
      byArtist: {
        "@type": "MusicGroup",
        name: track.artist
      },
      position: index + 1
    }));
  }
  
  // Add interaction stats
  if (playlist.followers) {
    schema.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/FollowAction",
      userInteractionCount: playlist.followers
    };
  }
  
  return schema;
}

// ============================================================================
// GENRE & LOCATION SCHEMAS
// ============================================================================

/**
 * Generate DefinedTerm schema for music genres
 */
export function generateGenreSchema(genre: GenreAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${baseUrl}/genres/${genre.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: genre.name,
    description: genre.description,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Music Genres",
      url: `${baseUrl}/genres`
    }
  };
  
  // Add related genres
  if (genre.relatedGenres && genre.relatedGenres.length > 0) {
    schema.sameAs = genre.relatedGenres.map(relatedGenre => 
      `${baseUrl}/genres/${relatedGenre.toLowerCase().replace(/\s+/g, "-")}`
    );
  }
  
  // Add characteristics as additional properties
  if (genre.characteristics && genre.characteristics.length > 0) {
    schema.additionalProperty = genre.characteristics.map(char => ({
      "@type": "PropertyValue",
      name: "Characteristic",
      value: char
    }));
  }
  
  return schema;
}

/**
 * Generate Place schema for location pages with music scene context
 */
export function generateLocationSchema(location: LocationAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${baseUrl}/locations/${location.city.toLowerCase().replace(/\s+/g, "-")}`,
    name: `${location.city}, ${location.state}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: location.country
    },
    description: location.description
  };
  
  // Add music scene as special event/cultural aspect
  if (location.musicScene) {
    schema.event = {
      "@type": "Event",
      name: `${location.city} Music Scene`,
      description: location.musicScene,
      location: {
        "@type": "Place",
        name: location.city
      }
    };
  }
  
  // Add top artists as notable people from location
  if (location.topArtists && location.topArtists.length > 0) {
    schema.knowsAbout = location.topArtists.map(artist => ({
      "@type": "MusicGroup",
      name: artist.name,
      url: `${baseUrl}/artist/${artist.username}`,
      genre: artist.genres
    }));
  }
  
  return schema;
}

// ============================================================================
// PLATFORM SCHEMAS
// ============================================================================

/**
 * Generate SoftwareApplication schema for platform pages
 */
export function generatePlatformSchema(platform: PlatformAEOData, baseUrl: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": baseUrl,
    name: platform.name,
    description: platform.description,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
  
  // Add features
  if (platform.keyFeatures && platform.keyFeatures.length > 0) {
    schema.featureList = platform.keyFeatures;
  }
  
  // Add pricing if paid tier exists
  if (platform.pricing?.paid) {
    schema.offers = [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        description: platform.pricing.free.join(", ")
      },
      {
        "@type": "Offer",
        name: "Premium Plan",
        price: platform.pricing.paid.price.toString(),
        priceCurrency: "USD",
        description: platform.pricing.paid.features.join(", ")
      }
    ];
  }
  
  // Add aggregated rating if stats available
  if (platform.stats.artists) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: platform.stats.artists,
      bestRating: 5,
      worstRating: 1
    };
  }
  
  return schema;
}

/**
 * Generate comparison table schema for platform comparisons
 */
export function generateComparisonSchema(
  platform1: { name: string; features: string[] },
  platform2: { name: string; features: string[] },
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Table",
    about: `Comparison between ${platform1.name} and ${platform2.name}`,
    mainEntity: [
      {
        "@type": "SoftwareApplication",
        name: platform1.name,
        featureList: platform1.features
      },
      {
        "@type": "SoftwareApplication",
        name: platform2.name,
        featureList: platform2.features
      }
    ]
  };
}
