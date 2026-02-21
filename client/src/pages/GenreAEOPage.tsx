/**
 * AEO-Enhanced Genre Page
 * Example implementation for genre discovery pages
 * 
 * REFERENCE IMPLEMENTATION - adapt for your actual genre pages
 */

import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";
import { DirectAnswerLayer } from "@/components/aeo/DirectAnswerLayer";
import { FAQSection } from "@/components/aeo/FAQSection";
import { SummaryBlock } from "@/components/aeo/SummaryBlock";

interface GenreAEOPageProps {
  genreName: string;
}

export default function GenreAEOPage({ genreName }: GenreAEOPageProps) {
  const { data: aeoData, isLoading } = trpc.aeo.getGenreAEO.useQuery({ genreName });
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  if (!aeoData) {
    return <div className="container mx-auto px-4 py-8">Genre not found</div>;
  }
  
  const { directAnswer, faqs, summaryBlock, schemas } = aeoData;
  const pageUrl = `https://boptone.com/genres/${genreName.toLowerCase().replace(/\s+/g, "-")}`;
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemas.genre)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemas.faq)}
        </script>
        
        <title>{directAnswer.question}</title>
        <meta name="description" content={directAnswer.answer} />
        <meta property="og:title" content={directAnswer.question} />
        <meta property="og:description" content={directAnswer.answer} />
        <meta property="og:url" content={pageUrl} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <DirectAnswerLayer
          question={directAnswer.question}
          answer={directAnswer.answer}
          confidence={directAnswer.confidence}
          lastVerified={new Date(directAnswer.lastVerified)}
          className="mb-12"
        />
        
        {/* YOUR EXISTING GENRE CONTENT: Top artists, playlists, characteristics */}
        
        <FAQSection
          faqs={faqs}
          pageUrl={pageUrl}
          className="mb-12"
        />
        
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
