# Quick WhatsApp Contact

Extensao de navegador em Manifest V3 para iniciar conversas no WhatsApp a partir de numeros encontrados em paginas web, com tratamento inteligente de DDI e interface de envio com mensagem personalizada.

## Funcionalidades

- Menu de contexto com a acao `Chamar no WhatsApp` para numeros selecionados em qualquer pagina.
- Sanitizacao automatica de numeros, removendo espacos, parenteses e tracos.
- Deteccao de DDI:
  - Se o numero selecionado ja possui prefixo internacional com `+`, a extensao abre diretamente uma nova aba do WhatsApp.
  - Se o numero nao possui DDI, a extensao abre uma tela para escolha do pais e composicao do numero completo.
- Popup da extensao com campo de numero e textarea para mensagem.
- Persistencia do ultimo pais selecionado usando `chrome.storage.sync`.
- Testes unitarios para sanitizacao, validacao de DDI e concatenacao de numero.

## Estrutura do projeto

```text
.
|-- manifest.json
|-- package.json
|-- vitest.config.js
|-- src
|   |-- background.js
|   |-- popup
|   |   |-- popup.html
|   |   |-- popup.js
|   |   |-- ddi.html
|   |   |-- ddi.js
|   |   `-- styles.css
|   `-- utils
|       |-- countries.js
|       |-- phone.js
|       `-- storage.js
`-- tests
    `-- phone.test.js
```

## Arquitetura

### `src/background.js`

Service worker do Manifest V3 responsavel por:

- criar o item de menu de contexto;
- ler o texto selecionado;
- sanitizar o numero;
- decidir se abre o WhatsApp diretamente ou a tela de selecao de DDI;
- abrir sempre uma nova aba com `chrome.tabs.create`.

### `src/utils/phone.js`

Modulo com funcoes puras para:

- sanitizar numeros;
- normalizar o prefixo `+`;
- validar se o numero possui DDI;
- concatenar DDI com numero local;
- construir a URL final do WhatsApp.

### `src/popup/`

Contem duas interfaces baseadas em Web Components:

- `popup.html` / `popup.js`: popup principal da extensao para envio de mensagem com numero completo.
- `ddi.html` / `ddi.js`: tela aberta em nova aba quando o numero selecionado nao possui DDI.

### `src/utils/storage.js`

Abstracao para salvar e recuperar o ultimo pais selecionado via `chrome.storage.sync`.

## Como carregar a extensao localmente

1. Abra o Chrome ou um navegador compativel com extensoes MV3.
2. Acesse `chrome://extensions`.
3. Ative o `Modo do desenvolvedor`.
4. Clique em `Carregar sem compactacao`.
5. Selecione a pasta raiz do projeto:
   `C:\Users\saulo\projects\ChamaNoZap`

## Como usar

### Fluxo 1: Menu de contexto

1. Selecione um numero em qualquer pagina web.
2. Clique com o botao direito.
3. Escolha `Chamar no WhatsApp`.
4. Resultado:
   - Se o numero estiver no formato internacional com `+`, o WhatsApp abre diretamente em nova aba.
   - Se o numero nao tiver DDI, o popup fixo da extensao (ancorado no icone da barra) sera aberto para escolha do pais e envio.

### Fluxo 2: Popup da extensao

1. Clique no icone da extensao.
2. Informe o numero.
3. Opcionalmente, escreva uma mensagem.
4. Clique em `Enviar`.
5. O WhatsApp sera aberto em nova aba com o numero e a mensagem preenchidos.

## Executando os testes

Instale as dependencias:

```bash
npm install
```

Execute a suite:

```bash
npm test
```

## Regras implementadas

- Manifest V3 com service worker.
- Uso de JavaScript ES Modules.
- UI baseada em Web Components.
- Sanitizacao de numeros antes de qualquer envio.
- Abertura obrigatoria em nova aba para toda acao de envio.
- Persistencia do ultimo pais selecionado.
- Testes unitarios para regras centrais de negocio.

## Observacoes

- A deteccao de DDI considera numeros que comecam com `+`.
- A lista de paises em `src/utils/countries.js` pode ser expandida facilmente.
- O projeto foi estruturado para manter a logica de dominio desacoplada da interface, facilitando testes e evolucao.
