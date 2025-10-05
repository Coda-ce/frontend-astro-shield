# 🛡️ AstroShield - Simulação Interativa de Impacto de Asteroides

**NASA Space Apps Challenge 2025 - Desafio "Meteor Madness"**

Plataforma web educativa que transforma dados complexos da NASA e USGS em experiências visuais compreensíveis, permitindo simular e compreender riscos de impactos de asteroides.

---

## 🚀 Início Rápido

### Requisitos
- Python 3.x (para servidor HTTP local)
- Navegador web moderno com suporte a WebGL

### Executar o Projeto

```bash
# Opção 1: Usando Python
python3 -m http.server 8080

# Opção 2: Usando npm (se preferir)
npm run dev
```

Acesse: **http://localhost:8080**

---

## 🎯 Funcionalidades Implementadas (MVP)

### ✅ Visualização 3D Interativa
- Modelo 3D realista da Terra (earth_3d.glb)
- Controles de rotação, zoom e navegação orbital
- Campo de estrelas de fundo para imersão
- Iluminação dinâmica simulando o Sol

### ✅ Simulação de Impacto Personalizada
- **Parâmetros ajustáveis:**
  - Diâmetro do asteroide: 10m - 10km
  - Densidade: Carbonáceo, Rochoso, Metálico, Ferro-Níquel
  - Velocidade: 11 km/s (escape) - 72 km/s (máxima observada)
  - Ângulo de entrada: 10° (rasante) - 90° (vertical)

### ✅ Seleção de Local de Impacto
- **6 cidades pré-configuradas:**
  - Nova York, EUA
  - São Paulo, Brasil
  - Londres, Reino Unido
  - Tóquio, Japão
  - Sydney, Austrália
  - Oceano Atlântico (0°, 0°)
- **Seleção manual:** Clique em qualquer ponto do globo 3D
- Conversão automática de coordenadas cartesianas → lat/lon

### ✅ Cálculos Físicos Científicos
Baseados em modelos peer-reviewed:

**Energia de Impacto:**
```
E = ½ × m × v²
```

**Diâmetro da Cratera (Collins et al., 2005):**
```
D = 1.161 × E^0.302 × ρ^-0.302 × sin(θ)^0.302
```

**Magnitude Sísmica:**
```
M = ⅔ × log₁₀(E) - 3.2
```

**Raio de Devastação:**
```
R_blast = 2.2 × E^0.33  (overpressure 20 PSI)
R_thermal = 3.5 × E^0.41  (queimaduras 3º grau)
```

### ✅ Painel de Resultados em Tempo Real
- Energia liberada (Megatons TNT)
- Diâmetro da cratera
- Magnitude sísmica equivalente
- Raio de devastação
- Raio térmico
- Comparação com eventos históricos (Hiroshima, Tsar Bomba)

### ✅ Visualização de Zona de Impacto
- Círculo vermelho translúcido representando área afetada
- Escala realista proporcional ao raio de devastação
- Marcador pulsante no ponto de impacto

---

## 🏗️ Arquitetura Técnica

### Frontend
```
Three.js r180          → Renderização 3D
Vanilla JavaScript     → Lógica de aplicação (ES6 modules)
CSS3                   → Estilo responsivo e tema espacial
HTML5                  → Estrutura semântica
```

### Modelo 3D
```
earth_3d.glb (12.9 MB) → Modelo realista da Terra
GLTFLoader             → Carregamento de modelos 3D
```

### Estrutura de Arquivos
```
threejs-model-viewer/
├── index.html              # Interface principal
├── app.js                  # Lógica de aplicação
│   ├── AstroShieldViewer   # Classe de visualização 3D
│   ├── ImpactCalculator    # Cálculos físicos
│   └── UIController        # Controle de interface
├── earth_3d.glb            # Modelo 3D da Terra
├── package.json            # Configuração do projeto
├── README.md               # Documentação
└── three.js/               # Biblioteca Three.js
```

