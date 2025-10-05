# 📂 Estrutura do Projeto AstroShield

## Visão Geral da Arquitetura

```
AstroShield
├── Frontend (Web App)
│   ├── HTML5 + CSS3
│   ├── Three.js (Visualização 3D)
│   └── Vanilla JavaScript (ES6+)
│
├── APIs Externas
│   ├── NASA NEO API (Dados de asteroides)
│   └── USGS National Map (Dados geoespaciais)
│
└── (Futuro) Backend
    ├── Django 5.x
    ├── PostgreSQL + PostGIS
    └── API REST
```

---

## Estrutura de Diretórios

```
threejs-model-viewer/
│
├── 📄 index.html                    # Página principal da aplicação
│   └── Interface completa com:
│       ├── Header com branding
│       ├── Canvas 3D (Three.js)
│       ├── Painel de controles (esquerda)
│       ├── Painel de resultados (direita)
│       └── Instruções de uso
│
├── 📄 examples.html                 # Galeria de cenários históricos
│   └── 10+ cenários pré-configurados:
│       ├── Eventos históricos (Tunguska, Chicxulub)
│       ├── Asteroides conhecidos (Apophis, Bennu)
│       └── Cenários educacionais
│
├── 📜 app.js                        # Lógica principal da aplicação
│   ├── AstroShieldViewer           # Classe de visualização 3D
│   │   ├── Scene, Camera, Renderer
│   │   ├── Controles de órbita
│   │   ├── Carregamento do modelo 3D
│   │   ├── Sistema de raycasting (clique no globo)
│   │   ├── Marcadores de impacto
│   │   └── Animação de loop
│   │
│   ├── ImpactCalculator            # Motor de cálculos físicos
│   │   ├── calculateMass()
│   │   ├── calculateKineticEnergy()
│   │   ├── calculateCraterDiameter()
│   │   ├── calculateSeismicMagnitude()
│   │   ├── calculateBlastRadius()
│   │   └── compareToHiroshima()
│   │
│   └── UIController                # Gerenciador de interface
│       ├── setupEventListeners()
│       ├── loadScenario()
│       └── runSimulation()
│
├── 📜 nasa-neo-integration.js      # Integração com NASA API
│   ├── NASANEOService             # Classe de serviço
│   │   ├── getFeed()              # Busca asteroides próximos
│   │   ├── getAsteroidDetails()   # Detalhes específicos
│   │   ├── getHazardousAsteroids() # Filtro de perigosos
│   │   ├── parseAsteroidData()    # Normalização de dados
│   │   └── prepareImpactSimulation() # Conversão para simulação
│   │
│   └── NEOSelector                # Seletor de UI
│       ├── initializeNEOSelector()
│       ├── onNEOSelected()
│       └── generateAsteroidOptions()
│
├── 🌍 earth_3d.glb                 # Modelo 3D da Terra (12.9 MB)
│   └── Formato: GLTF/GLB
│   └── Textura: Alta resolução
│   └── Usado por: GLTFLoader (Three.js)
│
├── 📦 three.js/                    # Biblioteca Three.js r180
│   ├── build/
│   │   ├── three.module.js        # Build ES6 modules
│   │   └── three.cjs              # Build CommonJS
│   └── examples/jsm/              # Addons
│       ├── loaders/GLTFLoader.js
│       └── controls/OrbitControls.js
│
├── 📘 README.md                    # Documentação principal
├── 📗 SETUP_NASA_API.md           # Guia de configuração da API
├── 📙 CONTRIBUTING.md              # Guia de contribuição
├── 📕 PROJECT_STRUCTURE.md         # Este arquivo
│
├── 📋 package.json                 # Configuração do projeto
├── 🚫 .gitignore                   # Arquivos ignorados pelo Git
│
└── (Futuro) backend/              # Backend Django (não implementado)
    ├── manage.py
    ├── astroshield/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── api/
    │   ├── models.py
    │   ├── serializers.py
    │   └── views.py
    └── requirements.txt
```

---

## Fluxo de Dados

### 1. Inicialização da Aplicação

```
┌─────────────────┐
│ index.html      │
│ carrega         │
└────────┬────────┘
         │
         ├─> Importa three.js (ES6 module)
         ├─> Importa app.js
         └─> DOMContentLoaded
                 │
                 v
         ┌───────────────────┐
         │ AstroShieldViewer │
         │ inicializa        │
         └─────────┬─────────┘
                   │
                   ├─> Setup Scene, Camera, Renderer
                   ├─> Adiciona iluminação
                   ├─> Cria campo de estrelas
                   ├─> Carrega earth_3d.glb
                   └─> Inicia loop de animação
```

### 2. Simulação de Impacto

