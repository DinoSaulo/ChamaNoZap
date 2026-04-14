import {
  buildWhatsAppUrl,
  hasCountryCode,
  normalizeSelectedNumber
} from "./utils/phone.js";
import { setPendingContextNumber } from "./utils/storage.js";

const CONTEXT_MENU_ID = "quick-whatsapp-contact.send";
const PROCESS_SELECTION_MESSAGE = "quick-whatsapp-contact.process-selection";

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

  await processSelection(info.selectionText);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== PROCESS_SELECTION_MESSAGE) {
    return;
  }

  processSelection(message.selectionText)
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: String(error) }));

  return true;
});

async function processSelection(selectionText) {
  const sanitizedNumber = normalizeSelectedNumber(selectionText);
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
}

async function openWhatsAppTab(url) {
  return chrome.tabs.create({ url, active: true });
}
