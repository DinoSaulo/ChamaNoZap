import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  saveLastCountry,
  getLastCountry,
  setPendingContextNumber,
  consumePendingContextNumber
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

  it("saveLastCountry salva o país no storage sync", async () => {
    await saveLastCountry("55");
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      "quick-whatsapp-contact.last-country": "55"
    });
  });

  it("getLastCountry retorna o país do storage sync", async () => {
    chrome.storage.sync.get.mockResolvedValue({
      "quick-whatsapp-contact.last-country": "351"
    });
    const result = await getLastCountry();
    expect(chrome.storage.sync.get).toHaveBeenCalledWith("quick-whatsapp-contact.last-country");
    expect(result).toBe("351");
  });

  it("setPendingContextNumber salva o número no storage session", async () => {
    await setPendingContextNumber("11999999999");
    expect(chrome.storage.session.set).toHaveBeenCalledWith({
      "quick-whatsapp-contact.pending-context-number": "11999999999"
    });
  });

  it("consumePendingContextNumber retorna e remove o número do storage session", async () => {
    chrome.storage.session.get.mockResolvedValue({
      "quick-whatsapp-contact.pending-context-number": "11999999999"
    });
    const result = await consumePendingContextNumber();
    expect(chrome.storage.session.get).toHaveBeenCalledWith("quick-whatsapp-contact.pending-context-number");
    expect(chrome.storage.session.remove).toHaveBeenCalledWith("quick-whatsapp-contact.pending-context-number");
    expect(result).toBe("11999999999");
  });

  it("consumePendingContextNumber retorna string vazia se não houver número", async () => {
    chrome.storage.session.get.mockResolvedValue({});
    const result = await consumePendingContextNumber();
    expect(result).toBe("");
  });
});
