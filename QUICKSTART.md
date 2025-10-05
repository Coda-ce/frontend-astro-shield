# ⚡ Início Rápido - AstroShield

## 🚀 Executar o Projeto (2 minutos)

### Opção 1: Python (Recomendado)
```bash
# Navegue até a pasta do projeto
cd threejs-model-viewer

# Inicie o servidor
python3 -m http.server 8080

# Acesse no navegador
# http://localhost:8080
```

### Opção 2: Node.js
```bash
# Instale um servidor HTTP simples
npm install -g http-server

# Execute
http-server -p 8080

# Acesse no navegador
# http://localhost:8080
```

### Opção 3: VS Code (Live Server)
1. Instale extensão "Live Server"
2. Clique direito em `index.html`
3. Selecione "Open with Live Server"

---

## 🎯 Primeira Simulação (1 minuto)

1. **Acesse:** http://localhost:8080
2. **Ajuste parâmetros no painel esquerdo:**
   - Diâmetro: 500m (padrão)
   - Velocidade: 28 km/s
   - Ângulo: 45°
   - Densidade: Rochoso
3. **Clique no globo 3D** para selecionar local de impacto
   - Ou use dropdown de cidades pré-configuradas
4. **Clique "⚡ Simular Impacto"**
5. **Veja resultados** no painel direito!

---

## 📚 Explorar Cenários Históricos

1. **Acesse:** http://localhost:8080/examples.html
2. **Escolha um cenário:**
   - 💥 Tunguska (1908)
   - 🦖 Chicxulub (dinossauros)
   - ⚠️ Apophis (hipotético)
   - 🌊 Tsunami asteroidal
3. **Clique "⚡ Simular [Nome]"**
4. Você será redirecionado para simulação automática!

---

## 🛰️ Usar Dados Reais da NASA (Opcional)

### Passo 1: Obter API Key (2 minutos)
1. Acesse: https://api.nasa.gov/
2. Preencha formulário
3. Receba chave por email

### Passo 2: Configurar
Edite `nasa-neo-integration.js` linha 11:
```javascript
constructor(apiKey = 'SUA_CHAVE_AQUI') {
```

### Passo 3: Integrar na Aplicação
Adicione ao final de `app.js`:
```javascript
import { NASANEOService, NEOSelector } from './nasa-neo-integration.js';

window.addEventListener('DOMContentLoaded', async () => {
    const viewer = new AstroShieldViewer();
    const uiController = new UIController(viewer);

    // ADICIONE ESTAS LINHAS:
    const neoService = new NASANEOService('SUA_API_KEY');
    const neoSelector = new NEOSelector(neoService, uiController);
    await neoSelector.initializeNEOSelector();

    console.log('🚀 AstroShield com NASA NEO API ativo!');
});
```

---

## 🎮 Controles da Visualização 3D

| Ação | Mouse | Touchscreen |
|------|-------|-------------|
| **Rotacionar** | Arrastar botão esquerdo | Um dedo arrasta |
| **Zoom** | Scroll | Pinch (dois dedos) |
| **Pan** | Arrastar botão direito | Dois dedos arrastam |
| **Selecionar local** | Clique esquerdo | Toque |

---

## 📊 Entendendo os Resultados

### Energia Liberada (Megatons TNT)
- **< 1 MT:** Evento pequeno
- **1-100 MT:** City killer
- **100-1000 MT:** Catástrofe regional
- **> 1000 MT:** Evento de extinção

**Referência:** Hiroshima = 0.015 MT

---

### Diâmetro da Cratera
Cratera formada no impacto terrestre.
- **< 1 km:** Cratera local
- **1-10 km:** Cratera regional (como Meteor Crater, AZ)
- **> 100 km:** Cratera global (como Chicxulub)

---

### Magnitude Sísmica
Equivalente na escala Richter.
- **< 5.0:** Tremor local
- **5.0-7.0:** Terremoto regional
- **> 7.0:** Mega-terremoto

---

### Raio de Devastação
Área com destruição total (overpressure > 20 PSI).
- Tudo dentro é completamente destruído
- Estruturas de concreto colapsam
- Incêndios generalizados

---

### Raio Térmico
Área com queimaduras de 3º grau em pessoas expostas.
- Geralmente maior que raio de devastação
- Bola de fogo inicial é visível a centenas de km

