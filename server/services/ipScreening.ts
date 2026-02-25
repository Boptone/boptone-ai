/**
 * IP Screening Service
 * AI-powered copyright and trademark detection for BopShop product designs
 * 
 * Features:
 * - Google Vision API: Logo detection, text extraction, safe search
 * - AWS Rekognition: Celebrity face detection
 * - Perceptual hashing: Image similarity matching against known copyrighted images
 * - Confidence scoring: Aggregate AI results into single score
 */

import { ENV } from '../_core/env';

// ============================================================================
// TYPES
// ============================================================================

export interface ScreeningResult {
  screeningStatus: 'approved' | 'rejected' | 'flagged';
  aiConfidenceScore: number; // 0-100
  detectedLogos: Array<{ name: string; confidence: number }>;
  detectedCelebrities: Array<{ name: string; confidence: number }>;
  detectedText: string[];
  perceptualHashSimilarity: number; // 0-100
  matchedCopyrightedImages: Array<{ name: string; similarity: number }>;
  flaggedReason?: string;
}

interface GoogleVisionLogoDetection {
  description: string;
  score: number;
}

interface GoogleVisionTextDetection {
  description: string;
}

interface AWSRekognitionCelebrity {
  Name: string;
  MatchConfidence: number;
}

// ============================================================================
// GOOGLE VISION API INTEGRATION
// ============================================================================

/**
 * Detect logos in image using Google Vision API
 * Detects trademarked logos (Nike, Disney, etc.)
 */
export async function detectLogos(imageUrl: string): Promise<Array<{ name: string; confidence: number }>> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    console.warn('[IP Screening] GOOGLE_VISION_API_KEY not set, skipping logo detection');
    return [];
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [{ type: 'LOGO_DETECTION', maxResults: 10 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const logos = data.responses[0]?.logoAnnotations || [];

    return logos.map((logo: GoogleVisionLogoDetection) => ({
      name: logo.description,
      confidence: logo.score * 100, // Convert 0-1 to 0-100
    }));
  } catch (error) {
    console.error('[IP Screening] Logo detection failed:', error);
    return [];
  }
}

/**
 * Extract text from image using Google Vision API
 * Detects brand names, slogans, copyrighted text
 */
export async function detectText(imageUrl: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    console.warn('[IP Screening] GOOGLE_VISION_API_KEY not set, skipping text detection');
    return [];
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [{ type: 'TEXT_DETECTION', maxResults: 10 }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const textAnnotations = (data.responses[0]?.textAnnotations || []) as GoogleVisionTextDetection[];

    // First annotation is full text, rest are individual words
    const detectedText = textAnnotations.map((text) => text.description);
    
    // Remove duplicates and filter out single characters
    return [...new Set(detectedText)].filter(text => text.length > 1);
  } catch (error) {
    console.error('[IP Screening] Text detection failed:', error);
    return [];
  }
}

/**
 * Check image for explicit content using Google Vision API
 * Detects adult, violent, racy content
 */
export async function detectSafeSearch(imageUrl: string): Promise<{
  adult: string;
  violence: string;
  racy: string;
}> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    console.warn('[IP Screening] GOOGLE_VISION_API_KEY not set, skipping safe search');
    return { adult: 'UNKNOWN', violence: 'UNKNOWN', racy: 'UNKNOWN' };
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: imageUrl } },
              features: [{ type: 'SAFE_SEARCH_DETECTION' }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const safeSearch = data.responses[0]?.safeSearchAnnotation || {};

    return {
      adult: safeSearch.adult || 'UNKNOWN',
      violence: safeSearch.violence || 'UNKNOWN',
      racy: safeSearch.racy || 'UNKNOWN',
    };
  } catch (error) {
    console.error('[IP Screening] Safe search failed:', error);
    return { adult: 'UNKNOWN', violence: 'UNKNOWN', racy: 'UNKNOWN' };
  }
}

// ============================================================================
// AWS REKOGNITION INTEGRATION
// ============================================================================

/**
 * Detect celebrity faces in image using AWS Rekognition
 * Detects unauthorized use of celebrity likenesses
 */
export async function detectCelebrities(imageUrl: string): Promise<Array<{ name: string; confidence: number }>> {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!accessKeyId || !secretAccessKey) {
    console.warn('[IP Screening] AWS credentials not set, skipping celebrity detection');
    return [];
  }

  try {
    // Download image to buffer (AWS Rekognition requires image bytes)
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // AWS Rekognition API call (simplified - would use AWS SDK in production)
    // For now, return empty array until AWS SDK is integrated
    console.log('[IP Screening] Celebrity detection not yet implemented (requires AWS SDK)');
    return [];
  } catch (error) {
    console.error('[IP Screening] Celebrity detection failed:', error);
    return [];
  }
}

// ============================================================================
// PERCEPTUAL HASHING (Image Similarity)
// ============================================================================

/**
 * Generate perceptual hash for image
 * Used to detect modified versions of copyrighted images
 * 
 * TODO: Integrate perceptual hashing library (pHash, imagehash, etc.)
 */
export async function generatePerceptualHash(imageUrl: string): Promise<string> {
  console.log('[IP Screening] Perceptual hashing not yet implemented');
  return '';
}

/**
 * Compare image hash against database of known copyrighted images
 * Returns similarity score (0-100) and matched images
 */
