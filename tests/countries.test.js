import { COUNTRIES, getCountryByCode } from "../src/utils/countries.js";
import { describe, expect, it } from "vitest";

describe("countries ddi list", () => {
  it("mantem uma lista extensa de países e territorios", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(200);
  });

  it("inclui opções de DDI para Porto Rico", () => {
    const puertoRico = COUNTRIES.filter((country) => country.name === "Porto Rico");
    expect(puertoRico.map((country) => country.dialCode)).toEqual(["1-787", "1-939"]);
  });

  it("inclui opções de DDI para Republica Dominicana", () => {
    const dominicanRepublic = COUNTRIES.filter(
      (country) => country.name === "Republica Dominicana"
    );
    expect(dominicanRepublic.map((country) => country.dialCode)).toEqual([
      "1-809",
      "1-829",
      "1-849"
    ]);
  });

  it("recupera o Brasil pelo código padrão", () => {
    expect(getCountryByCode("BR")?.dialCode).toBe("55");
  });
});
