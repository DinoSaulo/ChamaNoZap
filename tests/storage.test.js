import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  saveLastCountry,
  getLastCountry,
  setPendingContextNumber,
  consumePendingContextNumber,
  getAutoHighlightEnabled,
  setAutoHighlightEnabled
} from "../src/utils/storage.js";

describe("storage utils", () => {
  beforeEach(() => {
    const mockStorage = {
      sync: {
        get: vi.fn(),
        set: vi.fn()
      },
      session: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
      }
    };
    vi.stubGlobal("chrome", { storage: mockStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saveLastCountry salva o pais no storage sync", async () => {
    await saveLastCountry("55");
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      "quick-whatsapp-contact.last-country": "55"
    });
  });

  it("getLastCountry retorna o pais do storage sync", async () => {
    chrome.storage.sync.get.mockResolvedValue({
      "quick-whatsapp-contact.last-country": "351"
    });
    const result = await getLastCountry();
    expect(chrome.storage.sync.get).toHaveBeenCalledWith("quick-whatsapp-contact.last-country");
    expect(result).toBe("351");
  });

  it("setPendingContextNumber salva o numero no storage session", async () => {
    await setPendingContextNumber("11999999999");
    expect(chrome.storage.session.set).toHaveBeenCalledWith({
      "quick-whatsapp-contact.pending-context-number": "11999999999"
    });
  });

  it("consumePendingContextNumber retorna e remove o numero do storage session", async () => {
    chrome.storage.session.get.mockResolvedValue({
      "quick-whatsapp-contact.pending-context-number": "11999999999"
    });
    const result = await consumePendingContextNumber();
    expect(chrome.storage.session.get).toHaveBeenCalledWith("quick-whatsapp-contact.pending-context-number");
    expect(chrome.storage.session.remove).toHaveBeenCalledWith("quick-whatsapp-contact.pending-context-number");
    expect(result).toBe("11999999999");
  });

  it("consumePendingContextNumber retorna string vazia se nao houver numero", async () => {
    chrome.storage.session.get.mockResolvedValue({});
    const result = await consumePendingContextNumber();
    expect(result).toBe("");
  });

  it("getAutoHighlightEnabled retorna true por padrao se nao houver valor salvo", async () => {
    chrome.storage.sync.get.mockResolvedValue({});
    const result = await getAutoHighlightEnabled();
    expect(result).toBe(true);
  });

  it("getAutoHighlightEnabled retorna o valor booleano salvo", async () => {
    chrome.storage.sync.get.mockResolvedValue({
      "quick-whatsapp-contact.auto-highlight-enabled": false
    });
    const result = await getAutoHighlightEnabled();
    expect(result).toBe(false);
  });

  it("setAutoHighlightEnabled salva o booleano no storage sync", async () => {
    await setAutoHighlightEnabled(false);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      "quick-whatsapp-contact.auto-highlight-enabled": false
    });
  });
});
