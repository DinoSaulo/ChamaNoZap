const DICTIONARY = {
  "en-US": {
    extensionName: "Quick WhatsApp Contact",
    contextMenuCall: "Call on WhatsApp",
    actionOpenSettings: "Settings",
    popupEyebrow: "Quick WhatsApp Contact",
    popupTitle: "Send message",
    popupDescriptionDefault:
      "Type a full number with country code or paste a contact to open WhatsApp in a new tab.",
    popupDescriptionNeedsCountry:
      "Select a country to complete the country code for the selected number and open WhatsApp.",
    labelCountry: "Country",
    labelPhone: "Phone number",
    labelMessage: "Message",
    buttonSend: "Send",
    buttonCancel: "Cancel",
    previewTab: "Every send action opens WhatsApp in a new tab.",
    previewFinalNumber: "Final number: +{number}",
    previewInvalidNumber: "Final number: enter a valid phone number",
    ddiEyebrow: "Select country code",
    ddiTitle: "Complete the number",
    ddiDescription:
      "The selected number did not include an international code. Choose a country, review the number and send.",
    validationInvalidFormat: "Invalid format for +{ddi}. Use: {formats}",
    actionWhatsapp: "Open in WhatsApp",
    optionsTitle: "Extension settings",
    optionsDescription: "Manage behavior and appearance preferences.",
    optionAutoHighlight: "Auto-highlight phone numbers on pages",
    optionDarkMode: "Dark mode",
    optionLanguage: "Language",
    optionLanguageEnglish: "English (EN-US)",
    optionLanguagePortuguese: "Portuguese (PT-BR)",
    optionsSaved: "Settings saved"
  },
  "pt-BR": {
    extensionName: "Quick WhatsApp Contact",
    contextMenuCall: "Chamar no WhatsApp",
    actionOpenSettings: "Configuracoes",
    popupEyebrow: "Quick WhatsApp Contact",
    popupTitle: "Enviar mensagem",
    popupDescriptionDefault:
      "Digite o numero completo com DDI ou cole um contato para abrir o WhatsApp em uma nova aba.",
    popupDescriptionNeedsCountry:
      "Selecione o pais para completar o DDI do numero selecionado e abrir o WhatsApp.",
    labelCountry: "Pais",
    labelPhone: "Numero",
    labelMessage: "Mensagem",
    buttonSend: "Enviar",
    buttonCancel: "Cancelar",
    previewTab: "Toda acao de envio abre o WhatsApp em uma nova aba.",
    previewFinalNumber: "Numero final: +{number}",
    previewInvalidNumber: "Numero final: informe um telefone valido",
    ddiEyebrow: "Selecionar DDI",
    ddiTitle: "Complete o numero",
    ddiDescription:
      "O numero selecionado nao tinha codigo internacional. Escolha o pais, revise o numero e envie.",
    validationInvalidFormat: "Formato invalido para +{ddi}. Use: {formats}",
    actionWhatsapp: "Abrir no WhatsApp",
    optionsTitle: "Configuracoes da extensao",
    optionsDescription: "Gerencie preferencias de comportamento e aparencia.",
    optionAutoHighlight: "Realce automatico de numeros na pagina",
    optionDarkMode: "Modo escuro",
    optionLanguage: "Idioma",
    optionLanguageEnglish: "Ingles (EN-US)",
    optionLanguagePortuguese: "Portugues (PT-BR)",
    optionsSaved: "Configuracoes salvas"
  }
};

export function getMessages(language = "en-US") {
  return DICTIONARY[language] || DICTIONARY["en-US"];
}

export function t(messages, key, params = {}) {
  const template = messages[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    return params[token] ?? "";
  });
}
