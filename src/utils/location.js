import { DEFAULT_COUNTRY_CODE, getCountryByIso2 } from "./countries.js";

const REGION_NORMALIZATION_MAP = {
  UK: "GB"
};

function normalizeRegion(region = "") {
  const normalized = String(region || "").toUpperCase();
  return REGION_NORMALIZATION_MAP[normalized] || normalized;
}

function extractRegionFromLocale(localeValue = "") {
  const locale = String(localeValue || "");
  if (!locale) {
    return "";
  }

  try {
    if (typeof Intl?.Locale === "function") {
      const parsedLocale = new Intl.Locale(locale);
      if (parsedLocale.region) {
        return normalizeRegion(parsedLocale.region);
      }
    }
  } catch {}

  const normalizedLocale = locale.replace(/_/g, "-");
  const tokens = normalizedLocale.split("-");
  const regionToken = tokens.find((token) => /^[A-Za-z]{2}$/.test(token) || /^\d{3}$/.test(token));
  return normalizeRegion(regionToken || "");
}

export function detectCountryCodeFromBrowserLocation(input = {}) {
  const localeCandidates = [
    ...(Array.isArray(input.languages) ? input.languages : []),
    input.language || ""
  ].filter(Boolean);

  for (const localeCandidate of localeCandidates) {
    const region = extractRegionFromLocale(localeCandidate);
    if (!region) {
      continue;
    }

    const country = getCountryByIso2(region);
    if (country?.code) {
      return country.code;
    }
  }

  return DEFAULT_COUNTRY_CODE;
}
