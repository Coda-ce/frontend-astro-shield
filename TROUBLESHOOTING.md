# 🔧 Troubleshooting - AstroShield

## ❌ Problema: Modelo 3D da Terra não aparece (esfera vermelha aparece no lugar)

### Diagnóstico Rápido

1. **Abra o console do navegador** (F12 → Console)
2. **Procure por mensagens:**
   - ✅ `"✅ Modelo da Terra carregado com sucesso!"` → Modelo OK
   - ❌ `"❌ Erro ao carregar modelo"` → Problema no carregamento
   - ⚠️ `"⚠️ Usando esfera de fallback"` → Fallback ativo

---

## 🔍 Solução 1: Testar Carregamento

### Passo 1: Página de Diagnóstico
```bash
# Acesse a página de teste
http://localhost:8080/test-model.html
```

Esta página vai:
- ✅ Verificar se o arquivo existe
- ✅ Testar diferentes caminhos
- ✅ Mostrar logs detalhados
- ✅ Exibir tamanho do arquivo

### Passo 2: Interpretar Resultados

**Se aparecer "Arquivo encontrado":**
- ✅ Arquivo está acessível
- Problema pode ser no formato GLB

**Se aparecer "Não encontrado":**
- ❌ Problema de caminho ou servidor
- Veja Solução 2

---

## 🔧 Solução 2: Verificar Estrutura de Arquivos

### Estrutura Correta:
```
threejs-model-viewer/
├── index.html
├── app.js
├── earth_3d.glb          ← DEVE ESTAR AQUI!
├── three.js/
│   └── build/
│       └── three.module.js
└── ...
```

### Verificar no terminal:
```bash
# Navegue até a pasta do projeto
cd threejs-model-viewer

# Liste arquivos
ls -lh earth_3d.glb

# Deve mostrar: earth_3d.glb (13M)
```

Se o arquivo **não aparecer:**
```bash
# Arquivo pode estar em pasta errada
find . -name "earth_3d.glb"

# Mova para a pasta correta se necessário
mv caminho/antigo/earth_3d.glb .
```

---

## 🌐 Solução 3: Verificar Servidor HTTP

### Problema: CORS ou servidor não servindo arquivos

**Python HTTP Server (Recomendado):**
```bash
# Inicie DENTRO da pasta do projeto
cd threejs-model-viewer
python3 -m http.server 8080

# Acesse: http://localhost:8080
```

**Verificar logs do servidor:**
```
Serving HTTP on 0.0.0.0 port 8080 ...
127.0.0.1 - - [04/Oct/2025 15:00:00] "GET /earth_3d.glb HTTP/1.1" 200 -
```

- **200** = OK (arquivo servido)
- **404** = Não encontrado (arquivo ausente ou caminho errado)

---

## 📦 Solução 4: Verificar Arquivo GLB

### O arquivo pode estar corrompido

**Teste 1: Tamanho**
```bash
ls -lh earth_3d.glb
# Deve mostrar ~13M

# Se mostrar 0 bytes ou muito pequeno: arquivo corrompido!
```

**Teste 2: Validar GLB**
Acesse: https://gltf-viewer.donmccurdy.com/
1. Arraste `earth_3d.glb` para o site
2. Se aparecer erro → arquivo corrompido
3. Se aparecer modelo 3D → arquivo OK

**Solução:**
Se o arquivo estiver corrompido:
1. Baixe novamente de uma fonte confiável
2. Ou use a **esfera de fallback** (já implementada automaticamente)

---

## 🔄 Solução 5: Usar Esfera de Fallback (Modo Emergência)

Se o modelo GLB não funcionar, o sistema **automaticamente** usa uma esfera texturizada.

### Como forçar fallback para teste:
```javascript
// Em app.js, linha 97, comente a chamada:
// this.loadEarthModel();

// E adicione:
this.createFallbackEarth();
```

**Vantagem:**
- ✅ Funciona sem arquivo GLB
- ✅ Textura procedural (azul/verde)
- ✅ Totalmente funcional
- ❌ Menos realista visualmente

---

## 🛠️ Solução 6: Alternativas ao earth_3d.glb

### Opção A: Usar Esfera Texturizada Melhor

