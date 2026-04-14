const fs = require('fs');
const path = require('path');

const map = {
  "acao": "ação",
  "acoes": "ações",
  "numero": "número",
  "numeros": "números",
  "Numero": "Número",
  "Numeros": "Números",
  "extensao": "extensão",
  "Extensao": "Extensão",
  "extensoes": "extensões",
  "opcao": "opção",
  "Opcao": "Opção",
  "opcoes": "opções",
  "Opcoes": "Opções",
  "padrao": "padrão",
  "Padrao": "Padrão",
  "botao": "botão",
  "botoes": "botões",
  "configuracao": "configuração",
  "configuracoes": "configurações",
  "sanitizacao": "sanitização",
  "deteccao": "detecção",
  "selecao": "seleção",
  "obrigatoria": "obrigatória",
  "observacoes": "observações",
  "codigo": "código",
  "pais": "país",
  "paises": "países",
  "Paises": "Países",
  "nao": "não",
  "Nao": "Não",
  "apos": "após",
  "Apos": "Após",
  "ate": "até",
  "Ate": "Até",
  "descricao": "descrição",
  "Descricao": "Descrição",
  "funcao": "função",
  "funcoes": "funções",
  "versao": "versão",
  "versoes": "versões",
  "atencao": "atenção",
  "Atencao": "Atenção"
};

const dirs = ['src', 'tests'];
const files = ['README.md', 'manifest.json'];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (['.js', '.html', '.json', '.md'].includes(path.extname(fullPath))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const allFiles = [...dirs.flatMap(d => walk(d)), ...files];

const rx = new RegExp("\\b(" + Object.keys(map).join("|") + ")\\b", "g");

for (const filepath of allFiles) {
  if (!fs.existsSync(filepath)) continue;
  let content = fs.readFileSync(filepath, 'utf8');
  const initial = content;

  content = content.replace(rx, match => map[match]);

  if (content !== initial) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Fixed", filepath);
  }
}
