# 🔑 Configuração da NASA API

Para usar dados reais de asteroides, você precisa de uma chave de API gratuita da NASA.

## Obtendo sua API Key

### Passo 1: Registre-se na NASA API
1. Acesse: https://api.nasa.gov/
2. Preencha o formulário com:
   - Nome completo
   - Email válido
   - Descrição do uso: "Educational asteroid impact simulation - NASA Space Apps Challenge"

### Passo 2: Receba sua chave
- Você receberá um email com sua API key
- Exemplo: `AbCdEf123456GhIjKl789MnOpQr`

### Passo 3: Configure no projeto

#### Método 1: Variável de Ambiente (Recomendado)
```bash
# Linux/Mac
export NASA_API_KEY="sua_chave_aqui"

# Windows (PowerShell)
$env:NASA_API_KEY="sua_chave_aqui"
```

#### Método 2: Arquivo de Configuração
Crie um arquivo `config.js`:
```javascript
export const NASA_API_KEY = 'sua_chave_aqui';
```

**⚠️ IMPORTANTE:** Adicione `config.js` ao `.gitignore`!

#### Método 3: Direto no código (apenas para testes)
No arquivo `app.js`:
```javascript
import { NASANEOService } from './nasa-neo-integration.js';

// Substitua 'DEMO_KEY' pela sua chave
const neoService = new NASANEOService('sua_chave_aqui');
```

## Usando a Integração

### Exemplo Básico
```javascript
import { NASANEOService, NEOSelector } from './nasa-neo-integration.js';

// Inicializa serviço
const neoService = new NASANEOService('sua_api_key');

// Busca asteroides da próxima semana
const feed = await neoService.getFeed();
console.log(`Total de asteroides: ${feed.element_count}`);

// Busca apenas asteroides perigosos
const hazardous = await neoService.getHazardousAsteroids();
console.log(`Asteroides perigosos: ${hazardous.length}`);
```

### Integrando com a UI
```javascript
// No final do arquivo app.js, adicione:

window.addEventListener('DOMContentLoaded', async () => {
    const viewer = new AstroShieldViewer();
    const uiController = new UIController(viewer);

    // Inicializa NASA NEO Service
    const neoService = new NASANEOService('sua_api_key');
    const neoSelector = new NEOSelector(neoService, uiController);

    // Adiciona seletor de asteroides reais
    await neoSelector.initializeNEOSelector();

    console.log('🚀 AstroShield com NASA NEO API ativo!');
});
```

## Limites da API

### DEMO_KEY (sem registro)
- **Limite:** 30 requisições/hora
- **Limite diário:** 50 requisições/dia
- **Uso recomendado:** Apenas para testes rápidos

### API Key Registrada (gratuita)
- **Limite:** 1000 requisições/hora
- **Limite diário:** Ilimitado
- **Uso recomendado:** Desenvolvimento e produção

## Endpoints Disponíveis

### 1. Feed de Asteroides Próximos
```
GET https://api.nasa.gov/neo/rest/v1/feed
Parâmetros:
  - start_date (YYYY-MM-DD)
  - end_date (YYYY-MM-DD, máx 7 dias)
  - api_key
```

### 2. Detalhes de Asteroide Específico
```
GET https://api.nasa.gov/neo/rest/v1/neo/{asteroid_id}
Parâmetros:
  - api_key
```

### 3. Browse All NEOs
```
GET https://api.nasa.gov/neo/rest/v1/neo/browse
Parâmetros:
  - api_key
  - page (opcional)
  - size (opcional, max 20)
```

## Exemplo de Resposta da API

```json
{
  "element_count": 25,
  "near_earth_objects": {
    "2025-10-05": [
      {
        "id": "2153306",
        "name": "153306 (2001 JL1)",
        "estimated_diameter": {
          "kilometers": {
            "estimated_diameter_min": 0.5034,
            "estimated_diameter_max": 1.1256
          }
        },
        "is_potentially_hazardous_asteroid": true,
        "close_approach_data": [
          {
            "close_approach_date": "2025-10-05",
            "relative_velocity": {
              "kilometers_per_second": "18.3"
            },
            "miss_distance": {
              "kilometers": "7450000",
              "lunar": "19.4"
            }
          }
        ],
        "orbital_data": {
          "eccentricity": "0.267",
          "semi_major_axis": "1.832"
        }
      }
    ]
  }
}
```

## Testando a Integração

### Teste 1: Verificar Conexão
```javascript
const neoService = new NASANEOService('sua_api_key');

try {
    const feed = await neoService.getFeed();
    console.log('✅ Conexão bem-sucedida!');
    console.log(`Asteroides encontrados: ${feed.element_count}`);
} catch (error) {
    console.error('❌ Erro de conexão:', error);
}
```

### Teste 2: Buscar Asteroide Específico
```javascript
// ID do asteroide Apophis (famoso asteroide potencialmente perigoso)
const apophis = await neoService.getAsteroidDetails('2099942');
console.log(apophis);
```

### Teste 3: Simular Impacto com Dados Reais
```javascript
const feed = await neoService.getFeed();
const firstDate = Object.keys(feed.near_earth_objects)[0];
const firstAsteroid = feed.near_earth_objects[firstDate][0];

const asteroidData = neoService.parseAsteroidData(firstAsteroid);
const simParams = neoService.prepareImpactSimulation(asteroidData);

console.log('Parâmetros de simulação:', simParams);
// Agora use simParams para rodar a simulação!
```

## Solução de Problemas

### Erro: "API key not found or invalid"
- Verifique se a chave está correta
- Confirme que copiou a chave completa do email
- Teste com DEMO_KEY primeiro

### Erro: "Rate limit exceeded"
- Você excedeu o limite de 30 req/hora (DEMO_KEY)
- Registre-se para obter chave com 1000 req/hora
- Aguarde 1 hora para resetar o limite

### Erro: CORS blocked
- Adicione proxy ou use backend
- Para testes locais, use extensão "CORS Unblock" no navegador
- Em produção, sempre use backend para chamar a API

### Sem dados retornados
- Verifique as datas (máximo 7 dias de intervalo)
- Alguns dias podem não ter asteroides próximos
- Tente um intervalo maior: 7 dias completos

## Cache de Dados

O `NASANEOService` implementa cache automático:
- **Duração:** 1 hora
- **Propósito:** Reduzir chamadas à API
- **Limpeza manual:**
  ```javascript
  neoService.clearCache();
  ```

## Melhores Práticas

1. **Use cache:** Não faça requisições desnecessárias
2. **Handle errors:** Sempre use try/catch
3. **Limites:** Respeite os rate limits
4. **Segurança:** Nunca exponha sua API key em código público
5. **Fallback:** Tenha dados de exemplo para quando a API estiver indisponível

## Próximos Passos

Após configurar a API:
1. ✅ Teste a conexão
2. ✅ Carregue asteroides reais no seletor
3. ✅ Simule impactos com dados da NASA
4. ✅ Compare com eventos históricos
5. ✅ Compartilhe suas simulações!

---

**Documentação completa da NASA API:** https://api.nasa.gov/
**NeoWs (NEO Web Service):** https://cneos.jpl.nasa.gov/
