/**
 * DirectAnswerLayer Component
 * Above-the-fold answer optimized for AI answer engine citations
 * 
 * This is the PRIMARY answer that LLMs will extract and cite
 */

import { Helmet } from "react-helmet-async";

export interface DirectAnswerProps {
  question: string;
  answer: string;
  confidence: number;
  lastVerified: Date;
  audioUrl?: string;
  audioDuration?: number;
  className?: string;
}

export function DirectAnswerLayer({
  question,
  answer,
  confidence,
  lastVerified,
  audioUrl,
  audioDuration,
  className = ""
}: DirectAnswerProps) {
  const wordCount = answer.split(/\s+/).length;
  const isOptimalLength = wordCount >= 40 && wordCount <= 60;
  
  // Format last verified date
  const timeAgo = getTimeAgo(lastVerified);
  
  return (
    <>
      {/* Schema.org metadata for LLM extraction */}
      <Helmet>
        <meta itemProp="lastVerified" content={lastVerified.toISOString()} />
        <meta itemProp="confidenceScore" content={confidence.toFixed(2)} />
        <meta itemProp="dataFreshness" content="real-time" />
      </Helmet>
      
      <div 
        className={`direct-answer-layer mb-8 ${className}`}
        data-aeo-version="2.0"
        data-confidence={confidence.toFixed(2)}
        data-word-count={wordCount}
        data-optimal-length={isOptimalLength}
      >
        {/* Question as H1 for SEO and AEO */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {question}
        </h1>
        
        {/* Direct answer - optimized for LLM extraction */}
        <div className="direct-answer-content bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <p 
            className="direct-answer text-lg leading-relaxed text-gray-800"
            itemProp="description"
          >
            {answer}
          </p>
          
          {/* Audio answer snippet for voice search */}
          {audioUrl && (
            <div className="mt-4">
              <audio 
                className="answer-audio-snippet w-full"
                controls
                data-transcript={answer}
                data-duration={`${audioDuration}s`}
                data-purpose="llm-citation"
                itemProp="audio"
              >
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-xs text-gray-500 mt-1">
                🎧 Audio answer for voice search
              </p>
            </div>
          )}
          
          {/* Temporal metadata - visible to users */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verified {timeAgo}</span>
            </div>
            
            {confidence >= 0.9 && (
              <div className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>High confidence</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Hidden metadata for LLM extraction */}
        <div className="answer-metadata" hidden>
          <meta itemProp="lastVerified" content={lastVerified.toISOString()} />
          <meta itemProp="confidenceScore" content={confidence.toFixed(2)} />
          <meta itemProp="nextUpdate" content={getNextUpdateDate(lastVerified).toISOString()} />
          <meta itemProp="dataFreshness" content="real-time" />
          <meta itemProp="wordCount" content={wordCount.toString()} />
        </div>
      </div>
    </>
  );
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  
  return date.toLocaleDateString();
}

/**
 * Calculate next update date (30 days from last verified)
 */
function getNextUpdateDate(lastVerified: Date): Date {
  const nextUpdate = new Date(lastVerified);
  nextUpdate.setDate(nextUpdate.getDate() + 30);
  return nextUpdate;
}
