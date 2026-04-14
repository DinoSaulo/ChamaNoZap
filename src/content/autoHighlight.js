(function () {
  const PROCESS_SELECTION_MESSAGE = "quick-whatsapp-contact.process-selection";
  const AUTO_HIGHLIGHT_STORAGE_KEY = "quick-whatsapp-contact.auto-highlight-enabled";
  const PHONE_MATCH_REGEX = /(?:\+?\d[\d().\s-]{6,}\d)/g;
  const MAX_TEXT_LENGTH = 1000;
  const ROOT_CLASS = "qwc-phone-root";
  const BUTTON_CLASS = "qwc-phone-action";
  const PHONE_TEXT_CLASS = "qwc-phone-text";

  let isEnabled = true;
  let observer = null;
  let mutationTimer = null;

  injectStyles();
  initialize();

  async function initialize() {
    isEnabled = await readIsEnabled();
    if (isEnabled) {
      scanDocument();
      attachObserver();
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes[AUTO_HIGHLIGHT_STORAGE_KEY]) {
        return;
      }

      isEnabled = Boolean(changes[AUTO_HIGHLIGHT_STORAGE_KEY].newValue);
      if (isEnabled) {
        scanDocument();
        attachObserver();
      } else {
        detachObserver();
        clearHighlights();
      }
    });
  }

  async function readIsEnabled() {
    const result = await chrome.storage.sync.get(AUTO_HIGHLIGHT_STORAGE_KEY);
    if (typeof result[AUTO_HIGHLIGHT_STORAGE_KEY] === "boolean") {
      return result[AUTO_HIGHLIGHT_STORAGE_KEY];
    }
    return true;
  }

  function injectStyles() {
    if (document.getElementById("qwc-highlight-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "qwc-highlight-style";
    style.textContent = `
      .${ROOT_CLASS} {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .${BUTTON_CLASS} {
        width: 16px;
        height: 16px;
        border: none;
        padding: 0;
        margin: 0;
        background: transparent;
        cursor: pointer;
        vertical-align: middle;
      }

      .${BUTTON_CLASS} img {
        display: block;
        width: 16px;
        height: 16px;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function attachObserver() {
    if (observer) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      if (mutationTimer) {
        clearTimeout(mutationTimer);
      }

      mutationTimer = window.setTimeout(() => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((addedNode) => {
            processNode(addedNode);
          });
        }
      }, 120);
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function detachObserver() {
    if (!observer) {
      return;
    }
    observer.disconnect();
    observer = null;
  }

  function clearHighlights() {
    const highlights = document.querySelectorAll(`.${ROOT_CLASS}`);
    highlights.forEach((root) => {
      const phoneText = root.querySelector(`.${PHONE_TEXT_CLASS}`);
      if (!phoneText || !root.parentNode) {
        return;
      }
      root.replaceWith(document.createTextNode(phoneText.textContent || ""));
    });
  }

  function scanDocument() {
    processNode(document.body || document.documentElement);
  }

  function processNode(node) {
    if (!isEnabled || !node) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
      return;
    }

    if (!(node instanceof Element)) {
      return;
    }

    if (shouldSkipElement(node)) {
      return;
    }

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const current = walker.currentNode;
      if (current && current.parentElement && !shouldSkipElement(current.parentElement)) {
        textNodes.push(current);
      }
    }

    textNodes.forEach(processTextNode);
  }

  function processTextNode(textNode) {
    if (!textNode || !textNode.nodeValue) {
      return;
    }

    const originalText = textNode.nodeValue;
    if (!originalText.trim() || originalText.length > MAX_TEXT_LENGTH) {
      return;
    }

    PHONE_MATCH_REGEX.lastIndex = 0;
    const matches = [...originalText.matchAll(PHONE_MATCH_REGEX)];
    if (!matches.length) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let hasReplacement = false;

    matches.forEach((match) => {
      const matchedText = match[0];
      const startIndex = match.index ?? 0;
      const endIndex = startIndex + matchedText.length;

      if (startIndex > cursor) {
        fragment.appendChild(document.createTextNode(originalText.slice(cursor, startIndex)));
      }

      if (isLikelyPhoneSelection(matchedText)) {
        fragment.appendChild(createHighlightedNode(matchedText.trim()));
        hasReplacement = true;
      } else {
        fragment.appendChild(document.createTextNode(matchedText));
      }

      cursor = endIndex;
    });

    if (cursor < originalText.length) {
      fragment.appendChild(document.createTextNode(originalText.slice(cursor)));
    }

    if (hasReplacement) {
      textNode.replaceWith(fragment);
    }
  }

  function createHighlightedNode(phoneText) {
    const root = document.createElement("span");
    root.className = ROOT_CLASS;

    const text = document.createElement("span");
    text.className = PHONE_TEXT_CLASS;
    text.textContent = phoneText;

    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.title = "Chamar no WhatsApp";
    button.setAttribute("aria-label", "Chamar no WhatsApp");

    const icon = document.createElement("img");
    icon.src = chrome.runtime.getURL("icons/icon16.png");
    icon.alt = "WhatsApp";

    button.appendChild(icon);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      chrome.runtime.sendMessage({
        type: PROCESS_SELECTION_MESSAGE,
        selectionText: phoneText
      });
    });

    root.appendChild(text);
    root.appendChild(button);
    return root;
  }

  function shouldSkipElement(element) {
    if (!element || !(element instanceof Element)) {
      return true;
    }

    if (element.closest(`.${ROOT_CLASS}`)) {
      return true;
    }

    const tagName = element.tagName.toLowerCase();
    return (
      tagName === "script" ||
      tagName === "style" ||
      tagName === "noscript" ||
      tagName === "textarea" ||
      tagName === "input" ||
      tagName === "select" ||
      tagName === "button" ||
      tagName === "code" ||
      tagName === "pre" ||
      element.isContentEditable
    );
  }

  function isLikelyPhoneSelection(text) {
    if (!text) {
      return false;
    }

    const raw = String(text).trim();
    if (raw.length < 7) {
      return false;
    }

    if (!/^[+\d\s().-]+$/.test(raw)) {
      return false;
    }

    const digits = raw.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }
})();
