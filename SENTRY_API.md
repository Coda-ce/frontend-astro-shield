# 🎯 NASA Sentry API - Documentação Técnica

## Visão Geral

O **NASA Sentry** é um sistema altamente automatizado de monitoramento de colisões que monitora continuamente os catálogos de asteroides mais atuais para identificar objetos que possam representar risco de impacto com a Terra nos próximos 100 anos.

**Implementado no AstroShield**: Integração completa para monitoramento de risco de longo prazo.

---

## 📡 API Endpoint

```
https://ssd-api.jpl.nasa.gov/sentry.api
```

### Características
- **Método**: GET
- **Autenticação**: Não requerida
- **Rate Limit**: Não especificado (uso responsável recomendado)
- **Formato de resposta**: JSON

---

## 🔑 Dados Retornados

### Estrutura Principal

```json
{
  "signature": {
    "source": "NASA/JPL Sentry Data API",
    "version": "1.0"
  },
  "count": "number",
  "data": [...]
}
```

### Objeto Individual (data[])

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `des` | string | Designação primária do objeto |
| `fullname` | string | Nome completo do asteroide |
| `ip` | string | Probabilidade de impacto cumulativa |
| `n_imp` | string | Número de potenciais impactos identificados |
| `ps_max` | string | Palermo Scale máximo (logarítmico) |
| `ts_max` | string | Torino Scale máximo (0-10) |
| `last_obs` | string | Data da última observação |
| `diameter` | string | Diâmetro estimado (km) |
| `energy` | string | Energia cinética estimada (Megatons) |
| `v_inf` | string | Velocidade relativa de impacto (km/s) |

---

## 📊 Escalas de Risco

### Torino Scale (0-10)

Escala categórica usada para comunicar ao público o risco de colisão:

- **0**: Nenhum risco / Probabilidade zero
- **1**: Verde - Normal (observação de rotina)
- **2-3**: Amarelo - Atenção (merece monitoramento cuidadoso)
- **4-7**: Laranja - Ameaçador (risco significativo a global)
- **8-10**: Vermelho - Perigoso (colisão certa, destruição regional a global)

### Palermo Scale (Logarítmica)

Escala técnica logarítmica que compara a probabilidade de impacto com o risco médio de fundo:

- **< -2**: Evento sem consequências
- **-2 a 0**: Atenção dos astrônomos
- **> 0**: Preocupação significativa
- **> 2**: Risco extremo

---

## 💻 Implementação no AstroShield

### Arquivos Criados

1. **sentry-integration.js** - Classe SentryMonitor para integração com API
2. **sentry-watch.html** - Página dedicada de monitoramento Sentry
3. **Integração em index.html** - Painel resumido no simulador principal
4. **Cross-reference em asteroids.html** - Badges Sentry nos asteroides NEO

### Funcionalidades Implementadas

#### 1. Painel Sentry no Simulador Principal (index.html)

```javascript
// Exibe estatísticas em tempo real
- Objetos monitorados (total)
- Maior Torino Scale detectado
- Top 5 asteroides de maior risco
- Link para página completa
```

#### 2. Página Sentry Watch Completa (sentry-watch.html)

**Funcionalidades:**
- 📊 Estatísticas detalhadas (4 cards principais)
- 📅 Timeline de riscos por década
- 🔍 Busca por nome/ID
- 📑 Ordenação (risco, probabilidade, nome, impactos)
- 🎯 Filtros (todos, Torino 1+, alta probabilidade)
- 🔗 Links diretos para JPL Small-Body Database

**Visualizações:**
- Cards coloridos por nível Torino
- Barras de timeline mostrando distribuição temporal de riscos
- Badges de severidade visuais

#### 3. Cross-Reference NEO + Sentry

**Em asteroids.html:**
- Badge "🎯 SENTRY" aparece em asteroides monitorados
- Filtro especial "Monitorados pelo Sentry"
- Tooltip com Torino Scale ao passar mouse

**Algoritmo de Matching:**
```javascript
// Normaliza nomes para comparação
cleanName = asteroidName.replace(/[()]/g, '').trim();
sentryId = sentryObj.id.replace(/[()]/g, '').trim();

// Match por:
- ID exato
- Nome completo contém ID
- ID contém nome
```

---

## 🔄 Fluxo de Dados

```
1. Carregamento Inicial
   ↓
2. Fetch Sentry API (https://ssd-api.jpl.nasa.gov/sentry.api)
   ↓
3. Processamento (processSentryData)
   ↓
4. Cache Local (30 minutos)
   ↓
5. Renderização nos Componentes
   ├── Painel Principal (index.html)
   ├── Sentry Watch (sentry-watch.html)
   └── Cross-reference (asteroids.html)
```

---

## 📈 Estatísticas Calculadas

