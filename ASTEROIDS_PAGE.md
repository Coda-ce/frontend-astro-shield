# 🛰️ Página de Asteroides - Documentação

## Visão Geral

Página dedicada para visualização completa e detalhada de todos os asteroides próximos da Terra, com funcionalidades de busca, filtros e ordenação.

---

## 📍 Acesso

**URL:** `/asteroids.html`

**Acesso pela página principal:**
- Card "Asteroides Próximos" (lado esquerdo)
- Botão **"📋 Ver Todos os Asteroides"**

**Navegação:**
- ← Botão "Voltar para Simulação" (header)
- Link direto: `index.html`

---

## 🎯 Funcionalidades

### 1. **Estatísticas Gerais** (Topo)

Quatro cards mostrando:
- **Total de Asteroides** - Quantidade total carregada
- **⚠️ Potencialmente Perigosos** - Marcados pela NASA como PHAs
- **✅ Seguros** - Não classificados como perigosos
- **📏 Mais Próximo** - Menor distância lunar encontrada

### 2. **Sistema de Busca**

```
🔍 Buscar: [Digite nome ou ID do asteroide...]
```

**Funcionalidade:**
- Busca em tempo real (sem necessidade de apertar Enter)
- Procura em: Nome + ID do asteroide
- Case-insensitive
- Atualiza resultados instantaneamente

**Exemplos de busca:**
- `2025 AB` - Encontra asteroide específico
- `374093` - Busca por ID parcial
- `BD15` - Busca por parte do nome

### 3. **Ordenação**

```
Ordenar por: [Dropdown]
```

**Opções disponíveis:**
- **Distância (mais próximo)** - Padrão, do mais próximo ao mais distante
- **Nome (A-Z)** - Ordem alfabética
- **Tamanho (maior)** - Do maior ao menor diâmetro
- **Velocidade (mais rápido)** - Da maior à menor velocidade
- **Data de aproximação** - Data mais próxima primeiro

### 4. **Filtros**

```
Filtrar: [Dropdown]
```

**Opções:**
- **Todos** - Mostra todos os asteroides (padrão)
- **Apenas perigosos** - Somente PHAs (Potentially Hazardous Asteroids)
- **Apenas seguros** - Não-PHAs
- **Muito próximos (< 1 LD)** - Asteroides a menos de 1 distância lunar

### 5. **Cards de Asteroides**

Cada asteroide é exibido em um card individual contendo:

#### Header:
- **Nome** - Nome oficial do asteroide
- **ID** - Identificador único da NASA
- **Badge de Status** - ⚠️ Perigoso ou ✅ Seguro

#### Detalhes (6 informações):

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| 📏 **Distância** | Em distâncias lunares (LD) e km | 0.40 LD (153 mil km) |
| 📐 **Tamanho** | Diâmetro médio em metros (range em km) | 16 m (0.01-0.02 km) |
| 🚀 **Velocidade** | km/s e km/h | 11.56 km/s (41.617 km/h) |
| 📅 **Aproximação** | Data e hora completa | 2025-Jan-03 14:30 |
| ✨ **Magnitude** | Magnitude absoluta H + descrição | 28.0H (Fraco) |
| 🌍 **Orbitando** | Corpo celeste + distância relativa | Earth (Muito Próximo) |

#### Indicador de Cor por Distância:

- 🔴 **Vermelho** - < 1 LD (Muito Próximo)
- 🟠 **Laranja** - 1-5 LD (Próximo)
- 🟡 **Amarelo** - 5-20 LD (Moderado)
- 🟢 **Verde** - > 20 LD (Distante)

#### Footer (Ações):

- **🔗 NASA JPL** - Abre página oficial da NASA com detalhes completos
- **📋 Copiar Nome** - Copia nome do asteroide para área de transferência

---

## 🎨 Layout Responsivo

### Desktop:
```
┌────────────────────────────────────────┐
│  Header: 🛰️ Asteroides + ← Voltar      │
├────────────────────────────────────────┤
│  [Stats: Total | Perigosos | etc...]   │
├────────────────────────────────────────┤
│  [🔍 Buscar] [Ordenar] [Filtrar]       │
├────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │Card │  │Card │  │Card │  │Card │   │
│  │  1  │  │  2  │  │  3  │  │  4  │   │
│  └─────┘  └─────┘  └─────┘  └─────┘   │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │Card │  │Card │  │Card │  │Card │   │
│  │  5  │  │  6  │  │  7  │  │  8  │   │
│  └─────┘  └─────┘  └─────┘  └─────┘   │
└────────────────────────────────────────┘
```

**Grid:** Auto-fill com mínimo de 350px por card
**Gap:** 20px entre cards
**Responsivo:** Ajusta automaticamente para tablet/mobile

---

## 📊 Dados da NASA NEO API

### Endpoint Usado:
```
https://api.nasa.gov/neo/rest/v1/feed?start_date={today}&api_key={API_KEY}
```

### Campos Processados:

