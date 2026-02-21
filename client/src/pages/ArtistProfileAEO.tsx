/**
 * AEO-Enhanced Artist Profile Page
 * Example implementation showing how to integrate AEO components
 * 
 * This is a REFERENCE IMPLEMENTATION - adapt for your actual artist profile page
 */

import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";
import { DirectAnswerLayer } from "@/components/aeo/DirectAnswerLayer";
import { FAQSection, PredictedQueriesSection } from "@/components/aeo/FAQSection";
import { SummaryBlock } from "@/components/aeo/SummaryBlock";

interface ArtistProfileAEOProps {
  artistId: number;
  artistUsername: string;
}

export default function ArtistProfileAEO({ artistId, artistUsername }: ArtistProfileAEOProps) {
  // Fetch AEO content from tRPC
  const { data: aeoData, isLoading } = trpc.aeo.getArtistAEO.useQuery({ artistId });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!aeoData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Artist not found</p>
      </div>
    );
  }
  
  const { directAnswer, predictedQueries, faqs, summaryBlock, schemas } = aeoData;
  const pageUrl = `https://boptone.com/artist/${artistUsername}`;
  
  return (
    <>
      {/* Inject all AEO schemas */}
      <Helmet>
        {/* FAQPage schema */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.faq)}
        </script>
        
        {/* Enhanced MusicGroup schema with semantic linking */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.artist)}
        </script>
        
        {/* Meta tags */}
        <title>{directAnswer.question}</title>
        <meta name="description" content={directAnswer.answer} />
        
        {/* Open Graph */}
        <meta property="og:title" content={directAnswer.question} />
        <meta property="og:description" content={directAnswer.answer} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="music.musician" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={directAnswer.question} />
        <meta name="twitter:description" content={directAnswer.answer} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* DIRECT ANSWER LAYER - Above the fold, first thing LLMs see */}
        <DirectAnswerLayer
          question={directAnswer.question}
          answer={directAnswer.answer}
          confidence={directAnswer.confidence}
          lastVerified={new Date(directAnswer.lastVerified)}
          className="mb-12"
        />
        
        {/* PREDICTED QUERIES - Pre-answered follow-up questions */}
        {predictedQueries && predictedQueries.length > 0 && (
          <PredictedQueriesSection
            queries={predictedQueries}
            className="mb-12"
          />
        )}
        
        {/* YOUR EXISTING ARTIST PROFILE CONTENT GOES HERE */}
        {/* Example: Albums, tracks, bio, stats, etc. */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Music & Releases</h2>
          {/* Your existing content */}
        </section>
        
        {/* FAQ SECTION - Critical for answer engine citations */}
        {faqs && faqs.length > 0 && (
          <FAQSection
            faqs={faqs}
            pageUrl={pageUrl}
            className="mb-12"
          />
        )}
        
        {/* SUMMARY BLOCK - Page-end summary with key takeaways */}
        <SummaryBlock
          oneSentenceSummary={summaryBlock.oneSentenceSummary}
          keyTakeaways={summaryBlock.keyTakeaways}
          relatedLinks={summaryBlock.relatedLinks}
          className="mb-8"
        />
      </div>
    </>
  );
}
