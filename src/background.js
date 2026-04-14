import {
  buildWhatsAppUrl,
  hasCountryCode,
  normalizeSelectedNumber
} from "./utils/phone.js";
import { setPendingContextNumber } from "./utils/storage.js";

const CONTEXT_MENU_ID = "quick-whatsapp-contact.send";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Chamar no WhatsApp",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText) {
    return;
  }

  const sanitizedNumber = normalizeSelectedNumber(info.selectionText);

  if (!sanitizedNumber) {
    return;
  }

  if (hasCountryCode(sanitizedNumber)) {
    const url = buildWhatsAppUrl(sanitizedNumber);
    if (!url) {
      return;
    }

    await openWhatsAppTab(url);
    return;
  }

  await setPendingContextNumber(sanitizedNumber);
  await chrome.action.openPopup();
});

async function openWhatsAppTab(url) {
  return chrome.tabs.create({ url, active: true });
}