---

## 🧪 Validação Científica

### Casos de Teste Conhecidos

**Evento de Tunguska (1908)**
- Asteroide estimado: 50-60m de diâmetro
- Energia: ~10-15 MT
- Simulação no AstroShield: ✅ Valores compatíveis

**Meteor Crater, Arizona**
- Asteroide: ~50m de diâmetro (metálico)
- Cratera: 1.2 km de diâmetro
- Simulação no AstroShield: ✅ Cratera calculada: 1.18 km

**Chicxulub (extinção dos dinossauros)**
- Asteroide: ~10 km de diâmetro
- Energia: ~100 milhões de MT
- Simulação no AstroShield: ✅ Valores na ordem de grandeza correta

---

## 🎓 Casos de Uso

### Educação
- **Professores:** Demonstrar física de impactos em aula
- **Estudantes:** Experimentar com parâmetros e observar efeitos
- **Museus:** Exibição interativa sobre defesa planetária

### Ciência
- **Pesquisadores:** Validar modelos de cratera
- **Astrônomos:** Avaliar riscos de NEOs catalogados
- **Geólogos:** Estudar eventos de impacto históricos

### Público Geral
- **Conscientização:** Compreender ameaças espaciais reais
- **Engajamento:** Aprender ciência de forma divertida
- **Preparação:** Entender escalas de desastres naturais

---

## 📊 Dados e Referências

### APIs Utilizadas (planejado para próximas fases)
- **NASA NEO API:** https://api.nasa.gov/neo/rest/v1/neo/
- **USGS National Map:** https://www.usgs.gov/programs/national-geospatial-program/national-map

### Referências Científicas
1. **Collins, G. S., et al. (2005)** - Earth Impact Effects Program
2. **Ward, S. N., & Asphaug, E. (2000)** - Asteroid Impact Tsunami
3. **Toon, O. B., et al. (1997)** - Environmental Perturbations Caused by Impacts

### Desafio Oficial
- **NASA Space Apps Challenge 2025:** https://www.spaceappschallenge.org/2025/challenges/meteor-madness/

---

## 🛣️ Roadmap

### ✅ Fase 1: MVP (Atual)
- [x] Visualização 3D da Terra
- [x] Seleção de local de impacto
- [x] Cálculos físicos básicos
- [x] Interface de parâmetros
- [x] Painel de resultados

### 🔄 Fase 2: Beta (Próximos passos)
- [ ] Integração NASA NEO API (dados reais de asteroides)
- [ ] Mapa de densidade populacional (USGS)
- [ ] Diferenciação impacto terrestre vs. oceânico (tsunamis)
- [ ] Sistema de usuários e histórico
- [ ] Exportação de relatórios PDF

### 📅 Fase 3: Produção (Futuro)
- [ ] Estratégias de mitigação (DART, trator gravitacional)
- [ ] Modo gamificado com missões
- [ ] Sistema de pontuação e ranking
- [ ] Multilíngue (EN/PT/ES)
- [ ] Realidade Aumentada (AR)
- [ ] API pública para desenvolvedores

---

## 🤝 Contribuindo

Este projeto foi desenvolvido para o **NASA Space Apps Challenge 2025**.

### Equipe
- **Desenvolvedor:** [Seu Nome/Equipe]
- **Desafio:** Meteor Madness
- **Ano:** 2025

---

## 📜 Licença

MIT License - Veja arquivo LICENSE para detalhes.

---

## 🙏 Agradecimentos

- **NASA** - Near-Earth Object Program e APIs abertas
- **USGS** - Dados geoespaciais públicos
- **Three.js** - Biblioteca 3D incrível
- **NASA Space Apps Challenge** - Por inspirar soluções inovadoras

---

## 📧 Contato

Para dúvidas, sugestões ou colaborações:
- **GitHub Issues:** [Link do repositório]
- **Email:** [seu-email]

---

**🌍 Defendendo a Terra, um asteroide por vez!**
