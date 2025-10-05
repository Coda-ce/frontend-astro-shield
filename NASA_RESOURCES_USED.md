# 🚀 Recursos da NASA Utilizados no Projeto AstroShield

## 📋 Resumo Executivo

Este documento lista **todos os recursos, APIs e dados da NASA** utilizados no projeto AstroShield para o NASA Space Apps Challenge 2025.

---

## 🛰️ APIs da NASA Utilizadas

### 1. **NASA NEO (Near-Earth Object) REST API**

**Status:** ✅ **IMPLEMENTADO E ATIVO**

**Endpoint Principal:**
```
https://api.nasa.gov/neo/rest/v1/feed
```

**Autenticação:**
- API Key: Registrada e ativa
- Armazenada em: `config.js`
- Rate Limit: 1.000 requisições/hora

**Dados Obtidos:**
```json
{
  "near_earth_objects": {
    "2025-01-04": [
      {
        "id": "3740934",
        "name": "(2025 AB)",
        "nasa_jpl_url": "https://ssd.jpl.nasa.gov/...",
        "absolute_magnitude_h": 21.2,
        "estimated_diameter": {
          "kilometers": {
            "estimated_diameter_min": 0.1529519353,
            "estimated_diameter_max": 0.3420109247
          }
        },
        "is_potentially_hazardous_asteroid": true,
        "close_approach_data": [{
          "close_approach_date": "2025-01-05",
          "close_approach_date_full": "2025-Jan-05 10:46",
          "relative_velocity": {
            "kilometers_per_second": "25.9398250191",
            "kilometers_per_hour": "93383.3700688104"
          },
          "miss_distance": {
            "astronomical": "0.4776191566",
            "lunar": "185.7938519174",
            "kilometers": "71450808.498556442"
          },
          "orbiting_body": "Earth"
        }]
      }
    ]
  }
}
```

**Campos Utilizados:**

| Campo da API | Uso no Projeto | Onde é Exibido |
|--------------|----------------|----------------|
| `id` | Identificador único | Cards de asteroides, busca |
| `name` | Nome oficial | Título dos cards, visualização 3D |
| `nasa_jpl_url` | Link para detalhes | Botão "NASA JPL" |
| `absolute_magnitude_h` | Brilho aparente | Card detalhado (magnitude) |
| `estimated_diameter.kilometers` | Tamanho do asteroide | Cálculo visual 3D, cards |
| `is_potentially_hazardous_asteroid` | Classificação de perigo | Cores, badges, filtros |
| `close_approach_data.close_approach_date` | Data de aproximação | Cards, ordenação |
| `close_approach_data.relative_velocity` | Velocidade relativa | Cards (km/s e km/h) |
| `miss_distance.lunar` | Distância em Luas | **Sistema de escala real** |
| `miss_distance.kilometers` | Distância em km | Cálculo de posições 3D |
| `miss_distance.astronomical` | Distância em UA | Card detalhado |

**Frequência de Uso:**
- Página principal (`index.html`): 1 requisição ao carregar
- Página de asteroides (`asteroids.html`): 1 requisição ao carregar
- **Total estimado:** 2-3 requisições por sessão de usuário

**Implementação:**
- Arquivo: `asteroid-orbital-view.js` (linhas 58-106)
- Arquivo: `asteroids-viewer.js` (linhas 17-63)

---

## 📊 Dados Científicos da NASA Aplicados

### 2. **Fórmulas Científicas de Impacto**

**Fonte:** NASA/JPL - Collins et al. (2005) - Earth Impact Effects Program

**Fórmulas Implementadas:**

#### A. **Cálculo de Energia de Impacto**
```javascript
// Energia Cinética
E = 0.5 × m × v²

// Onde:
// m = massa do asteroide (kg)
// v = velocidade de impacto (m/s)
// E = energia em Joules
```

**Conversão para Megatons TNT:**
```javascript
Megatons = Joules / 4.184e15
```

**Implementação:** `app.js` (linhas 526-533)

#### B. **Diâmetro da Cratera (Collins et al., 2005)**
```javascript
D_crater = 1.161 × E^0.302 × ρ^(-0.302) × sin(θ)^0.302

// Onde:
// E = energia em Joules
// ρ = densidade do alvo (kg/m³)
// θ = ângulo de entrada
// D = diâmetro em metros
```

