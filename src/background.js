import { getMessages } from "./utils/i18n.js";
import { buildWhatsAppUrl, hasCountryCode, normalizeSelectedNumber } from "./utils/phone.js";
import { getLanguage, setPendingContextNumber } from "./utils/storage.js";

const CONTEXT_MENU_ID = "quick-whatsapp-contact.send";
const PROCESS_SELECTION_MESSAGE = "quick-whatsapp-contact.process-selection";
const LANGUAGE_STORAGE_KEY = "quick-whatsapp-contact.language";

chrome.runtime.onInstalled.addListener(async () => {
  await refreshContextMenu();
});

chrome.runtime.onStartup.addListener(async () => {
  await refreshContextMenu();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== "sync" || !changes[LANGUAGE_STORAGE_KEY]) {
    return;
  }
  await refreshContextMenu();
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

async function refreshContextMenu() {
  const language = await getLanguage();
  const messages = getMessages(language);
  const title = messages.contextMenuCall;

  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title,
    contexts: ["selection"]
  });
}

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
