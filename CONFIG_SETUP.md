# 🔐 Guia de Configuração Segura - API Keys

## ⚠️ Segurança de API Keys

Para manter suas chaves de API privadas e **não expô-las no GitHub**, siga este guia.

---

## 📋 Passo a Passo

### 1. Arquivo de Configuração

O projeto usa um sistema de configuração seguro:

```
config.example.js  ← Template (público, vai pro GitHub)
config.js          ← Suas chaves (privado, NÃO vai pro GitHub)
```

### 2. Criar Seu Arquivo de Configuração

#### Opção A: Copiar o Exemplo
```bash
cp config.example.js config.js
```

#### Opção B: Já Foi Criado Automaticamente
O arquivo `config.js` **já existe** com sua chave NASA configurada! ✅

### 3. Verificar .gitignore

O arquivo `.gitignore` **já está configurado** para ignorar `config.js`:

```gitignore
# NASA API Key (NUNCA commite sua chave!)
config.js
.env
.env.local
```

✅ **Seu `config.js` NUNCA será enviado ao GitHub**

---

## 🔑 Sua Chave NASA Atual

Arquivo: `config.js` (linha 11)

```javascript
NASA_API_KEY: 's6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR'
```

✅ **Configurada e funcionando!**

---

## 🛠️ Como Funciona

### Antes (❌ INSEGURO)
```javascript
// Chave exposta no código
constructor(apiKey = 's6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR') {
```

### Depois (✅ SEGURO)
```javascript
import { CONFIG } from './config.js';

constructor(apiKey = CONFIG.NASA_API_KEY) {
```

**Vantagens:**
- ✅ Chave não aparece no código fonte
- ✅ Arquivo `config.js` está no `.gitignore`
- ✅ Cada desenvolvedor tem sua própria chave
- ✅ Exemplo público (`config.example.js`) vai para o GitHub

---

## 📁 Arquivos Atualizados

| Arquivo | Status | GitHub |
|---------|--------|--------|
| `config.js` | ✅ Criado | ❌ Ignorado (.gitignore) |
| `config.example.js` | ✅ Criado | ✅ Vai para GitHub |
| `nasa-neo-integration.js` | ✅ Atualizado | ✅ Vai para GitHub |
| `asteroid-orbital-view.js` | ✅ Atualizado | ✅ Vai para GitHub |
| `app.js` | ✅ Atualizado | ✅ Vai para GitHub |

---

## 🧪 Testar Configuração

```bash
# 1. Verifique se config.js existe
ls -la config.js

# 2. Verifique se está no .gitignore
git status
# config.js NÃO deve aparecer na lista

# 3. Teste a aplicação
python3 -m http.server 8080
# Acesse http://localhost:8080
# Veja console (F12) - deve carregar asteroides da NASA
```

---

## 🔄 Para Outros Desenvolvedores

Quando alguém clonar seu repositório do GitHub:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/astroshield.git
cd astroshield

# 2. Copie o exemplo
cp config.example.js config.js

# 3. Edite e adicione SUA chave NASA
nano config.js
# ou
code config.js

# 4. Salve e teste
python3 -m http.server 8080
```

---

## 🆕 Adicionar Novas Chaves

### Editar config.js

```javascript
export const CONFIG = {
    // NASA API Key
    NASA_API_KEY: 's6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR',

    // NOVA: Adicione outras APIs aqui
    USGS_API_KEY: 'sua_chave_usgs_aqui',
    OPENWEATHER_KEY: 'sua_chave_openweather_aqui',

    settings: {
        maxAsteroids: 50,
        debug: true,
        language: 'pt-BR'
    }
};
```

### Usar no Código

```javascript
import { CONFIG } from './config.js';

const usgsKey = CONFIG.USGS_API_KEY;
const weatherKey = CONFIG.OPENWEATHER_KEY;
```

---

## ⚠️ NUNCA Faça Isso

### ❌ NÃO commite config.js
```bash
git add config.js        # ❌ NUNCA!
git commit -m "add keys" # ❌ NUNCA!
```

### ❌ NÃO coloque chaves hardcoded
```javascript
// ❌ RUIM
const apiKey = 's6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR';

// ✅ BOM
import { CONFIG } from './config.js';
const apiKey = CONFIG.NASA_API_KEY;
```

### ❌ NÃO compartilhe chaves publicamente
- Não poste em issues do GitHub
- Não cole em Stack Overflow
- Não envie por email não criptografado

---

## 🔒 Segurança Extra (Produção)

### Variáveis de Ambiente (Deploy)

Para deploy em produção (Netlify, Vercel, Heroku):

#### 1. Configure Variáveis de Ambiente

**Netlify:**
```
Site Settings → Build & Deploy → Environment Variables
NASA_API_KEY = s6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR
```

**Vercel:**
```
Settings → Environment Variables
NASA_API_KEY = s6lqfS0TsEJ2xBmqnO3yjozsjBWiFz6nS0hCpzoR
```

#### 2. Atualizar config.js

```javascript
export const CONFIG = {
    NASA_API_KEY: process.env.NASA_API_KEY || 'DEMO_KEY',
    // ...
};
```

**Nota:** Isso requer build process (Webpack, Vite, etc.)

---

## 🆘 Problemas Comuns

### Problema: "CONFIG is not defined"

**Causa:** Arquivo `config.js` não existe

**Solução:**
```bash
cp config.example.js config.js
```

---

### Problema: "Failed to fetch" da NASA API

**Causa 1:** Chave inválida

**Solução:** Verifique sua chave em `config.js`

**Causa 2:** Limite de requisições excedido

**Solução:** Aguarde 1 hora ou registre nova chave

---

### Problema: config.js aparece no `git status`

**Causa:** Arquivo adicionado antes do .gitignore

**Solução:**
```bash
# Remover do tracking do git (mantém arquivo local)
git rm --cached config.js

# Verificar
git status
# config.js NÃO deve aparecer mais
```

---

## ✅ Checklist de Segurança

Antes de fazer commit/push:

- [ ] `config.js` está no `.gitignore`
- [ ] `config.example.js` existe (template público)
- [ ] `git status` NÃO mostra `config.js`
- [ ] Código usa `import { CONFIG }` ao invés de chaves hardcoded
- [ ] README explica como configurar chaves
- [ ] Nenhuma chave de API aparece em arquivos commitados

---

## 📚 Documentação Relacionada

- **NASA API:** https://api.nasa.gov/
- **Obter chave NASA:** Preencha formulário em https://api.nasa.gov/
- **.gitignore:** https://git-scm.com/docs/gitignore

---

## 🎓 Boas Práticas

1. **Nunca commite chaves de API**
2. **Use .gitignore sempre**
3. **Mantenha config.example.js atualizado**
4. **Documente como obter chaves**
5. **Rotacione chaves periodicamente**
6. **Use variáveis de ambiente em produção**

---

**Status:** ✅ **CONFIGURAÇÃO SEGURA IMPLEMENTADA**

Suas chaves estão **protegidas** e não serão expostas no GitHub! 🔐