**Implementação:** `app.js` (linhas 535-546)

#### C. **Magnitude Sísmica Equivalente**
```javascript
M = (2/3) × log₁₀(E) - 3.2

// Escala Richter baseada em energia
```

**Implementação:** `app.js` (linhas 548-551)

#### D. **Raio de Devastação (Overpressure 20 PSI)**
```javascript
R_blast = 2.2 × E^0.33

// E em megatons
// R em km
```

**Implementação:** `app.js` (linhas 553-556)

#### E. **Raio Térmico (Queimaduras 3º Grau)**
```javascript
R_thermal = 3.5 × E^0.41

// E em megatons
// R em km
```

**Implementação:** `app.js` (linhas 558-561)

**Referência Científica:**
- Collins, G. S., Melosh, H. J., & Marcus, R. A. (2005). "Earth Impact Effects Program: A Web‐based computer program for calculating the regional environmental consequences of a meteoroid impact on Earth"

---

## 🌍 Modelos 3D e Texturas

### 3. **Modelo 3D da Terra**

**Fonte:** NASA Scientific Visualization Studio

**Arquivo:** `earth_3d.glb` (carregado localmente)

**Características:**
- Formato: GLTF/GLB
- Textura: Baseada em dados de satélite da NASA
- Blue Marble: Imagens da NASA Earth Observatory
- Resolução: Otimizada para web

**Fallback:** Textura procedural gerada quando modelo não carrega
```javascript
// Cores baseadas em NASA Earth imagery
oceanColor: '#1a4d7a' // Azul oceano
landColor: '#2d5a2d'  // Verde continentes
```

**Implementação:** `app.js` (linhas 115-289)

---

## 🔬 Conceitos Científicos da NASA

### 4. **Constantes Astronômicas**

**Distância Lunar (LD):**
```javascript
LUNAR_DISTANCE_KM = 384.400 km
```
**Fonte:** NASA Moon Fact Sheet
**Uso:** Escala de referência para asteroides próximos

**Raio da Terra:**
```javascript
EARTH_RADIUS_KM = 6.371 km
```
**Fonte:** NASA Earth Fact Sheet
**Uso:** Cálculos de impacto e visualização

**Unidade Astronômica (AU):**
```javascript
1 AU = 149.597.871 km
```
**Fonte:** IAU/NASA
**Uso:** Conversão de distâncias

---

## 📡 Integrações com Recursos NASA

### 5. **Links para Recursos NASA**

#### NASA JPL Small-Body Database
```
https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr={asteroid_id}
```
**Uso:** Botão "NASA JPL" em cada card de asteroide
**Dados acessados:** Órbita completa, histórico, características físicas

#### NASA Eyes on Asteroids
**Mencionado em:** Curiosidade científica
**Link:** https://eyes.nasa.gov/apps/asteroids/

---

## 🎓 Dados Educacionais da NASA

### 6. **Eventos Históricos de Impacto**

**Chicxulub (Extinção dos Dinossauros):**
- Data: 66 milhões de anos atrás
- Diâmetro: 10-15 km
- Energia: ~10 bilhões de bombas de Hiroshima
- **Fonte:** NASA Planetary Defense Coordination Office

**Tunguska (1908):**
- Diâmetro estimado: 50-60 metros
- Energia: 10-15 megatons
- **Fonte:** NASA Near-Earth Object Program

**Implementação:** `index.html` (linhas 422-426) - Curiosidade científica

---

## 📋 Classificações da NASA Utilizadas

### 7. **Potentially Hazardous Asteroid (PHA)**

**Definição NASA:**
- Asteroide com distância mínima de órbita (MOID) ≤ 0.05 AU
- Magnitude absoluta H ≤ 22.0 (diâmetro ≥ 140 metros)

**Uso no Projeto:**
- Filtro "Apenas perigosos"
- Badge vermelho/verde
- Cores de alerta

**Campo API:** `is_potentially_hazardous_asteroid`

---

## 🛡️ NASA Planetary Defense

### 8. **Conceitos de Defesa Planetária**

**Programa da NASA:** Planetary Defense Coordination Office (PDCO)

**Aplicado no Projeto:**
- Sistema de alerta visual (cores por proximidade)
- Classificação de risco
- Dados de monitoramento em tempo real

