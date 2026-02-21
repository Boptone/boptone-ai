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
  generateTrackDirectAnswer,
  generateTrackFAQs,
  generateAlbumDirectAnswer,
  generateAlbumFAQs,
  generatePlaylistDirectAnswer,
  generatePlaylistFAQs,
  generateGenreDirectAnswer,
  generateGenreFAQs,
  generateLocationDirectAnswer,
  generateLocationFAQs,
  generatePlatformDirectAnswer,
  generatePlatformFAQs,
  type ArtistAEOData,
  type ProductAEOData,
  type TrackAEOData,
  type AlbumAEOData,
  type PlaylistAEOData,
  type GenreAEOData,
  type LocationAEOData,
  type PlatformAEOData
} from "../aeo";
import {
  generateFAQPageSchema,
  generateEnhancedArtistSchema,
  generateEnhancedProductSchema,
  generateTrackSchema,
  generateAlbumSchema,
  generatePlaylistSchema,
  generateGenreSchema,
  generateLocationSchema,
  generatePlatformSchema
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
    }),
  
  /**
   * Get AEO content for track page (BopAudio)
   */
  getTrackAEO: publicProcedure
    .input(z.object({ trackId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Fetch real track data from database
      const mockTrack: TrackAEOData = {
        id: input.trackId,
        name: "Sample Track",
        artist: {
          name: "Sample Artist",
          username: "sample-artist"
        },
        duration: 195, // 3:15
        genre: "Hip Hop",
        releaseDate: "2024-06-15",
        streams: 45000,
        isExplicit: false,
        album: {
          name: "Sample Album",
          releaseDate: "2024-06-01"
        }
      };
      
      const baseUrl = getBaseUrl();
      const trackSlug = mockTrack.name.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/audio/${mockTrack.artist.username}/${trackSlug}`;
      
      const directAnswer = generateTrackDirectAnswer(mockTrack);
      const faqs = generateTrackFAQs(mockTrack);
      const summaryBlock = {
        oneSentenceSummary: `"${mockTrack.name}" is a ${mockTrack.genre} track by ${mockTrack.artist.name} with ${mockTrack.streams?.toLocaleString()} streams on BopAudio.`,
        keyTakeaways: [
          `${mockTrack.genre || 'Music'} track released in ${new Date(mockTrack.releaseDate).getFullYear()}`,
          `Part of ${mockTrack.album?.name} album`,
          `Stream on BopAudio where artists earn 90% revenue`
        ],
        relatedLinks: [
          { text: `More from ${mockTrack.artist.name}`, url: `${baseUrl}/artist/${mockTrack.artist.username}` },
          { text: `${mockTrack.genre || 'Music'}`, url: `${baseUrl}/genres/${(mockTrack.genre || 'music').toLowerCase().replace(/\s+/g, "-")}` },
          { text: "BopAudio Platform", url: `${baseUrl}/bopaudio` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const trackSchema = generateTrackSchema(mockTrack, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          track: trackSchema
        }
      };
    }),
  
  /**
   * Get AEO content for album page (BopAudio)
   */
  getAlbumAEO: publicProcedure
    .input(z.object({ albumId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Fetch real album data from database
      const mockAlbum: AlbumAEOData = {
        id: input.albumId,
        name: "Sample Album",
        artist: {
          name: "Sample Artist",
          username: "sample-artist"
        },
        releaseDate: "2024-06-01",
        trackCount: 10,
        totalDuration: 2400, // 40 minutes
        genres: ["Hip Hop", "R&B"],
        streams: 250000,
        tracks: [
          { id: 1, name: "Intro", duration: 120, trackNumber: 1 },
          { id: 2, name: "Main Track", duration: 195, trackNumber: 2 }
        ],
        label: "Independent"
      };
      
      const baseUrl = getBaseUrl();
      const albumSlug = mockAlbum.name.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/audio/${mockAlbum.artist.username}/${albumSlug}`;
      
      const directAnswer = generateAlbumDirectAnswer(mockAlbum);
      const faqs = generateAlbumFAQs(mockAlbum);
      const summaryBlock = {
        oneSentenceSummary: `${mockAlbum.name} is a ${mockAlbum.trackCount}-track album by ${mockAlbum.artist.name} with ${mockAlbum.streams?.toLocaleString()} streams.`,
        keyTakeaways: [
          `Released ${new Date(mockAlbum.releaseDate).toLocaleDateString()}`,
          `${mockAlbum.trackCount} tracks, ${Math.floor(mockAlbum.totalDuration / 60)} minutes`,
          `Available on BopAudio with 90% artist revenue share`
        ],
        relatedLinks: [
          { text: `${mockAlbum.artist.name} Profile`, url: `${baseUrl}/artist/${mockAlbum.artist.username}` },
          { text: `${mockAlbum.genres?.[0]} Albums`, url: `${baseUrl}/genres/${mockAlbum.genres?.[0].toLowerCase().replace(/\s+/g, "-")}` },
          { text: "BopAudio Platform", url: `${baseUrl}/bopaudio` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const albumSchema = generateAlbumSchema(mockAlbum, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          album: albumSchema
        }
      };
    }),
  
  /**
   * Get AEO content for playlist page (BopAudio)
   */
  getPlaylistAEO: publicProcedure
    .input(z.object({ playlistId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Fetch real playlist data from database
      const mockPlaylist: PlaylistAEOData = {
        id: input.playlistId,
        name: "Best of Hip Hop 2024",
        description: "Top hip hop tracks from independent artists",
        curator: {
          name: "Boptone Editorial",
          username: "boptone"
        },
        trackCount: 50,
        totalDuration: 9000, // 150 minutes
        genres: ["Hip Hop", "Rap"],
        followers: 12500,
        isPublic: true,
        lastUpdated: new Date(),
        tracks: [
          { id: 1, name: "Track 1", artist: "Artist A" },
          { id: 2, name: "Track 2", artist: "Artist B" }
        ]
      };
      
      const baseUrl = getBaseUrl();
      const playlistSlug = mockPlaylist.name.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/playlists/${playlistSlug}`;
      
      const directAnswer = generatePlaylistDirectAnswer(mockPlaylist);
      const faqs = generatePlaylistFAQs(mockPlaylist);
      const summaryBlock = {
        oneSentenceSummary: `${mockPlaylist.name} is a curated playlist featuring ${mockPlaylist.trackCount} tracks with ${mockPlaylist.followers?.toLocaleString()} followers.`,
        keyTakeaways: [
          `Curated by ${mockPlaylist.curator.name}`,
          `${mockPlaylist.trackCount} tracks, ${Math.floor(mockPlaylist.totalDuration / 60)} minutes`,
          `Updated regularly with new independent releases`
        ],
        relatedLinks: [
          { text: `${mockPlaylist.genres?.[0]} Playlists`, url: `${baseUrl}/genres/${mockPlaylist.genres?.[0].toLowerCase().replace(/\s+/g, "-")}/playlists` },
          { text: "All Playlists", url: `${baseUrl}/playlists` },
          { text: "BopAudio Platform", url: `${baseUrl}/bopaudio` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const playlistSchema = generatePlaylistSchema(mockPlaylist, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          playlist: playlistSchema
        }
      };
    }),
  
  /**
   * Get AEO content for genre page
   */
  getGenreAEO: publicProcedure
    .input(z.object({ genreName: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch real genre data from database
      const mockGenre: GenreAEOData = {
        name: input.genreName,
        description: "characterized by rhythmic beats, rap vocals, and urban cultural influences",
        characteristics: ["rhythmic beats", "rap vocals", "sampling", "urban storytelling"],
        topArtists: [
          { name: "Artist A", username: "artist-a", streams: 500000 },
          { name: "Artist B", username: "artist-b", streams: 350000 }
        ],
        totalArtists: 450,
        totalTracks: 8500,
        relatedGenres: ["Rap", "R&B", "Trap"]
      };
      
      const baseUrl = getBaseUrl();
      const genreSlug = input.genreName.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/genres/${genreSlug}`;
      
      const directAnswer = generateGenreDirectAnswer(mockGenre);
      const faqs = generateGenreFAQs(mockGenre);
      const summaryBlock = {
        oneSentenceSummary: `${mockGenre.name} on Boptone features ${mockGenre.totalArtists} independent artists with ${mockGenre.totalTracks.toLocaleString()} tracks.`,
        keyTakeaways: [
          `${mockGenre.totalArtists} independent ${mockGenre.name} artists`,
          `Top artists include ${mockGenre.topArtists.slice(0, 2).map(a => a.name).join(" and ")}`,
          `Discover new ${mockGenre.name} music on BopAudio`
        ],
        relatedLinks: [
          { text: `Top ${mockGenre.name} Artists`, url: `${pageUrl}/artists` },
          { text: `${mockGenre.name} Playlists`, url: `${pageUrl}/playlists` },
          { text: "All Genres", url: `${baseUrl}/genres` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const genreSchema = generateGenreSchema(mockGenre, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          genre: genreSchema
        }
      };
    }),
  
  /**
   * Get AEO content for location page
   */
  getLocationAEO: publicProcedure
    .input(z.object({ city: z.string(), state: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch real location data from database
      const mockLocation: LocationAEOData = {
        city: input.city,
        state: input.state,
        country: "US",
        description: "is a vibrant music hub with a thriving independent artist community",
        musicScene: "The city's music scene blends traditional influences with contemporary innovation, fostering a diverse creative ecosystem.",
        topArtists: [
          { name: "Local Artist A", username: "local-a", genres: ["Hip Hop", "R&B"], streams: 200000 },
          { name: "Local Artist B", username: "local-b", genres: ["Rock", "Indie"], streams: 150000 }
        ],
        totalArtists: 125,
        topGenres: ["Hip Hop", "R&B", "Rock"]
      };
      
      const baseUrl = getBaseUrl();
      const citySlug = input.city.toLowerCase().replace(/\s+/g, "-");
      const pageUrl = `${baseUrl}/locations/${citySlug}`;
      
      const directAnswer = generateLocationDirectAnswer(mockLocation);
      const faqs = generateLocationFAQs(mockLocation);
      const summaryBlock = {
        oneSentenceSummary: `${mockLocation.city}, ${mockLocation.state} is home to ${mockLocation.totalArtists} independent artists on Boptone.`,
        keyTakeaways: [
          `${mockLocation.totalArtists} artists from ${mockLocation.city}`,
          `Top genres: ${mockLocation.topGenres.join(", ")}`,
          `Notable artists include ${mockLocation.topArtists[0].name}`
        ],
        relatedLinks: [
          { text: `${mockLocation.city} Artists`, url: `${pageUrl}/artists` },
          { text: `${mockLocation.state} Music Scene`, url: `${baseUrl}/locations/${mockLocation.state.toLowerCase()}` },
          { text: "All Locations", url: `${baseUrl}/locations` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const locationSchema = generateLocationSchema(mockLocation, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          location: locationSchema
        }
      };
    }),
  
  /**
   * Get AEO content for platform pages (Boptone, BopAudio, BopShop)
   */
  getPlatformAEO: publicProcedure
    .input(z.object({ platformName: z.enum(["Boptone", "BopAudio", "BopShop"]) }))
    .query(async ({ input }) => {
      const baseUrl = getBaseUrl();
      
      // Platform-specific data
      const platformData: Record<string, PlatformAEOData> = {
        "Boptone": {
          name: "Boptone",
          tagline: "Automate Your Tone",
          description: "the autonomous operating system for independent artists, providing distribution, streaming, e-commerce, and financial tools to help creators grow their careers",
          keyFeatures: ["music distribution", "streaming platform (BopAudio)", "e-commerce (BopShop)", "analytics", "financial tools"],
          pricing: {
            free: ["basic distribution", "artist profile", "streaming"],
            paid: {
              price: 9.99,
              features: ["advanced analytics", "priority support", "workflow automation"]
            }
          },
          stats: {
            artists: 12500,
            tracks: 85000,
            products: 3200
          },
          competitors: [
            { name: "Spotify", differentiator: "gives artists 90% of streaming revenue vs Spotify's 10-15%" },
            { name: "Bandcamp", differentiator: "provides integrated distribution, streaming, and e-commerce in one platform" }
          ]
        },
        "BopAudio": {
          name: "BopAudio",
          tagline: "Stream with 90% artist revenue",
          description: "Boptone's streaming platform where independent artists retain 90% of streaming revenue and control distribution rights",
          keyFeatures: ["90% artist revenue share", "full distribution control", "real-time analytics", "playlist curation"],
          revenueShare: 90,
          stats: {
            artists: 12500,
            tracks: 85000
          },
          competitors: [
            { name: "Spotify", differentiator: "pays artists 90% vs Spotify's 10-15%" },
            { name: "Apple Music", differentiator: "gives artists full control over distribution and pricing" }
          ]
        },
        "BopShop": {
          name: "BopShop",
          tagline: "Sell direct, keep 100%",
          description: "Boptone's e-commerce platform where artists sell merchandise and music directly to fans with 100% of sales going to the artist",
          keyFeatures: ["100% artist revenue", "integrated checkout", "inventory management", "fan analytics"],
          stats: {
            artists: 8500,
            products: 3200
          },
          competitors: [
            { name: "Bandcamp", differentiator: "takes 0% commission vs Bandcamp's 10-15%" },
            { name: "Shopify", differentiator: "built specifically for musicians with integrated streaming and distribution" }
          ]
        }
      };
      
      const platform = platformData[input.platformName];
      const pageUrl = input.platformName === "Boptone" 
        ? baseUrl 
        : `${baseUrl}/${input.platformName.toLowerCase()}`;
      
      const directAnswer = generatePlatformDirectAnswer(platform);
      const faqs = generatePlatformFAQs(platform);
      const summaryBlock = {
        oneSentenceSummary: `${platform.name} ${platform.description}.`,
        keyTakeaways: platform.keyFeatures.slice(0, 3),
        relatedLinks: [
          { text: "How It Works", url: `${baseUrl}/how-it-works` },
          { text: "Pricing", url: `${baseUrl}/pricing` },
          { text: "Artist Success Stories", url: `${baseUrl}/success-stories` }
        ]
      };
      
      const faqSchema = generateFAQPageSchema(faqs, pageUrl);
      const platformSchema = generatePlatformSchema(platform, baseUrl);
      
      return {
        directAnswer,
        faqs,
        summaryBlock,
        schemas: {
          faq: faqSchema,
          platform: platformSchema
        }
      };
    })
});
