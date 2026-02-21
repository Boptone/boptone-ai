/**
 * SummaryBlock Component
 * Page-end summary with one-sentence summary, key takeaways, and related links
 * Helps LLMs understand page context and relationships
 */

export interface SummaryBlockProps {
  oneSentenceSummary: string;
  keyTakeaways: string[];
  relatedLinks: Array<{
    title: string;
    url: string;
  }>;
  className?: string;
}

export function SummaryBlock({
  oneSentenceSummary,
  keyTakeaways,
  relatedLinks,
  className = ""
}: SummaryBlockProps) {
  return (
    <section 
      className={`summary-block bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-8 ${className}`}
      itemScope 
      itemType="https://schema.org/Article"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Summary
      </h2>
      
      {/* One-sentence summary */}
      <p 
        className="one-sentence-summary text-lg text-gray-800 mb-6 leading-relaxed"
        itemProp="abstract"
      >
        {oneSentenceSummary}
      </p>
      
      {/* Key takeaways */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Key Takeaways
          </h3>
          <ul className="key-takeaways space-y-2">
            {keyTakeaways.map((takeaway, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 text-gray-700"
              >
                <svg 
                  className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Related links */}
      {relatedLinks && relatedLinks.length > 0 && (
        <nav className="related-links">
          <h3 className="text-xl font-semibold mb-3 text-gray-900">
            Related
          </h3>
          <ul className="space-y-2">
            {relatedLinks.map((link, index) => (
              <li key={index}>
                <a 
                  href={link.url}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}

/**
 * CitationSignal Component
 * Marks data with source attribution for LLM credibility assessment
 */
export interface CitationSignalProps {
  children: React.ReactNode;
  source: "artist-verified" | "platform-verified" | "estimated" | "subjective";
  verifiedDate?: Date;
  className?: string;
}

export function CitationSignal({
  children,
  source,
  verifiedDate,
  className = ""
}: CitationSignalProps) {
  const sourceLabels = {
    "artist-verified": "Artist-verified",
    "platform-verified": "Platform-verified",
    "estimated": "Estimated",
    "subjective": "Subjective"
  };
  
  const sourceColors = {
    "artist-verified": "text-green-600",
    "platform-verified": "text-blue-600",
    "estimated": "text-yellow-600",
    "subjective": "text-gray-600"
  };
  
  const confidenceScores = {
    "artist-verified": 0.90,
    "platform-verified": 0.98,
    "estimated": 0.75,
    "subjective": 0.60
  };
  
  return (
    <span className={`citation-signal ${className}`}>
      {children}
      
      {/* Hidden metadata for LLM extraction */}
      <span className="nuance-signals" hidden>
        <meta itemProp="claimSource" content={source} />
        <meta itemProp="confidenceScore" content={confidenceScores[source].toString()} />
        {verifiedDate && (
          <meta itemProp="lastVerified" content={verifiedDate.toISOString()} />
        )}
      </span>
      
      {/* Visible attribution (optional, can be shown on hover) */}
      <span 
        className={`ml-1 text-xs ${sourceColors[source]}`}
        title={`${sourceLabels[source]}${verifiedDate ? ` - ${verifiedDate.toLocaleDateString()}` : ""}`}
      >
        ({sourceLabels[source]})
      </span>
    </span>
  );
}
