import { detectCountryCodeFromBrowserLocation, detectCountryCodeFromUrl } from "../src/utils/location.js";
import { describe, expect, it } from "vitest";

describe("browser location detection", () => {
  it("usa o region code da linguagem principal quando disponivel", () => {
    expect(
      detectCountryCodeFromBrowserLocation({
        languages: ["pt-BR", "en-US"],
        language: "en-US"
      })
    ).toBe("BR");
  });

  it("resolve UK para GB", () => {
    expect(
      detectCountryCodeFromBrowserLocation({
        languages: ["en-UK"],
        language: "en-UK"
      })
    ).toBe("GB");
  });

  it("usa fallback +1 (US) quando não consegue identificar o país", () => {
    expect(
      detectCountryCodeFromBrowserLocation({
        languages: ["en"],
        language: "en"
      })
    ).toBe("US");
  });
});

describe("URL TLD detection", () => {
  it("detects BR from .br and .com.br", () => {
    expect(detectCountryCodeFromUrl("https://example.com.br/path")).toBe("BR");
    expect(detectCountryCodeFromUrl("http://gov.br")).toBe("BR");
  });

  it("detects PT from .pt", () => {
    expect(detectCountryCodeFromUrl("https://www.site.pt")).toBe("PT");
  });

  it("returns empty string for non-country specific TLDs like .com or .org", () => {
    expect(detectCountryCodeFromUrl("https://google.com")).toBe("");
    expect(detectCountryCodeFromUrl("https://wikipedia.org")).toBe("");
  });

  it("returns empty string for invalid URLs", () => {
    expect(detectCountryCodeFromUrl("not-a-url")).toBe("");
    expect(detectCountryCodeFromUrl("")).toBe("");
    expect(detectCountryCodeFromUrl(null)).toBe("");
  });
});