```
Usuário ajusta parâmetros
         │
         v
┌────────────────────┐
│ Sliders/Selects    │
│ - Diâmetro         │
│ - Velocidade       │
│ - Ângulo           │
│ - Densidade        │
└────────┬───────────┘
         │
         v
Usuário clica "Simular"
         │
         v
┌────────────────────┐
│ UIController       │
│ runSimulation()    │
└────────┬───────────┘
         │
         v
┌────────────────────┐
│ ImpactCalculator   │
│ - Calcula massa    │
│ - Calcula energia  │
│ - Calcula cratera  │
│ - Calcula blast    │
└────────┬───────────┘
         │
         v
┌────────────────────┐
│ Atualiza UI        │
│ - Painel resultado │
│ - Zona de impacto  │
│ - Marcador 3D      │
└────────────────────┘
```

### 3. Integração NASA NEO API (Opcional)

```
┌─────────────────┐
│ Usuário importa │
│ nasa-neo-       │
│ integration.js  │
└────────┬────────┘
         │
         v
┌────────────────────┐
│ NASANEOService     │
│ getFeed()          │
└────────┬───────────┘
         │
         v
┌────────────────────┐
│ NASA API           │
│ https://api.nasa   │
│ .gov/neo/rest/v1   │
└────────┬───────────┘
         │
         v
┌────────────────────┐
│ Dados parseados    │
│ parseAsteroidData()│
└────────┬───────────┘
         │
         v
┌────────────────────┐
│ NEOSelector        │
│ Popula dropdown    │
└────────┬───────────┘
         │
         v
Usuário seleciona asteroide
         │
         v
Parâmetros preenchidos automaticamente
```

---

## Componentes Principais

### 1. AstroShieldViewer (app.js:30-230)

**Responsabilidades:**
- Gerenciar cena 3D (Three.js)
- Renderizar modelo da Terra
- Detectar cliques no globo (raycasting)
- Adicionar marcadores de impacto
- Visualizar zonas de devastação
- Animação contínua

**Dependências:**
- Three.js core
- GLTFLoader
- OrbitControls

**Métodos principais:**
```javascript
constructor()               // Inicializa cena
setupLights()              // Configura iluminação
setupStars()               // Campo de estrelas
loadEarthModel()           // Carrega earth_3d.glb
setupRaycaster()           // Sistema de clique
addImpactMarker(position)  // Marcador vermelho
addImpactZone(lat,lon,rad) // Círculo de devastação
animate()                  // Loop de renderização
```

---

### 2. ImpactCalculator (app.js:235-315)

**Responsabilidades:**
- Cálculos físicos precisos
- Conversões de unidades
- Comparações históricas

**Métodos principais:**
```javascript
calculateMass(diameter, density)
    → retorna massa em kg

calculateKineticEnergy(mass, velocity)
    → E = ½mv²
    → retorna Joules

energyToMegatons(energy)
    → 1 MT = 4.184 × 10^15 J
    → retorna Megatons TNT

calculateCraterDiameter(energy, angle, density)
    → Fórmula Collins et al. (2005)
    → retorna km

calculateSeismicMagnitude(energy)
    → Escala Richter equivalente
    → M = ⅔ log₁₀(E) - 3.2

calculateBlastRadius(energy)
    → Overpressure 20 PSI
    → R = 2.2 × E^0.33

calculateThermalRadius(energy)
    → Queimaduras 3º grau
    → R = 3.5 × E^0.41

compareToHiroshima(energy)
    → Hiroshima = 0.015 MT
    → retorna fator multiplicativo
```

---

### 3. UIController (app.js:320-415)

**Responsabilidades:**
- Gerenciar eventos de UI
- Sincronizar inputs com valores exibidos
- Executar simulações
- Carregar cenários pré-definidos

**Métodos principais:**
```javascript
constructor(viewer)
    → Inicializa com referência ao viewer

setupEventListeners()
    → Vincula sliders, selects, botões

loadScenario(scenario)
    → Carrega cenário de examples.html
    → Preenche campos
    → Executa simulação auto

runSimulation()
    → Coleta parâmetros da UI
    → Chama ImpactCalculator
    → Atualiza painel de resultados
    → Visualiza zona no globo
```

---

### 4. NASANEOService (nasa-neo-integration.js:10-200)

**Responsabilidades:**
- Comunicação com NASA API
- Cache de dados (1 hora)
- Parsing e normalização
- Estimativa de densidade

**Métodos principais:**
```javascript
getFeed(startDate, endDate)
    → GET /neo/rest/v1/feed
    → retorna lista de NEOs

getAsteroidDetails(id)
    → GET /neo/rest/v1/neo/{id}
    → retorna dados completos

getHazardousAsteroids()
    → Filtra apenas perigosos
    → is_potentially_hazardous = true

parseAsteroidData(neoData)
    → Normaliza resposta da API
    → Extrai: diameter, velocity, orbit

prepareImpactSimulation(data)
    → Converte dados NASA para simulação
    → Estima densidade por tipo
```