### No SentryMonitor.getStatistics()

```javascript
{
  totalObjects: int,           // Total de objetos monitorados
  maxTorinoScale: int,         // Maior Torino detectado (0-10)
  maxPalermoScale: float,      // Maior Palermo detectado
  highestProbability: float,   // Maior probabilidade de impacto
  totalPossibleImpacts: int,   // Soma de todos os cenários de impacto
  objectsWithTorino1Plus: int  // Objetos com Torino ≥ 1
}
```

---

## 🎨 UI/UX

### Código de Cores Torino

| Torino | Cor | CSS Variable |
|--------|-----|--------------|
| 0 | Cinza | `#666` |
| 1 | Verde | `var(--accent-success)` |
| 2-3 | Amarelo | `var(--accent-warning)` |
| 4-7 | Laranja | `#ff9933` |
| 8-10 | Vermelho | `var(--accent-danger)` |

### Responsividade

- Grid adaptativo (minmax(350px, 1fr))
- Cards empilhados em mobile
- Controles flex-wrap

---

## 🔧 Métodos Principais

### SentryMonitor Class

```javascript
// Carrega dados da API
async loadSentryData()

// Processa resposta JSON
processSentryData(data)

// Retorna top N riscos
getTopRisks(n = 5)

// Retorna estatísticas
getStatistics()

// Busca por nome
findByName(name)

// Cross-reference com NEO
crossReferenceNEO(neoId)

// Formata Torino Scale
formatTorinoScale(value)

// Formata probabilidade
formatProbability(probability)

// Renderiza painel UI
async renderSentryPanel()
```

---

## 🌐 Exemplos de Uso

### 1. Inicialização no App Principal

```javascript
import { SentryMonitor } from './sentry-integration.js';

const sentryMonitor = new SentryMonitor();
await sentryMonitor.loadSentryData();
await sentryMonitor.renderSentryPanel();
```

### 2. Verificar se Asteroide está no Sentry

```javascript
const sentryInfo = sentryMonitor.crossReferenceNEO('433 Eros');

if (sentryInfo) {
  console.log(`Torino Scale: ${sentryInfo.torinoScale}`);
  console.log(`Probabilidade: ${sentryInfo.impactProbability}`);
}
```

### 3. Obter Top 5 Riscos

```javascript
const topRisks = sentryMonitor.getTopRisks(5);

topRisks.forEach(obj => {
  console.log(`${obj.fullName}: Torino ${obj.torinoScale}`);
});
```

---

## ⚠️ Considerações Importantes

### Cache

- Implementado cache de 30 minutos para reduzir requisições
- Dados armazenados em `this.sentryObjects`
- Timestamp em `this.lastUpdate`

### Performance

- Carregamento assíncrono (não bloqueia UI)
- Processamento em background
- Fallback para dados em cache em caso de erro

### Precisão

- ⚠️ Dados Sentry são estimativas científicas
- Probabilidades são cumulativas (soma de todos os cenários)
- Torino Scale pode mudar com novas observações
- **Não usar para tomada de decisões críticas sem consultar fontes oficiais**

---

## 📚 Referências

- **Sentry System**: https://cneos.jpl.nasa.gov/sentry/
- **API Documentation**: https://ssd-api.jpl.nasa.gov/doc/sentry.html
- **Torino Scale**: https://cneos.jpl.nasa.gov/sentry/torino_scale.html
- **Palermo Scale**: https://cneos.jpl.nasa.gov/sentry/palermo_scale.html
- **JPL Small-Body Database**: https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html

---

## 🔮 Diferenças: NEO API vs Sentry API

| Aspecto | NEO API | Sentry API |
|---------|---------|------------|
| **Horizonte Temporal** | Próximos 7 dias | Próximos 100 anos |
| **Foco** | Aproximações próximas | Risco de impacto |
| **Quantidade** | ~100-200 objetos/semana | ~1500 objetos monitorados |
| **Escala de Risco** | Hazardous (boolean) | Torino (0-10) + Palermo |
| **Probabilidade** | Não fornecida | Probabilidade de impacto |
| **Atualização** | Diária | Contínua (observações astronômicas) |

---

## 🛡️ Benefícios para o AstroShield

1. **Contexto de Longo Prazo**: Usuários veem não apenas asteroides passando hoje, mas riscos futuros
2. **Educação Científica**: Explicação das escalas Torino e Palermo
3. **Dados Reais**: Conexão com sistema real de monitoramento da NASA
4. **Transparência**: Links diretos para dados oficiais do JPL
5. **Completude**: Cobre tanto aproximações imediatas (NEO) quanto riscos futuros (Sentry)

---

**🚀 Desenvolvido para NASA Space Apps Challenge 2025**
**Powered by NASA/JPL Sentry Data API**
