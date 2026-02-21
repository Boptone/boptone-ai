/**
 * FAQSection Component
 * Renders FAQ items with FAQPage schema for AI answer engine citations
 */

import { Helmet } from "react-helmet-async";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  faqs: FAQItem[];
  pageUrl: string;
  className?: string;
}

export function FAQSection({ faqs, pageUrl, className = "" }: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;
  
  // Generate FAQPage schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "dateModified": new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "Boptone",
          "url": "https://boptone.com"
        }
      }
    })),
    "url": pageUrl,
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  };
  
  return (
    <>
      {/* Inject FAQPage schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      <section className={`faq-section ${className}`} itemScope itemType="https://schema.org/FAQPage">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="query-cluster bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              itemScope 
              itemType="https://schema.org/Question"
              itemProp="mainEntity"
            >
              <h3 
                className="text-xl font-semibold mb-3 text-gray-900"
                itemProp="name"
              >
                {faq.question}
              </h3>
              
              <div 
                itemScope 
                itemType="https://schema.org/Answer" 
                itemProp="acceptedAnswer"
              >
                <p 
                  className="section-answer text-gray-700 leading-relaxed"
                  itemProp="text"
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * PredictedQueriesSection - For query intent prediction
 * Displays pre-answered follow-up questions
 */
export interface PredictedQuery {
  question: string;
  answer: string;
  priority: number;
}

export interface PredictedQueriesSectionProps {
  queries: PredictedQuery[];
  className?: string;
}

export function PredictedQueriesSection({ queries, className = "" }: PredictedQueriesSectionProps) {
  if (!queries || queries.length === 0) return null;
  
  return (
    <section className={`predicted-queries ${className}`}>
      <h2 className="text-3xl font-bold mb-6 text-gray-900">
        Related Questions
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {queries.map((query, index) => (
          <div 
            key={index}
            className="query-cluster bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5"
            itemScope 
            itemType="https://schema.org/Question"
          >
            <h3 
              className="text-lg font-semibold mb-2 text-gray-900"
              itemProp="name"
            >
              {query.question}
            </h3>
            
            <div 
              itemScope 
              itemType="https://schema.org/Answer" 
              itemProp="acceptedAnswer"
            >
              <p 
                className="quick-answer text-gray-700"
                itemProp="text"
              >
                {query.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
