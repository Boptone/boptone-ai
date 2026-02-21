/**
 * AEO-Enhanced Track Page (BopAudio)
 * Example implementation for music track pages
 * 
 * REFERENCE IMPLEMENTATION - adapt for your actual track pages
 */

import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";
import { DirectAnswerLayer } from "@/components/aeo/DirectAnswerLayer";
import { FAQSection } from "@/components/aeo/FAQSection";
import { SummaryBlock } from "@/components/aeo/SummaryBlock";

interface TrackAEOPageProps {
  trackId: number;
  artistUsername: string;
  trackSlug: string;
}

export default function TrackAEOPage({ trackId, artistUsername, trackSlug }: TrackAEOPageProps) {
  const { data: aeoData, isLoading } = trpc.aeo.getTrackAEO.useQuery({ trackId });
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  if (!aeoData) {
    return <div className="container mx-auto px-4 py-8">Track not found</div>;
  }
  
  const { directAnswer, faqs, summaryBlock, schemas } = aeoData;
  const pageUrl = `https://boptone.com/audio/${artistUsername}/${trackSlug}`;
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemas.track)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemas.faq)}
        </script>
        
        <title>{directAnswer.question}</title>
        <meta name="description" content={directAnswer.answer} />
        <meta property="og:title" content={directAnswer.question} />
        <meta property="og:description" content={directAnswer.answer} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="music.song" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <DirectAnswerLayer
          question={directAnswer.question}
          answer={directAnswer.answer}
          confidence={directAnswer.confidence}
          lastVerified={new Date(directAnswer.lastVerified)}
          className="mb-12"
        />
        
        {/* YOUR EXISTING TRACK CONTENT: Player, lyrics, artist info, etc. */}
        
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
