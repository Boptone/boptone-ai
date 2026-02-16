#!/usr/bin/env node
/**
 * Auto-translate Boptone UI strings to 9 languages using LLM API
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Language configurations
const LANGUAGES = {
  'es': 'Spanish (Latin America)',
  'pt': 'Portuguese (Brazilian)',
  'fr': 'French',
  'de': 'German',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'hi': 'Hindi',
  'ar': 'Arabic',
};

// Use built-in fetch and environment variables
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function translateBatch(texts, targetLanguage) {
  const textsJson = JSON.stringify(texts, null, 2);
  
  const prompt = `Translate the following JSON object from English to ${targetLanguage}.

CRITICAL RULES:
1. Preserve ALL keys exactly as they are (do not translate keys)
2. Translate ONLY the values
3. Preserve {{variable}} placeholders exactly (e.g., {{year}}, {{name}}, {{provider}})
4. Maintain professional, neutral tone suitable for a global music platform
5. Return ONLY valid JSON, no explanations

Input JSON:
${textsJson}

Output (translated JSON):`;

  try {
    const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORGE_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a professional translator. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;
    const translated = JSON.parse(translatedText);
    return translated;
    
  } catch (error) {
    console.error(`Error translating to ${targetLanguage}:`, error);
    return null;
  }
}

async function main() {
  // Read English translation file
  const enPath = '/home/ubuntu/boptone/client/public/locales/en/translation.json';
  const enTranslations = JSON.parse(readFileSync(enPath, 'utf-8'));
  
  console.log(`Loaded ${JSON.stringify(enTranslations).length} characters of English text`);
  console.log(`Translating to ${Object.keys(LANGUAGES).length} languages...\n`);
  
  // Translate to each language
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    console.log(`Translating to ${langName} (${langCode})...`);
    
    // Translate the entire nested structure
    const translated = await translateBatch(enTranslations, langName);
    
    if (translated) {
      // Write to file
      const outputPath = `/home/ubuntu/boptone/client/public/locales/${langCode}/translation.json`;
      mkdirSync(dirname(outputPath), { recursive: true });
      
      writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
      
      console.log(`✓ Saved ${langName} translation to ${outputPath}\n`);
    } else {
      console.log(`✗ Failed to translate to ${langName}\n`);
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Translation complete!');
}

main().catch(console.error);
