#!/usr/bin/env node
/**
 * Translate Boptone UI strings section by section to avoid JSON parsing errors
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

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

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

async function translateSection(sectionName, sectionData, targetLanguage) {
  const sectionJson = JSON.stringify(sectionData, null, 2);
  
  const prompt = `Translate this JSON section "${sectionName}" from English to ${targetLanguage}.

RULES:
1. Keep all keys unchanged
2. Translate only values
3. Preserve {{placeholders}}
4. Professional tone
5. Return valid JSON only

${sectionJson}`;

  try {
    const response = await fetch(`${FORGE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FORGE_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Professional translator. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const translated = JSON.parse(data.choices[0].message.content);
    return translated;
    
  } catch (error) {
    console.error(`  ✗ Error translating ${sectionName}:`, error.message);
    return null;
  }
}

async function main() {
  const enPath = '/home/ubuntu/boptone/client/public/locales/en/translation.json';
  const enData = JSON.parse(readFileSync(enPath, 'utf-8'));
  
  const sections = Object.keys(enData);
  console.log(`Translating ${sections.length} sections to ${Object.keys(LANGUAGES).length} languages\n`);
  
  for (const [langCode, langName] of Object.entries(LANGUAGES)) {
    console.log(`${langName} (${langCode}):`);
    const translated = {};
    
    for (const section of sections) {
      process.stdout.write(`  ${section}...`);
      const result = await translateSection(section, enData[section], langName);
      
      if (result) {
        translated[section] = result;
        console.log(' ✓');
      } else {
        // Fallback to English if translation fails
        translated[section] = enData[section];
        console.log(' ✗ (using English)');
      }
      
      // Small delay between sections
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Write complete file
    const outputPath = `/home/ubuntu/boptone/client/public/locales/${langCode}/translation.json`;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
    console.log(`  Saved to ${outputPath}\n`);
    
    // Delay between languages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Translation complete!');
}

main().catch(console.error);
