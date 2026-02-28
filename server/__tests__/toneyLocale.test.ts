import { describe, it, expect } from "vitest";
import { buildLocaleContext } from "../toneyLocale";

describe("buildLocaleContext", () => {
  it("returns a locale context block for a known country (Nigeria)", () => {
    const result = buildLocaleContext("NG");
    expect(result).toContain("[LOCALE CONTEXT]");
    expect(result).toContain("Nigeria");
    expect(result).toContain("Afrobeats");
    expect(result).toContain("Detty December");
    expect(result).toContain("texture layer");
  });

  it("returns a locale context block for the US", () => {
    const result = buildLocaleContext("US");
    expect(result).toContain("United States");
    expect(result).toContain("North America");
    expect(result).toContain("Billboard");
  });

  it("returns a locale context block for the UK", () => {
    const result = buildLocaleContext("GB");
    expect(result).toContain("United Kingdom");
    expect(result).toContain("Grime");
    expect(result).toContain("BRIT Awards");
  });

  it("returns a locale context block for South Korea", () => {
    const result = buildLocaleContext("KR");
    expect(result).toContain("South Korea");
    expect(result).toContain("K-Pop");
    expect(result).toContain("comeback");
  });

  it("returns a locale context block for Brazil", () => {
    const result = buildLocaleContext("BR");
    expect(result).toContain("Brazil");
    expect(result).toContain("Carnival");
    expect(result).toContain("Portuguese");
  });

  it("handles lowercase country codes", () => {
    const result = buildLocaleContext("ng");
    expect(result).toContain("Nigeria");
  });

  it("returns a neutral default for an unknown country code", () => {
    const result = buildLocaleContext("ZZ");
    expect(result).toContain("[LOCALE CONTEXT]");
    expect(result).toContain("ZZ");
    expect(result).toContain("globally accessible language");
  });

  it("returns a neutral default when country is null", () => {
    const result = buildLocaleContext(null);
    expect(result).toContain("[LOCALE CONTEXT]");
    expect(result).toContain("globally accessible language");
  });

  it("includes Accept-Language hint in default profile when country is unknown", () => {
    const result = buildLocaleContext("XX", "fr-FR,fr;q=0.9,en;q=0.8");
    expect(result).toContain("fr-FR");
  });

  it("includes the instruction not to make assumptions based on location", () => {
    const result = buildLocaleContext("NG");
    expect(result).toContain("do not make assumptions about what genre the artist makes");
  });

  it("covers all key global markets", () => {
    const markets = ["US", "CA", "GB", "IE", "NG", "GH", "KE", "ZA", "FR", "DE", "BR", "MX", "CO", "JP", "KR", "AU", "IN", "AE"];
    for (const code of markets) {
      const result = buildLocaleContext(code);
      expect(result).toContain("[LOCALE CONTEXT]");
      expect(result.length).toBeGreaterThan(100);
    }
  });

  it("does not mention competing platforms in any locale profile", () => {
    const competitors = ["Spotify", "Apple Music", "TikTok", "Instagram", "YouTube Music"];
    const markets = ["US", "NG", "KR", "BR", "GB", "IN"];
    for (const code of markets) {
      const result = buildLocaleContext(code);
      for (const competitor of competitors) {
        expect(result).not.toContain(competitor);
      }
    }
  });

  it("release timing note does not enforce Friday as a hard rule", () => {
    const result = buildLocaleContext("US");
    expect(result).not.toContain("must release on Friday");
    expect(result).toContain("not a hard rule");
  });
});
