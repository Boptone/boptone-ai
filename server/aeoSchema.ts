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
