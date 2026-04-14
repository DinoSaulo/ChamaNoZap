import { COUNTRIES, DEFAULT_COUNTRY_CODE, getCountryByCode } from "../utils/countries.js";
import {
  buildWhatsAppUrl,
  getExpectedFormatsForDdi,
  hasCountryCode,
  isValidPhoneForSend,
  isLocalNumberValidForDdi,
  joinCountryCodeAndNumber,
  normalizeSelectedNumber
} from "../utils/phone.js";
import { detectCountryCodeFromBrowserLocation } from "../utils/location.js";
import { consumePendingContextNumber, getLastCountry, saveLastCountry } from "../utils/storage.js";

class WhatsAppMessagePopup extends HTMLElement {
  async connectedCallback() {
    this.pendingContextNumber = normalizeSelectedNumber(await consumePendingContextNumber());
    this.requiresCountrySelection = Boolean(this.pendingContextNumber);
    const storedCountry = await getLastCountry();
    const detectedCountry = detectCountryCodeFromBrowserLocation({
      languages: navigator.languages,
      language: navigator.language
    });
    this.selectedCountryCode = this.requiresCountrySelection
      ? detectedCountry || DEFAULT_COUNTRY_CODE
      : storedCountry || detectedCountry || DEFAULT_COUNTRY_CODE;
    this.render();
    this.bindEvents();
  }

  render() {
    const initialNumber = this.pendingContextNumber || "";
    const description = this.requiresCountrySelection
      ? "Selecione o pais para completar o DDI do numero escolhido e abrir o WhatsApp."
      : "Digite o numero completo com DDI ou cole um contato para abrir o WhatsApp em uma nova aba.";

    this.innerHTML = `
      <main class="panel">
        <section class="card">
          <div class="card__content">
            <div class="eyebrow">Quick WhatsApp Contact</div>
            <h1 class="title">Enviar mensagem</h1>
            <p class="description">${description}</p>
            <form id="message-form">
              <div class="field" ${this.requiresCountrySelection ? "" : "hidden"}>
                <label for="country-hidden">Pais</label>
                ${this.buildCountryPickerMarkup(this.selectedCountryCode)}
              </div>
              <div class="field">
                <label for="phone">Numero</label>
                <input id="phone" name="phone" type="text" value="${initialNumber}" placeholder="+5511999999999" required />
              </div>
              <div class="field">
                <label for="message">Mensagem</label>
                <textarea id="message" name="message" placeholder="Escreva sua mensagem"></textarea>
              </div>
              <div class="actions">
                <button class="button button--primary" type="submit">Enviar</button>
              </div>
            </form>
          </div>
          <div class="preview">Toda acao abre o WhatsApp em uma nova aba.</div>
        </section>
      </main>
    `;
  }

  buildCountryPickerMarkup(selectedCode) {
    const selectedCountry = getCountryByCode(selectedCode);
    const items = COUNTRIES.map((country) => {
      return `
        <button class="country-picker__option" type="button" data-country-code="${country.code}">
          <span class="country-picker__flag">${country.flag}</span>
          <span class="country-picker__name">${country.name}</span>
          <span class="country-picker__ddi">+${country.dialCode}</span>
        </button>
      `;
    }).join("");

    return `
      <div class="country-picker" id="country-picker">
        <input id="country-hidden" name="country" type="hidden" value="${selectedCountry.code}" />
        <button class="country-picker__trigger" id="country-trigger" type="button" aria-expanded="false">
          <span class="country-picker__flag">${selectedCountry.flag}</span>
          <span class="country-picker__name">${selectedCountry.name}</span>
          <span class="country-picker__ddi">+${selectedCountry.dialCode}</span>
        </button>
        <div class="country-picker__menu" id="country-menu" hidden>
          ${items}
        </div>
      </div>
    `;
  }

  getSelectedCountry() {
    const countryHidden = this.querySelector("#country-hidden");
    return getCountryByCode(countryHidden?.value ?? DEFAULT_COUNTRY_CODE);
  }

  bindCountryPickerEvents() {
    const picker = this.querySelector("#country-picker");
    const trigger = this.querySelector("#country-trigger");
    const menu = this.querySelector("#country-menu");
    const hiddenInput = this.querySelector("#country-hidden");
    const optionButtons = this.querySelectorAll(".country-picker__option");

    const closeMenu = () => {
      if (!menu || !trigger) {
        return;
      }
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    };

    trigger?.addEventListener("click", () => {
      if (!menu) {
        return;
      }
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      trigger.setAttribute("aria-expanded", String(willOpen));
    });

    optionButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const code = button.getAttribute("data-country-code") ?? DEFAULT_COUNTRY_CODE;
        const selectedCountry = getCountryByCode(code);
        if (hiddenInput) {
          hiddenInput.value = selectedCountry.code;
        }
        if (trigger) {
          trigger.innerHTML = `
            <span class="country-picker__flag">${selectedCountry.flag}</span>
            <span class="country-picker__name">${selectedCountry.name}</span>
            <span class="country-picker__ddi">+${selectedCountry.dialCode}</span>
          `;
        }
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!picker || !menu || menu.hidden) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && !picker.contains(target)) {
        closeMenu();
      }
    });
  }

  bindEvents() {
    this.bindCountryPickerEvents();

    const form = this.querySelector("#message-form");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const phoneInput = this.querySelector("#phone");
      const messageInput = this.querySelector("#message");

      let phone = normalizeSelectedNumber(phoneInput?.value ?? "");
      const message = messageInput?.value ?? "";
      phoneInput?.setCustomValidity("");

      if (this.requiresCountrySelection && !hasCountryCode(phone)) {
        const selectedCountry = this.getSelectedCountry();
        const expectedFormats = getExpectedFormatsForDdi(selectedCountry.dialCode);
        const localNumberIsValid = isLocalNumberValidForDdi(phone, selectedCountry.dialCode);
        if (!localNumberIsValid) {
          const formatsLabel = expectedFormats.join(" ou ");
          phoneInput?.setCustomValidity(`Formato invalido para +${selectedCountry.dialCode}. Use: ${formatsLabel}`);
          phoneInput?.reportValidity();
          phoneInput?.focus();
          return;
        }

        phone = joinCountryCodeAndNumber(selectedCountry.dialCode, phone);
        await saveLastCountry(selectedCountry.code);
      }

      if (!isValidPhoneForSend(phone)) {
        phoneInput?.focus();
        return;
      }

      const whatsappUrl = buildWhatsAppUrl(phone, message);
      if (!whatsappUrl) {
        phoneInput?.focus();
        return;
      }

      await chrome.tabs.create({
        url: whatsappUrl,
        active: true
      });

      window.close();
    });
  }
}

customElements.define("whatsapp-message-popup", WhatsAppMessagePopup);