---

## Modelos de Dados

### Parâmetros de Simulação
```javascript
{
    diameter_m: 500,           // Diâmetro em metros
    density_kg_m3: 2500,       // Densidade em kg/m³
    velocity_km_s: 28,         // Velocidade em km/s
    impact_angle_deg: 45,      // Ângulo 10-90°
    location: {
        lat: 40.7128,          // Latitude
        lon: -74.0060          // Longitude
    }
}
```

### Resultados de Simulação
```javascript
{
    energy_megatons: 1200,     // Energia TNT
    crater_diameter_km: 7.2,   // Diâmetro cratera
    seismic_magnitude: 7.8,    // Escala Richter
    blast_radius_km: 45,       // Raio devastação
    thermal_radius_km: 120,    // Raio térmico
    comparison: "80× Tsar Bomba"
}
```

### Dados de Asteroide (NASA)
```javascript
{
    id: "2099942",
    name: "99942 Apophis",
    diameter: {
        min: 0.34,
        max: 0.37,
        average: 0.355      // km
    },
    velocity: {
        km_s: 30.7,
        km_h: 110520
    },
    miss_distance: {
        km: 31000,
        lunar: 0.08        // Distâncias Terra-Lua
    },
    orbital: {
        eccentricity: 0.191,
        semi_major_axis: 0.922
    },
    is_hazardous: true,
    close_approach_date: "2029-04-13T21:46:00.000Z"
}
```

---

## Tecnologias e Bibliotecas

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Three.js | r180 | Renderização 3D |
| JavaScript | ES6+ | Lógica aplicação |
| HTML5 | - | Estrutura |
| CSS3 | - | Estilo e tema |

### APIs Externas
| API | Endpoint Base | Dados |
|-----|---------------|-------|
| NASA NEO | `https://api.nasa.gov/neo/rest/v1` | Asteroides |
| USGS (futuro) | `https://www.usgs.gov/...` | Geoespacial |

### Ferramentas de Desenvolvimento
| Ferramenta | Uso |
|------------|-----|
| Python HTTP Server | Servidor local |
| Git | Controle de versão |
| VS Code | Editor recomendado |

---

## Performance e Otimização

### Carregamento
- **earth_3d.glb:** 12.9 MB (comprimido GLTF)
- **Three.js:** ~600 KB (minificado)
- **app.js:** ~15 KB
- **Total:** ~14 MB primeira carga

### Otimizações Implementadas
1. **Cache NASA API:** 1 hora TTL
2. **Requestanimationframe:** Loop eficiente
3. **LOD potencial:** Modelo Terra pode ter níveis de detalhe

### Melhorias Futuras
- [ ] Lazy loading de three.js addons
- [ ] Service Worker para cache offline
- [ ] Compressão Brotli/Gzip
- [ ] CDN para assets estáticos

---

## Deployment

### Opções de Hospedagem

**1. GitHub Pages (Grátis)**
```bash
# Build estático, sem backend
git push origin main
# Ativar Pages em Settings
```

**2. Netlify/Vercel (Grátis)**
```bash
# Deploy automático via Git
netlify deploy --prod
```

**3. AWS S3 + CloudFront (Produção)**
```bash
# Bucket S3 + CDN global
aws s3 sync . s3://astroshield-app
aws cloudfront create-invalidation
```

**4. Heroku/Railway (Com Backend)**
```bash
# Para quando adicionar Django
git push heroku main
```

---

## Manutenção e Atualizações

### Atualizações Regulares
- **Three.js:** Verificar releases trimestralmente
- **NASA API:** Dados atualizados automaticamente
- **Modelo 3D:** Substituir se melhor qualidade disponível

### Monitoramento
- **Uptime:** Status da NASA API
- **Analytics:** Google Analytics (futuro)
- **Erros:** Sentry ou similar (produção)

---

## Referências Técnicas

**Three.js:**
- Docs: https://threejs.org/docs/
- Examples: https://threejs.org/examples/

**NASA APIs:**
- Portal: https://api.nasa.gov/
- NEO Docs: https://api.nasa.gov/api.html#NeoWS

**WebGL:**
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

**GLTF:**
- Spec: https://www.khronos.org/gltf/

---

## Contato e Suporte

**Issues:** GitHub Issues
**Documentação:** README.md
**Contribuições:** CONTRIBUTING.md

---

**Última atualização:** Outubro 2025
**Versão:** 0.1.0 (MVP)
