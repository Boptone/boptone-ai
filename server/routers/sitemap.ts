/**
 * Sitemap Router
 * Generates dynamic sitemap.xml and robots.txt
 */

import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { artistProfiles, users } from "../../drizzle/schema";
import { getBaseUrl } from "../seo";

export const sitemapRouter = router({
  /**
   * Generate sitemap XML
   */
  generateSitemap: publicProcedure.query(async () => {
    const baseUrl = getBaseUrl();
    const db = await getDb();

    const urls: Array<{
      loc: string;
      lastmod?: string;
      changefreq?: string;
      priority?: string;
    }> = [];

    urls.push({
      loc: `${baseUrl}/`,
      changefreq: "daily",
      priority: "1.0",
    });

    urls.push({
      loc: `${baseUrl}/how-it-works`,
      changefreq: "monthly",
      priority: "0.8",
    });

    urls.push({
      loc: `${baseUrl}/pricing`,
      changefreq: "monthly",
      priority: "0.8",
    });

    urls.push({
      loc: `${baseUrl}/artists`,
      changefreq: "daily",
      priority: "0.9",
    });

    urls.push({
      loc: `${baseUrl}/shop`,
      changefreq: "daily",
      priority: "0.9",
    });

    urls.push({
      loc: `${baseUrl}/discover`,
      changefreq: "daily",
      priority: "0.8",
    });

    if (db) {
      try {
        const profiles = await db
          .select({
            userId: artistProfiles.userId,
            updatedAt: artistProfiles.updatedAt,
            openId: users.openId,
          })
          .from(artistProfiles)
          .leftJoin(users, eq(artistProfiles.userId, users.id));

        profiles.forEach((profile) => {
          if (profile.openId) {
            urls.push({
              loc: `${baseUrl}/artist/${profile.openId}`,
              lastmod: profile.updatedAt ? new Date(profile.updatedAt).toISOString().split("T")[0] : undefined,
              changefreq: "weekly",
              priority: "0.8",
            });

            urls.push({
              loc: `${baseUrl}/shop/${profile.openId}`,
              lastmod: profile.updatedAt ? new Date(profile.updatedAt).toISOString().split("T")[0] : undefined,
              changefreq: "daily",
              priority: "0.7",
            });
          }
        });
      } catch (error) {
        console.error("[Sitemap] Error fetching artist profiles:", error);
      }
    }

    return { urls };
  }),

  /**
   * Generate robots.txt
   */
  generateRobotsTxt: publicProcedure.query(() => {
    const baseUrl = getBaseUrl();
    
    return {
      content: `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin pages
Disallow: /dashboard
Disallow: /admin
Disallow: /api`,
    };
  }),
});
