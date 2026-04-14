import { COUNTRIES, DEFAULT_COUNTRY_CODE, getCountryByCode } from "../utils/countries.js";
import {
  buildWhatsAppUrl,
  getExpectedFormatsForDdi,
  isValidPhoneForSend,
  isLocalNumberValidForDdi,
  joinCountryCodeAndNumber,
  normalizeSelectedNumber
} from "../utils/phone.js";
import { detectCountryCodeFromBrowserLocation } from "../utils/location.js";
import { getLastCountry, saveLastCountry } from "../utils/storage.js";

class CountryDdiScreen extends HTMLElement {
  async connectedCallback() {
    this.initialNumber = this.getNumberFromQuery();
    this.selectedCountryCode = await this.resolveInitialCountry();
    this.render();
    this.bindEvents();
    this.updatePreview();
  }

  getNumberFromQuery() {
    const url = new URL(window.location.href);
    return normalizeSelectedNumber(url.searchParams.get("number") ?? "");
  }

  async resolveInitialCountry() {
    const storedCountryCode = await getLastCountry();
    const detectedCountryCode = detectCountryCodeFromBrowserLocation({
      languages: navigator.languages,
      language: navigator.language
    });
    return detectedCountryCode || storedCountryCode || DEFAULT_COUNTRY_CODE;
  }

  render() {
    this.innerHTML = `
      <main class="panel">
        <section class="card">
          <div class="card__content">
            <div class="eyebrow">Selecionar DDI</div>
            <h1 class="title">Complete o número</h1>
            <p class="description">O número selecionado não tinha código internacional. Escolha o país, revise o número e envie.</p>
            <form id="ddi-form">
              <div class="field">
                <label for="country-hidden">Pais</label>
                ${this.buildCountryPickerMarkup(this.selectedCountryCode)}
              </div>
              <div class="field">
                <label for="local-number">Número</label>
                <input id="local-number" name="local-number" type="text" value="${this.initialNumber}" required />
              </div>
              <div class="actions">
                <button class="button button--primary" type="submit">Enviar</button>
                <button class="button button--secondary" type="button" id="cancel">Cancelar</button>
              </div>
            </form>
          </div>
          <div class="preview" id="preview"></div>
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
    const hiddenInput = this.querySelector("#country-hidden");
    return getCountryByCode(hiddenInput?.value ?? DEFAULT_COUNTRY_CODE);
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
      button.addEventListener("click", () => {
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
        this.updatePreview();
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

    const numberInput = this.querySelector("#local-number");
    const form = this.querySelector("#ddi-form");
    const cancelButton = this.querySelector("#cancel");

    numberInput?.addEventListener("input", () => this.updatePreview());

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const country = this.getSelectedCountry();
      const localNumber = numberInput?.value ?? "";
      numberInput?.setCustomValidity("");
      if (!isLocalNumberValidForDdi(localNumber, country.dialCode)) {
        const formats = getExpectedFormatsForDdi(country.dialCode).join(" ou ");
        numberInput?.setCustomValidity(`Formato invalido para +${country.dialCode}. Use: ${formats}`);
        numberInput?.reportValidity();
        numberInput?.focus();
        return;
      }

      const phone = joinCountryCodeAndNumber(country.dialCode, localNumber);

      if (!isValidPhoneForSend(phone)) {
        numberInput?.focus();
        return;
      }

      const whatsappUrl = buildWhatsAppUrl(phone);
      if (!whatsappUrl) {
        numberInput?.focus();
        return;
      }

      await saveLastCountry(country.code);
      await chrome.tabs.create({
        url: whatsappUrl,
        active: true
      });

      window.close();
    });

    cancelButton?.addEventListener("click", () => window.close());
  }

  updatePreview() {
    const numberInput = this.querySelector("#local-number");
    const preview = this.querySelector("#preview");
    const country = this.getSelectedCountry();
    const fullNumber = joinCountryCodeAndNumber(country.dialCode, numberInput?.value ?? "");

    if (preview) {
      preview.textContent = isValidPhoneForSend(fullNumber)
        ? `Número final: +${fullNumber}`
        : "Número final: informe um telefone valido";
    }
  }
}

customElements.define("country-ddi-screen", CountryDdiScreen);
