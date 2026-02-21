import { describe, it, expect } from "vitest";
import { validateHuggingFaceAPIKey } from "./aiDetection";

describe("Hugging Face AI Detection", () => {
  it("should validate API key successfully", async () => {
    console.log("Testing Hugging Face API key validation...");
    console.log("API Key exists:", !!process.env.HUGGINGFACE_API_KEY);
    console.log("API Key prefix:", process.env.HUGGINGFACE_API_KEY?.substring(0, 6));
    
    const isValid = await validateHuggingFaceAPIKey();
    console.log("Validation result:", isValid);
    
    expect(isValid).toBe(true);
  }, 30000); // 30 second timeout for API call
});
