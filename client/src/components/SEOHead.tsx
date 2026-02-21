/**
 * SEOHead Component
 * Manages meta tags, structured data, and SEO/GEO optimization for pages
 */

import { Helmet } from "react-helmet-async";

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  openGraph?: {
    type?: string;
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    productPrice?: string;
    productCurrency?: string;
  };
  twitter?: {
    card?: string;
    url?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  structuredData?: object;
}

export function SEOHead({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  structuredData,
}: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Tags */}
      {openGraph && (
        <>
          <meta property="og:type" content={openGraph.type || "website"} />
          {openGraph.url && <meta property="og:url" content={openGraph.url} />}
          <meta property="og:title" content={openGraph.title || title} />
          <meta property="og:description" content={openGraph.description || description} />
          {openGraph.image && <meta property="og:image" content={openGraph.image} />}
          {openGraph.productPrice && (
            <>
              <meta property="product:price:amount" content={openGraph.productPrice} />
              <meta property="product:price:currency" content={openGraph.productCurrency || "USD"} />
            </>
          )}
        </>
      )}

      {/* Twitter Card Tags */}
      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card || "summary_large_image"} />
          {twitter.url && <meta name="twitter:url" content={twitter.url} />}
          <meta name="twitter:title" content={twitter.title || title} />
          <meta name="twitter:description" content={twitter.description || description} />
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
        </>
      )}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
