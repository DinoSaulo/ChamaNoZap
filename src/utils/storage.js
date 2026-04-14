const LAST_COUNTRY_STORAGE_KEY = "quick-whatsapp-contact.last-country";
const PENDING_CONTEXT_NUMBER_KEY = "quick-whatsapp-contact.pending-context-number";

export async function saveLastCountry(countryCode) {
  await chrome.storage.sync.set({ [LAST_COUNTRY_STORAGE_KEY]: countryCode });
}

export async function getLastCountry() {
  const result = await chrome.storage.sync.get(LAST_COUNTRY_STORAGE_KEY);
  return result[LAST_COUNTRY_STORAGE_KEY];
}

export async function setPendingContextNumber(phoneNumber) {
  await chrome.storage.session.set({ [PENDING_CONTEXT_NUMBER_KEY]: phoneNumber });
}

export async function consumePendingContextNumber() {
  const result = await chrome.storage.session.get(PENDING_CONTEXT_NUMBER_KEY);
  await chrome.storage.session.remove(PENDING_CONTEXT_NUMBER_KEY);
  return result[PENDING_CONTEXT_NUMBER_KEY] ?? "";
}
