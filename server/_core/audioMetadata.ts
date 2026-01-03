import { invokeLLM } from "./llm";

/**
 * Extract metadata from audio file using AI
 * This is a simplified version - in production, you'd use audio analysis libraries
 * combined with LLM for better accuracy
 */
export async function extractAudioMetadata(params: {
  filename: string;
  fileSize: number;
  duration?: number;
}): Promise<{
  title: string;
  artist: string;
  genre: string;
  bpm?: number;
  key?: string;
  mood?: string;
}> {
  try {
    // Use LLM to extract metadata from filename
    // In production, you'd also analyze the audio waveform, spectral data, etc.
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert music metadata extractor. Given a filename, extract likely metadata. Return ONLY valid JSON with no markdown formatting.",
        },
        {
          role: "user",
          content: `Extract metadata from this audio filename: "${params.filename}"\n\nReturn JSON with: title, artist, genre (Hip-Hop/Pop/Rock/Electronic/R&B/Country/Jazz/Classical/Other), bpm (number or null), key (musical key like C, Am, etc. or null), mood (energetic/chill/dark/uplifting/melancholic/etc or null)`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "audio_metadata",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Song title" },
              artist: { type: "string", description: "Artist name" },
              genre: { type: "string", description: "Music genre" },
              bpm: { type: ["number", "null"], description: "Beats per minute" },
              key: { type: ["string", "null"], description: "Musical key" },
              mood: { type: ["string", "null"], description: "Song mood/vibe" },
            },
            required: ["title", "artist", "genre"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    // Handle content as string (it's always a string with json_schema response format)
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const metadata = JSON.parse(contentStr);
    
    return {
      title: metadata.title || "Untitled",
      artist: metadata.artist || "Unknown Artist",
      genre: metadata.genre || "Other",
      bpm: metadata.bpm || undefined,
      key: metadata.key || undefined,
      mood: metadata.mood || undefined,
    };
  } catch (error) {
    console.error("[AI Metadata] Extraction failed:", error);
    
    // Fallback: basic filename parsing
    const cleanFilename = params.filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[-_]/g, " ") // Replace dashes/underscores with spaces
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
    
    return {
      title: cleanFilename || "Untitled",
      artist: "Unknown Artist",
      genre: "Other",
    };
  }
}