**Referência:**
- NASA PDCO: https://www.nasa.gov/planetarydefense
- Center for NEO Studies (CNEOS)

---

## 📊 Estatísticas e Metadados

### Resumo de Uso:

| Recurso NASA | Status | Frequência | Impacto |
|--------------|--------|------------|---------|
| NEO REST API | ✅ Ativo | Cada carregamento | **CRÍTICO** |
| Fórmulas de Impacto | ✅ Implementado | Cada simulação | **ALTO** |
| Dados Astronômicos | ✅ Constantes | Sempre | **ALTO** |
| Modelo 3D Terra | ✅ Carregado | Visualização | **MÉDIO** |
| JPL Database Links | ✅ Links externos | Por asteroide | **MÉDIO** |
| Conceitos Científicos | ✅ Aplicados | Interface/Educação | **ALTO** |

---

## 🔐 Credenciais e Limites

### API Key da NASA

**Registrada para:** AstroShield - NASA Space Apps Challenge 2025

**Limites:**
- Requisições/hora: 1.000
- Requisições/dia: Ilimitado (com API Key)
- Demo Key: 30 requisições/hora (não usado)

**Uso Estimado:**
- Desenvolvimento: ~50 requisições/dia
- Produção estimada: ~100-500 requisições/dia
- **Status:** Dentro dos limites ✅

---

## 📚 Documentação NASA Consultada

### APIs:
1. **NASA Open APIs** - https://api.nasa.gov/
2. **NEO API Documentation** - https://api.nasa.gov/neo/
3. **JPL Small-Body Database** - https://ssd.jpl.nasa.gov/

### Recursos Científicos:
1. **NASA Planetary Defense** - https://www.nasa.gov/planetarydefense
2. **CNEOS NEO Basics** - https://cneos.jpl.nasa.gov/about/neo_groups.html
3. **Earth Impact Effects Program** - https://impact.ese.ic.ac.uk/ImpactEarth/

### Dados Educacionais:
1. **NASA Earth Observatory** - https://earthobservatory.nasa.gov/
2. **NASA Moon Fact Sheet** - https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
3. **NASA Eyes Visualization** - https://eyes.nasa.gov/

---

## 🎯 Valor Agregado ao Projeto

### Dados da NASA Transformados em:

1. **Visualização 3D Interativa**
   - Asteroides reais em órbita
   - Escala científica adaptativa
   - Cores por proximidade

2. **Simulação Física Precisa**
   - Cálculos validados pela NASA/JPL
   - Energia, cratera, raios de impacto
   - Comparações educacionais

3. **Lista Completa e Filtrada**
   - Todos os asteroides próximos atualizados
   - Busca, ordenação, filtros
   - Links diretos para NASA JPL

4. **Educação Científica**
   - Dados reais e atuais
   - Contexto histórico
   - Comparações tangíveis

---

## 🚀 Conformidade com NASA Space Apps

### Requisitos Atendidos:

✅ **Uso de dados da NASA:** NEO API principal
✅ **Aplicação científica:** Fórmulas validadas
✅ **Dados em tempo real:** API atualizada diariamente
✅ **Educação pública:** Interface acessível
✅ **Código aberto:** Documentado e compartilhável
✅ **Créditos claros:** NASA citada em toda documentação

---

## 📝 Citações e Créditos

### Obrigatórias:

```
Dados de asteroides fornecidos por:
NASA Near-Earth Object Program
Jet Propulsion Laboratory (JPL)
Center for Near-Earth Object Studies (CNEOS)

API: NASA Open APIs (api.nasa.gov)
Fórmulas: Collins et al. (2005) - Earth Impact Effects

Visualização 3D baseada em:
NASA Earth Observatory - Blue Marble
NASA Scientific Visualization Studio
```

---

## 🔄 Atualizações Futuras Planejadas

### Recursos NASA a Explorar:

1. **Sentry Impact Risk Table API** - Asteroides de maior risco
2. **Orbital Elements API** - Dados orbitais completos
3. **DART Mission Data** - Teste de deflexão
4. **Fireball API** - Meteoros detectados
5. **Asterank API** - Dados de composição

---

**Documento Atualizado:** 2025-01-04
**Projeto:** AstroShield
**Evento:** NASA Space Apps Challenge 2025
**Versão:** 1.0
**Licença:** Dados da NASA são de domínio público
