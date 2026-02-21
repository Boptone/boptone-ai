/**
 * AEO tRPC Router
 * Provides AEO-optimized content for artist and product pages
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  generateDirectAnswer,
  generateProductDirectAnswer,
  generatePredictedQueries,
  generateFAQs,
  generateProductFAQs,
  generateSummaryBlock,
  generateProductSummaryBlock,
  type ArtistAEOData,
  type ProductAEOData
} from "../aeo";
import {
  generateFAQPageSchema,
  generateEnhancedArtistSchema,
  generateEnhancedProductSchema
} from "../aeoSchema";
import { getBaseUrl } from "../seo";

export const aeoRouter = router({
  /**
   * Get AEO content for artist page
   */
  getArtistAEO: publicProcedure
    .input(z.object({ artistId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Fetch real artist data from database
      // For now, return mock data structure
      const mockArtist: ArtistAEOData = {
        id: input.artistId,
        name: "Sample Artist",
        username: "sample-artist",
        bio: "An independent artist creating music on Boptone",
        genres: ["Hip Hop", "R&B"],
        location: {
          city: "Los Angeles",
          state: "California",
          country: "US"
        },
        stats: {
          totalStreams: 125000,
          monthlyListeners: 8500,
          followers: 3200,
          releases: 12
        },
        albums: [
          {
            id: 1,
            name: "Debut Album",
            releaseDate: "2024-01-15",
            trackCount: 10,
            streams: 45000
          }
        ],
        topGenre: "Hip Hop",
        topAlbum: {
          name: "Debut Album",
          year: 2024,
          streams: 45000
        },
        verified: true,
        updatedAt: new Date()
      };
      
      const baseUrl = getBaseUrl();
      const pageUrl = `${baseUrl}/artist/${mockArtist.username}`;
      
      // Generate all AEO content
      const directAnswer = generateDirectAnswer(mockArtist);
      const predictedQueries = generatePredictedQueries(mockArtist);
      const faqs = generateFAQs(mockArtist);
      const summaryBlock = generateSummaryBlock(mockArtist);
      
      // Generate schemas
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const artistSchema = generateEnhancedArtistSchema(mockArtist, baseUrl);
      
      return {
        directAnswer,
        predictedQueries,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          artist: artistSchema
        }
      };
    }),
  
  /**
   * Get AEO content for product page
   */
  getProductAEO: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Fetch real product data from database
      const mockProduct: ProductAEOData = {
        id: input.productId,
        name: "Limited Edition T-Shirt",
        description: "Premium cotton t-shirt with exclusive album artwork",
        price: 29.99,
        currency: "USD",
        category: "Apparel",
        materials: ["100% organic cotton"],
        dimensions: "Standard fit",
        weight: "6 oz",
        availability: "InStock",
        quantityAvailable: 50,
        artist: {
          name: "Sample Artist",
          username: "sample-artist"
        },
        features: ["Soft fabric", "Durable print", "Eco-friendly"],
        rating: {
          value: 4.8,
          count: 24
        }
      };
      
      const baseUrl = getBaseUrl();
      const productSlug = mockProduct.name.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/shop/${mockProduct.artist.username}/${productSlug}`;
      
      // Generate all AEO content
      const directAnswer = generateProductDirectAnswer(mockProduct);
      const faqs = generateProductFAQs(mockProduct);
      const summaryBlock = generateProductSummaryBlock(mockProduct);
      
      // Generate schemas
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const productSchema = generateEnhancedProductSchema(mockProduct, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          product: productSchema
        }
      };
    })
});
