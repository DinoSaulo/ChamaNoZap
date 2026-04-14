import { detectCountryCodeFromBrowserLocation } from "../src/utils/location.js";
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

  it("usa fallback +1 (US) quando nao consegue identificar o pais", () => {
    expect(
      detectCountryCodeFromBrowserLocation({
        languages: ["en"],
        language: "en"
      })
    ).toBe("US");
  });
});