```javascript
{
  id: "3740934",
  name: "(2025 AB)",
  nasaUrl: "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=...",
  isHazardous: true/false,
  absoluteMagnitude: 21.2,

  diameter: {
    min: 0.15,      // km
    max: 0.34,      // km
    avg: 0.245      // km
  },

  distance: {
    km: 153127.05,        // quilômetros
    lunar: 0.398,         // distâncias lunares
    au: 0.00102          // unidades astronômicas
  },

  velocity: {
    kmh: 41617.22,       // km/hora
    kms: 11.56           // km/segundo
  },

  approach: {
    date: "2025-01-03",
    dateFull: "2025-Jan-03 14:30",
    orbitingBody: "Earth"
  }
}
```

---

## ⚡ Performance

### Otimizações:
- ✅ Carregamento assíncrono da API
- ✅ Filtros aplicados no client-side (sem nova requisição)
- ✅ Ordenação em memória
- ✅ Busca com debounce implícito (input event)
- ✅ Grid responsivo CSS (sem JavaScript)

### Tempo de Carregamento:
- **Requisição API:** ~1-2 segundos
- **Processamento:** < 100ms
- **Renderização:** < 200ms
- **Total:** ~1.5-2.5 segundos

---

## 🔧 Código-Fonte

### Arquivos:

| Arquivo | Função |
|---------|--------|
| `asteroids.html` | Interface HTML + CSS |
| `asteroids-viewer.js` | Lógica JavaScript (ES6 Module) |
| `config.js` | API Key da NASA (compartilhado) |

### Classes JavaScript:

```javascript
class AsteroidsListViewer {
    constructor()              // Inicializa
    async loadAsteroids()      // Carrega da API
    processAsteroidData(neo)   // Processa dados
    updateStats()              // Atualiza estatísticas
    applyFilters()             // Aplica busca + filtros
    sortAsteroids(sortBy)      // Ordena lista
    renderAsteroids()          // Renderiza cards
}
```

---

## 🎯 Casos de Uso

### 1. Usuário quer ver todos os asteroides
```
1. Clicar em "Ver Todos os Asteroides"
2. Aguardar carregamento (1-2s)
3. Visualizar grid completo
```

### 2. Buscar asteroide específico
```
1. Ir para página de asteroides
2. Digitar nome/ID na busca
3. Resultados filtrados automaticamente
```

### 3. Ver apenas asteroides perigosos
```
1. Selecionar filtro: "Apenas perigosos"
2. Lista atualiza mostrando só PHAs
```

### 4. Ordenar por tamanho
```
1. Selecionar ordenação: "Tamanho (maior)"
2. Lista reordena do maior ao menor
```

### 5. Acessar detalhes na NASA
```
1. Encontrar asteroide de interesse
2. Clicar em "🔗 NASA JPL"
3. Abre nova aba com página oficial
```

---

## 🆘 Tratamento de Erros

### Se API falhar:
```
❌ Erro ao carregar asteroides
[Mensagem de erro detalhada]

← Voltar
```

### Se nenhum resultado encontrado:
```
Nenhum asteroide encontrado
Tente ajustar os filtros ou busca
```

---

## 🔐 Acessibilidade

### Recursos implementados:
- ✅ Navegação por teclado (Tab)
- ✅ Contraste adequado WCAG AA
- ✅ Textos descritivos em badges
- ✅ Links externos claramente marcados
- ✅ Feedback visual em hover
- ✅ Mensagens de estado (loading, erro, vazio)

---

## 🚀 Melhorias Futuras

### Possíveis expansões:
1. **Paginação** - Para mais de 50 asteroides
2. **Gráficos** - Visualização de dados em charts
3. **Comparação** - Selecionar 2+ asteroides para comparar
4. **Exportação** - Download da lista em CSV/JSON
5. **Favoritos** - Marcar asteroides de interesse
6. **Notificações** - Alertas de novas aproximações
7. **Filtros avançados** - Por magnitude, velocidade específica, etc.
8. **Timeline** - Linha do tempo de aproximações
9. **3D Preview** - Mini-visualização 3D de cada asteroide
10. **Compartilhamento** - Compartilhar asteroide específico via link

---

## 📱 Responsividade

### Breakpoints:

| Tamanho | Layout |
|---------|--------|
| > 1200px | 4 colunas |
| 900-1200px | 3 colunas |
| 600-900px | 2 colunas |
| < 600px | 1 coluna |

---

## 🎓 Valor Educacional

### O que o usuário aprende:
1. **Escala espacial** - Distâncias lunares vs km
2. **Velocidades cósmicas** - 10+ km/s é normal
3. **Tamanhos variados** - De metros a quilômetros
4. **Perigo relativo** - Nem todo asteroide próximo é perigoso
5. **Frequência** - Quantos asteroides passam diariamente
6. **Magnitude** - Conceito astronômico de brilho

---

**Versão:** 1.0
**Data:** 2025-01-04
**Desenvolvedor:** AstroShield Team
**Fonte de Dados:** NASA NEO API
**Licença:** MIT