Crie uma textura PNG da Terra:
1. Baixe de: https://www.solarsystemscope.com/textures/
2. Salve como `earth_texture.jpg` (2048x1024)
3. Modifique `app.js`:

```javascript
createTexturedEarth() {
    const geometry = new THREE.SphereGeometry(5, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        './earth_texture.jpg',
        (texture) => {
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 5
            });

            this.earth = new THREE.Mesh(geometry, material);
            this.earth.rotation.x = Math.PI * 0.05;
            this.scene.add(this.earth);

            document.getElementById('loading').style.display = 'none';
            console.log('✅ Terra texturizada carregada!');
        }
    );
}
```

### Opção B: Modelo GLB Alternativo

Baixe modelo gratuito:
- **Sketchfab:** https://sketchfab.com/3d-models/earth-
- **NASA 3D Resources:** https://nasa3d.arc.nasa.gov/

Requisitos:
- Formato: `.glb` ou `.gltf`
- Tamanho: < 50 MB
- Licença: Uso livre

---

## 🐛 Solução 7: Problemas Comuns

### Problema: "THREE is not defined"
**Causa:** Three.js não carregou

**Solução:**
```html
<!-- Verifique no index.html se existe: -->
<script type="importmap">
    {
        "imports": {
            "three": "./three.js/build/three.module.js",
            "three/addons/": "./three.js/examples/jsm/"
        }
    }
</script>
```

### Problema: "GLTFLoader is not a constructor"
**Causa:** GLTFLoader não foi importado

**Solução:**
```javascript
// No app.js, verifique:
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
```

### Problema: Tela preta (nada aparece)
**Causa:** Câmera ou iluminação

**Solução:**
```javascript
// Adicione debug temporário:
this.scene.add(new THREE.AxesHelper(10)); // Eixos XYZ
console.log('Camera position:', this.camera.position);
console.log('Scene children:', this.scene.children.length);
```

### Problema: Modelo aparece mas muito pequeno/grande
**Causa:** Escala incorreta

**Solução:**
```javascript
// Ajuste escala em app.js:
this.earth.scale.set(5, 5, 5); // Aumente ou diminua
```

---

## 🎯 Checklist de Verificação

Execute estes passos em ordem:

- [ ] 1. Arquivo `earth_3d.glb` existe na pasta raiz?
- [ ] 2. Tamanho do arquivo é ~13 MB?
- [ ] 3. Servidor HTTP está rodando na pasta correta?
- [ ] 4. Console mostra algum erro?
- [ ] 5. Página `test-model.html` funciona?
- [ ] 6. Three.js está carregando sem erros?
- [ ] 7. GLTFLoader está importado corretamente?

---

## 📞 Ainda com Problemas?

### Informações para reportar:

```
1. Sistema Operacional: _______
2. Navegador + Versão: _______
3. Mensagem de erro (console): _______
4. Resultado de `ls -lh earth_3d.glb`: _______
5. URL acessada: _______
6. Servidor usado: Python / Node / Outro
```

### Envie para:
- **GitHub Issues:** [Link do repositório]
- Inclua screenshot do console (F12)
- Inclua log do `test-model.html`

---

## ✅ Solução Rápida (Se tiver pressa)

**Modo Emergência - Funciona SEM earth_3d.glb:**

1. Abra `app.js`
2. Procure linha ~97: `this.loadEarthModel();`
3. Substitua por: `this.createFallbackEarth();`
4. Recarregue página

**Resultado:**
- Esfera azul/verde aparece imediatamente
- Todos os cálculos funcionam normalmente
- Simulações funcionam 100%
- Apenas visual é menos realista

---

## 🎓 Entendendo o Sistema de Fallback

O AstroShield tem **3 níveis de fallback**:

1. **Nível 1 (Ideal):** earth_3d.glb → Modelo 3D realista
2. **Nível 2 (Fallback):** createFallbackEarth() → Esfera procedural
3. **Nível 3 (Debug):** AxesHelper → Apenas eixos 3D

Todos os níveis permitem:
- ✅ Rotação e zoom
- ✅ Clique para selecionar local
- ✅ Marcadores de impacto
- ✅ Cálculos científicos
- ✅ Simulações completas

---

**Última atualização:** Outubro 2025