export async function compareToKnownImages(hash: string): Promise<{
  similarity: number;
  matches: Array<{ name: string; similarity: number }>;
}> {
  console.log('[IP Screening] Known image comparison not yet implemented');
  return { similarity: 0, matches: [] };
}

// ============================================================================
// MAIN SCREENING ORCHESTRATOR
// ============================================================================

/**
 * Screen design for IP infringement
 * Aggregates results from all AI services and calculates confidence score
 * 
 * Confidence Score Logic:
 * - 0-50: Approved (low risk)
 * - 51-79: Flagged for human review (medium risk)
 * - 80-100: Rejected (high risk)
 */
export async function screenDesign(imageUrl: string): Promise<ScreeningResult> {
  console.log('[IP Screening] Starting screening for:', imageUrl);

  // Run all AI services in parallel
  const [logos, text, safeSearch, celebrities] = await Promise.all([
    detectLogos(imageUrl),
    detectText(imageUrl),
    detectSafeSearch(imageUrl),
    detectCelebrities(imageUrl),
  ]);

  // Perceptual hashing (TODO: implement)
  const perceptualHash = await generatePerceptualHash(imageUrl);
  const knownImageComparison = await compareToKnownImages(perceptualHash);

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore({
    logos,
    text,
    safeSearch,
    celebrities,
    perceptualHashSimilarity: knownImageComparison.similarity,
  });

  // Determine screening status
  let screeningStatus: 'approved' | 'rejected' | 'flagged';
  let flaggedReason: string | undefined;

  if (confidenceScore >= 80) {
    screeningStatus = 'rejected';
    flaggedReason = generateFlaggedReason({ logos, text, celebrities, perceptualHashSimilarity: knownImageComparison.similarity });
  } else if (confidenceScore >= 51) {
    screeningStatus = 'flagged';
    flaggedReason = generateFlaggedReason({ logos, text, celebrities, perceptualHashSimilarity: knownImageComparison.similarity });
  } else {
    screeningStatus = 'approved';
  }

  const result: ScreeningResult = {
    screeningStatus,
    aiConfidenceScore: confidenceScore,
    detectedLogos: logos,
    detectedCelebrities: celebrities,
    detectedText: text,
    perceptualHashSimilarity: knownImageComparison.similarity,
    matchedCopyrightedImages: knownImageComparison.matches,
    flaggedReason,
  };

  console.log('[IP Screening] Result:', {
    status: screeningStatus,
    confidence: confidenceScore,
    logosCount: logos.length,
    textCount: text.length,
    celebritiesCount: celebrities.length,
  });

  return result;
}

/**
 * Calculate aggregate confidence score from AI results
 * Higher score = higher risk of IP infringement
 */
function calculateConfidenceScore(data: {
  logos: Array<{ name: string; confidence: number }>;
  text: string[];
  safeSearch: { adult: string; violence: string; racy: string };
  celebrities: Array<{ name: string; confidence: number }>;
  perceptualHashSimilarity: number;
}): number {
  let score = 0;

  // Logo detection (0-40 points)
  if (data.logos.length > 0) {
    const maxLogoConfidence = Math.max(...data.logos.map(l => l.confidence));
    score += (maxLogoConfidence / 100) * 40;
  }

  // Celebrity detection (0-30 points)
  if (data.celebrities.length > 0) {
    const maxCelebrityConfidence = Math.max(...data.celebrities.map(c => c.confidence));
    score += (maxCelebrityConfidence / 100) * 30;
  }

  // Perceptual hash similarity (0-20 points)
  score += (data.perceptualHashSimilarity / 100) * 20;

  // Text detection (0-10 points)
  // Check for known copyrighted phrases
  const copyrightedPhrases = ['nike', 'disney', 'marvel', 'supreme', 'adidas', 'gucci', 'louis vuitton'];
  const detectedCopyrightedText = data.text.filter(text =>
    copyrightedPhrases.some(phrase => text.toLowerCase().includes(phrase))
  );
  if (detectedCopyrightedText.length > 0) {
    score += 10;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Generate human-readable reason for flagging/rejection
 */
function generateFlaggedReason(data: {
  logos: Array<{ name: string; confidence: number }>;
  text: string[];
  celebrities: Array<{ name: string; confidence: number }>;
  perceptualHashSimilarity: number;
}): string {
  const reasons: string[] = [];

  if (data.logos.length > 0) {
    const logoNames = data.logos.map(l => l.name).join(', ');
    reasons.push(`Detected trademarked logos: ${logoNames}`);
  }

  if (data.celebrities.length > 0) {
    const celebrityNames = data.celebrities.map(c => c.name).join(', ');
    reasons.push(`Detected celebrity faces: ${celebrityNames}`);
  }

  if (data.perceptualHashSimilarity > 70) {
    reasons.push(`High similarity (${data.perceptualHashSimilarity}%) to known copyrighted images`);
  }

  const copyrightedPhrases = ['nike', 'disney', 'marvel', 'supreme', 'adidas', 'gucci', 'louis vuitton'];
  const detectedCopyrightedText = data.text.filter(text =>
    copyrightedPhrases.some(phrase => text.toLowerCase().includes(phrase))
  );
  if (detectedCopyrightedText.length > 0) {
    reasons.push(`Detected copyrighted text: ${detectedCopyrightedText.join(', ')}`);
  }

  return reasons.join('. ');
}
