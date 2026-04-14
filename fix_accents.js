import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  "Atencao": "Atenção",
  "Configuracoes": "Configurações",
  "dicionario": "dicionário",
  "portugues": "português",
  "Portugues": "Português",
  "ingles": "inglês",
  "Ingles": "Inglês",
  "aparencia": "aparência",
  "Aparencia": "Aparência",
  "preferencias": "preferências",
  "Preferencias": "Preferências",
  "invalido": "inválido",
  "Invalido": "Inválido",
  "pagina": "página",
  "Pagina": "Página"
};

const dirs = ['src', 'tests'];
const singleFiles = ['README.md', 'manifest.json'];

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

const allFiles = [...dirs.flatMap(d => walk(d)), ...singleFiles];

const rx = new RegExp("\\b(" + Object.keys(map).join("|") + ")\\b", "g");

for (const filepath of allFiles) {
  if (!fs.existsSync(filepath)) continue;
  let content = fs.readFileSync(filepath, 'utf8');
  const initial = content;

  // Realiza o replace baseado no dicionário
  content = content.replace(rx, match => map[match]);

  if (content !== initial) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Arquivo atualizado com sucesso:", filepath);
  }
}

console.log("Correção de gramática concluída!");
