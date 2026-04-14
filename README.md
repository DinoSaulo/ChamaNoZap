# Quick WhatsApp Contact

Extensão de navegador em Manifest V3 para iniciar conversas no WhatsApp a partir de números encontrados em paginas web, com tratamento inteligente de DDI e interface de envio com mensagem personalizada.

## Funcionalidades

- Menu de contexto com a ação `Chamar no WhatsApp` para números selecionados em qualquer pagina.
- Botao flutuante ao selecionar um número em pagina web, semelhante ao comportamento de extensões como Google Translate.
- Realce automatico opcional de números na pagina com icone do WhatsApp ao lado para abrir com um clique.
- Sanitizacao automatica de números, removendo espacos, parenteses e tracos.
- Deteccao de DDI:
  - Se o número selecionado ja possui prefixo internacional com `+`, a extensão abre diretamente uma nova aba do WhatsApp.
  - Se o número não possui DDI, a extensão abre uma tela para escolha do país e composicao do número completo.
- Popup da extensão com campo de número e textarea para mensagem.
- Configuracao no popup para ativar/desativar o realce automatico de números na pagina.
- Persistencia do ultimo país selecionado usando `chrome.storage.sync`.
- Testes unitarios para sanitização, validacao de DDI e concatenacao de número.

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
- sanitizar o número;
- decidir se abre o WhatsApp diretamente ou a tela de seleção de DDI;
- abrir sempre uma nova aba com `chrome.tabs.create`.

### `src/utils/phone.js`

Modulo com funções puras para:

- sanitizar números;
- normalizar o prefixo `+`;
- validar se o número possui DDI;
- concatenar DDI com número local;
- construir a URL final do WhatsApp.

### `src/popup/`

Contem duas interfaces baseadas em Web Components:

- `popup.html` / `popup.js`: popup principal da extensão para envio de mensagem com número completo.
- `ddi.html` / `ddi.js`: tela aberta em nova aba quando o número selecionado não possui DDI.

### `src/utils/storage.js`

Abstracao para salvar e recuperar o ultimo país selecionado via `chrome.storage.sync`.

## Como carregar a extensão localmente

1. Abra o Chrome ou um navegador compativel com extensões MV3.
2. Acesse `chrome://extensions`.
3. Ative o `Modo do desenvolvedor`.
4. Clique em `Carregar sem compactacao`.
5. Selecione a pasta raiz do projeto:
   `C:\Users\saulo\projects\ChamaNoZap`

## Como usar

### Fluxo 1: Menu de contexto

1. Selecione um número em qualquer pagina web.
2. Clique com o botão direito.
3. Escolha `Chamar no WhatsApp`.
4. Resultado:
   - Se o número estiver no formato internacional com `+`, o WhatsApp abre diretamente em nova aba.
   - Se o número não tiver DDI, o popup fixo da extensão (ancorado no icone da barra) sera aberto para escolha do país e envio.

### Fluxo 2: Popup da extensão

1. Clique no icone da extensão.
2. Informe o número.
3. Opcionalmente, escreva uma mensagem.
4. Clique em `Enviar`.
5. O WhatsApp sera aberto em nova aba com o número e a mensagem preenchidos.

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
- Sanitizacao de números antes de qualquer envio.
- Abertura obrigatória em nova aba para toda ação de envio.
- Persistencia do ultimo país selecionado.
- Testes unitarios para regras centrais de negocio.

## Observacoes

- A detecção de DDI considera números que comecam com `+`.
- A lista de países em `src/utils/countries.js` pode ser expandida facilmente.
- O projeto foi estruturado para manter a logica de dominio desacoplada da interface, facilitando testes e evolucao.