---

## 🔬 Validação Científica

Para testar a precisão dos cálculos:

### Teste 1: Meteor Crater
```
Parâmetros:
- Diâmetro: 50m
- Velocidade: 12.8 km/s
- Ângulo: 80°
- Densidade: Ferro-Níquel (8000 kg/m³)

Resultado esperado:
- Cratera: ~1.2 km ✅
- Energia: ~10 MT ✅
```

### Teste 2: Tunguska
```
Parâmetros:
- Diâmetro: 60m
- Velocidade: 27 km/s
- Ângulo: 30° (rasante)
- Densidade: Carbonáceo (1500 kg/m³)

Resultado esperado:
- Energia: 10-15 MT ✅
- Devastação: ~2150 km² de floresta ✅
```

---

## ❓ Resolução de Problemas

### Globo 3D não carrega
**Solução:**
1. Verifique se `earth_3d.glb` está na pasta raiz
2. Verifique console do navegador (F12)
3. Confirme que servidor está rodando

---

### Cálculos retornam 0 ou NaN
**Solução:**
1. Ajuste os sliders para valores válidos
2. Selecione um local de impacto
3. Recarregue a página (Ctrl+R)

---

### CORS error ao usar NASA API
**Solução:**
1. Use backend para chamar API (produção)
2. Ou use extensão "CORS Unblock" para testes
3. Ou use DEMO_KEY da NASA (limitado)

---

### Performance ruim / travando
**Solução:**
1. Feche outras abas do navegador
2. Reduza qualidade de renderização (futuro)
3. Teste em navegador diferente (Chrome recomendado)

---

## 📝 Próximos Passos

### Nível 1: Exploração
- [x] Execute primeira simulação
- [ ] Teste todos cenários em examples.html
- [ ] Simule impacto na sua cidade
- [ ] Compare diferentes ângulos de entrada

### Nível 2: Aprendizado
- [ ] Leia documentação científica (README)
- [ ] Entenda cálculos físicos (app.js)
- [ ] Configure NASA API
- [ ] Simule asteroides reais

### Nível 3: Contribuição
- [ ] Clone repositório Git
- [ ] Implemente nova funcionalidade
- [ ] Adicione novo cenário histórico
- [ ] Contribua para o projeto!

---

## 🎓 Recursos Educacionais

### Vídeos Recomendados
- **NASA Planetary Defense:** https://www.youtube.com/c/NASA
- **Kurzgesagt - Asteroid Impacts:** https://youtu.be/bU1QPtOZQZU

### Artigos Científicos
- Collins et al. (2005) - Earth Impact Effects
- Ward & Asphaug (2000) - Asteroid Impact Tsunami

### Sites
- **NASA NEO Program:** https://cneos.jpl.nasa.gov/
- **ESA Hera Mission:** https://www.esa.int/Safety_Security/Hera

---

## 💬 Feedback e Suporte

**Encontrou um bug?**
- Abra issue no GitHub
- Descreva passos para reproduzir
- Inclua screenshots

**Tem uma ideia?**
- Compartilhe nas Discussions
- Leia CONTRIBUTING.md
- Faça um Pull Request!

**Precisa de ajuda?**
- Leia documentação completa (README.md)
- Consulte FAQ (em breve)
- Entre em contato via GitHub

---

## ✅ Checklist de Sucesso

- [ ] Servidor rodando localmente
- [ ] Globo 3D renderizado
- [ ] Primeira simulação executada
- [ ] Resultados exibidos corretamente
- [ ] Marcador de impacto visível
- [ ] Zona de devastação mostrada
- [ ] Cenários históricos testados

**Parabéns! Você está pronto para defender a Terra! 🛡️🌍**

---

## 🔗 Links Úteis

| Recurso | URL |
|---------|-----|
| Documentação Principal | [README.md](README.md) |
| Setup NASA API | [SETUP_NASA_API.md](SETUP_NASA_API.md) |
| Guia de Contribuição | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Estrutura do Projeto | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| NASA Space Apps | https://www.spaceappschallenge.org/2025/challenges/meteor-madness/ |

---

**Tempo total para começar:** ~5 minutos
**Tempo para dominar:** Infinito! 🚀
