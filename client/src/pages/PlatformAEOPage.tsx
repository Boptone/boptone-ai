/**
 * AEO-Enhanced Platform Page
 * Example implementation for BopAudio, BopShop, Boptone platform pages
 * 
 * REFERENCE IMPLEMENTATION - adapt for your actual platform pages
 */

import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";
import { DirectAnswerLayer } from "@/components/aeo/DirectAnswerLayer";
import { FAQSection } from "@/components/aeo/FAQSection";
import { SummaryBlock } from "@/components/aeo/SummaryBlock";

interface PlatformAEOPageProps {
  platformName: "Boptone" | "BopAudio" | "BopShop";
}

export default function PlatformAEOPage({ platformName }: PlatformAEOPageProps) {
  const { data: aeoData, isLoading } = trpc.aeo.getPlatformAEO.useQuery({ platformName });
  
  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  if (!aeoData) {
    return <div className="container mx-auto px-4 py-8">Platform not found</div>;
  }
  
  const { directAnswer, faqs, summaryBlock, schemas } = aeoData;
  const pageUrl = platformName === "Boptone" 
    ? "https://boptone.com" 
    : `https://boptone.com/${platformName.toLowerCase()}`;
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemas.platform)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemas.faq)}
        </script>
        
        <title>{directAnswer.question}</title>
        <meta name="description" content={directAnswer.answer} />
        <meta property="og:title" content={directAnswer.question} />
        <meta property="og:description" content={directAnswer.answer} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <DirectAnswerLayer
          question={directAnswer.question}
          answer={directAnswer.answer}
          confidence={directAnswer.confidence}
          lastVerified={new Date(directAnswer.lastVerified)}
          className="mb-12"
        />
        
        {/* YOUR EXISTING PLATFORM CONTENT: Features, pricing, testimonials */}
        
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
