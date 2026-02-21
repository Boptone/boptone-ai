/**
 * SEO Auto-Population Service
 * Automatically generates SEO/GEO data when artists create or update profiles
 */

import { getDb } from "./db";
import { artistProfiles, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  generateArtistStructuredData,
  generateArtistMetaTags,
  generateBreadcrumbStructuredData,
  getBaseUrl,
  type ArtistSEO,
  type BreadcrumbItem,
} from "./seo";
import { generateGEOArtistBio, generateMetaDescription, type ArtistData } from "./geoContent";

/**
 * Auto-populate SEO/GEO data for an artist profile
 */
export async function autoPopulateSEO(userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[SEO Auto-Populate] Database not available");
      return;
    }

    const [profile] = await db.select().from(artistProfiles).where(eq(artistProfiles.userId, userId)).limit(1);

    if (!profile) {
      console.warn(`[SEO Auto-Populate] No artist profile found for user ${userId}`);
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      console.warn(`[SEO Auto-Populate] No user found for ID ${userId}`);
      return;
    }

    const baseUrl = getBaseUrl();

    const artistSEO: ArtistSEO = {
      name: profile.stageName || user.name || "Unknown Artist",
      username: user.openId,
      bio: profile.bio || undefined,
      genres: profile.genres ? (Array.isArray(profile.genres) ? profile.genres : [profile.genres]) : undefined,
      location: profile.location ? parseLocation(profile.location) : undefined,
      socialLinks: profile.socialLinks || undefined,
      avatarUrl: profile.avatarUrl || undefined,
    };

    const structuredData = generateArtistStructuredData(artistSEO, baseUrl);
    const metaTags = generateArtistMetaTags(artistSEO, baseUrl);

    const breadcrumbItems: BreadcrumbItem[] = [
      { name: "Artists", url: "/artists" },
    ];
    
    if (artistSEO.genres && artistSEO.genres.length > 0) {
      breadcrumbItems.push({
        name: artistSEO.genres[0],
        url: `/artists/${artistSEO.genres[0].toLowerCase().replace(/\s+/g, "-")}`,
      });
    }
    
    breadcrumbItems.push({
      name: artistSEO.name,
      url: `/artist/${artistSEO.username}`,
    });

    const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbItems, baseUrl);

    let geoBio = profile.bio;
    if (!geoBio || geoBio.length < 50) {
      const artistData: ArtistData = {
        name: artistSEO.name,
        username: artistSEO.username,
        bio: artistSEO.bio,
        genres: artistSEO.genres,
        location: artistSEO.location,
        socialLinks: artistSEO.socialLinks,
      };
      geoBio = generateGEOArtistBio(artistData);
    }

    const metaDescription = generateMetaDescription({
      name: artistSEO.name,
      username: artistSEO.username,
      bio: artistSEO.bio,
      genres: artistSEO.genres,
      location: artistSEO.location,
      socialLinks: artistSEO.socialLinks,
    });

    console.log(`[SEO Auto-Populate] Generated SEO data for ${artistSEO.name}`);
    console.log(`- Structured Data: ${JSON.stringify(structuredData).length} bytes`);
    console.log(`- Meta Tags: ${Object.keys(metaTags).length} tags`);
    console.log(`- Breadcrumbs: ${breadcrumbItems.length} items`);
    console.log(`- GEO Bio: ${geoBio.length} characters`);
    console.log(`- Meta Description: ${metaDescription.length} characters`);

  } catch (error) {
    console.error("[SEO Auto-Populate] Error:", error);
  }
}

/**
 * Parse location string into structured format
 */
function parseLocation(location: string): { city?: string; state?: string; country?: string } {
  const parts = location.split(",").map((p) => p.trim());
  
  if (parts.length === 2) {
    return { city: parts[0], state: parts[1] };
  }
  
  if (parts.length === 3) {
    return { city: parts[0], state: parts[1], country: parts[2] };
  }
  
  return { city: location };
}
