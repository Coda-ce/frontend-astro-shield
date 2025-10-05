# 🛰️ Visualização Orbital de Asteroides - AstroShield

## ✅ Nova Funcionalidade Adicionada

O AstroShield agora inclui um **sistema completo de visualização orbital de asteroides** que exibe asteroides reais próximos à Terra em 3D, usando dados da NASA NEO API.

---

## 🌟 Funcionalidades

### 1. **Asteroides Reais da NASA**
- ✅ Carrega até 50 asteroides próximos da NASA NEO API
- ✅ Atualização baseada na data atual
- ✅ Dados científicos precisos (distância, velocidade, tamanho)

### 2. **Visualização 3D Orbital**
- ✅ Asteroides orbitando ao redor da Terra
- ✅ Movimento em tempo real
- ✅ Rotação própria de cada asteroide

### 3. **Diferenciação Visual**
- 🔴 **Vermelhos** = Asteroides potencialmente perigosos
- 🟠 **Laranjas** = Asteroides seguros

### 4. **Órbitas Visuais**
- ✅ Linhas de órbita para cada asteroide
- ✅ Pode ativar/desativar com botão
- ✅ Cor indica periculosidade

### 5. **Painel de Estatísticas**
- ✅ Total de asteroides exibidos
- ✅ Contagem de perigosos vs seguros
- ✅ Botão para alternar visualização de órbitas

### 6. **Modo Offline**
- ✅ Se NASA API não estiver disponível, usa asteroides de exemplo
- ✅ Aplicação funciona 100% sem internet

---

## 🎯 Como Funciona

### Automático
A visualização de asteroides é **inicializada automaticamente** quando a Terra carrega:

```javascript
// Quando Terra carrega com sucesso:
✅ Modelo da Terra carregado
   └─> Inicializa visualizador de asteroides
       └─> Carrega dados da NASA
           └─> Cria asteroides em órbita
               └─> Atualiza painel de estatísticas
```

### Manual (Recarregar Asteroides)
```javascript
// No console do navegador:
const viewer = window.astroShieldViewer;
await viewer.asteroidViewer.loadNASAAsteroids('SUA_API_KEY');
```

---

## 📊 Painel de Estatísticas

Localização: **Canto superior direito**

```
┌────────────────────────────┐
│ 🛰️ Asteroides Próximos    │
├────────────────────────────┤
│ 📊 Total exibido: 25       │
│ ⚠️ Perigosos: 3            │
│ ✅ Seguros: 22             │
├────────────────────────────┤
│ [🌐 Alternar Órbitas]     │
└────────────────────────────┘
```

---

## 🎨 Visualização

### Asteroides
- **Geometria:** Icosaedro irregular (forma rochosa)
- **Textura:** Cinza com crateras procedurais
- **Tamanho:** Proporcional ao diâmetro real
- **Cor:**
  - 🔴 Vermelhos (0xff1744) = Perigosos
  - 🟠 Laranjas (0xff9933) = Seguros

### Órbitas
- **Formato:** Círculos ao redor da Terra
- **Cor:** Mesma do asteroide (vermelho/laranja)
- **Opacidade:** 20% (transparente)
- **Pode ocultar:** Sim (botão no painel)

---

## 🔧 Configurações

Arquivo: `asteroid-orbital-view.js`

```javascript
this.config = {
    maxAsteroids: 50,              // Máximo de asteroides exibidos
    asteroidScaleMultiplier: 8,    // Escala visual do tamanho
    distanceScaleMultiplier: 0.00015, // Escala de distância
    speedMultiplier: 0.002,        // Velocidade orbital
    orbitLineSegments: 128,        // Suavidade das órbitas
    showOrbits: true,              // Mostrar órbitas ao iniciar
    showLabels: false              // Rótulos (futuro)
};
```

### Ajustar Velocidade
```javascript
// Mais rápido:
this.config.speedMultiplier = 0.004;

// Mais lento:
this.config.speedMultiplier = 0.001;
```

### Ajustar Quantidade
```javascript
// Mais asteroides:
this.config.maxAsteroids = 100;

// Menos asteroides:
this.config.maxAsteroids = 25;
```

---

## 🌐 Integração com NASA API

### Usando DEMO_KEY (Padrão)
```javascript
// Limite: 30 requisições/hora
await viewer.asteroidViewer.loadNASAAsteroids('DEMO_KEY');
```

### Usando Sua Chave
```javascript
// Registre em: https://api.nasa.gov/
await viewer.asteroidViewer.loadNASAAsteroids('SUA_API_KEY_AQUI');
```

### Estrutura de Dados Recebidos
```json
{
    "near_earth_objects": {
        "2025-10-04": [
            {
                "name": "(2023 DW)",
                "id": "54325234",
                "is_potentially_hazardous_asteroid": true,
                "estimated_diameter": {
                    "kilometers": {
                        "estimated_diameter_min": 0.035,
                        "estimated_diameter_max": 0.078
                    }
                },
                "close_approach_data": [{
                    "miss_distance": {
                        "kilometers": "450000"
                    },
                    "relative_velocity": {
                        "kilometers_per_hour": "75000"
                    }
                }]
            }
        ]
    }
}
```

---

## 🎮 Controles

### Mouse
- **Arrastar:** Rotacionar visualização
- **Scroll:** Zoom in/out
- **Clique no asteroide:** (futuro) Mostrar informações

### Botões
- **🌐 Alternar Órbitas:** Mostra/oculta linhas orbitais

---

## 💡 Modo Offline (Asteroides de Exemplo)

Se a NASA API não estiver disponível:

```
✅ Apophis (simulado) - Perigoso
✅ Bennu (simulado) - Perigoso
✅ Ryugu (simulado) - Seguro
✅ Didymos (simulado) - Seguro
✅ Itokawa (simulado) - Seguro
```

**Vantagens:**
- Aplicação funciona sem internet
- Demonstração sempre disponível
- Útil para desenvolvimento

---

## 🔍 Debug e Logs

### Console do Navegador (F12)

**Sucesso:**
```
🛰️ Inicializando visualizador de asteroides...
📡 25 asteroides recebidos da NASA
✅ 25 asteroides adicionados à visualização
📊 Estatísticas de asteroides: {total: 25, displayed: 25, hazardous: 3}
```

**Modo Offline:**
```
🛰️ Inicializando visualizador de asteroides...
❌ Erro ao carregar asteroides: [erro]
⚠️ Usando asteroides de exemplo (modo offline)
✅ 5 asteroides adicionados à visualização
```

---

## 📈 Performance

### Otimizações Implementadas
- ✅ Geometria simplificada (icosaedro de baixo poly)
- ✅ Textura procedural (sem arquivos externos)
- ✅ Máximo de 50 asteroides (configurável)
- ✅ Órbitas com poucos segmentos (128)

### FPS Esperado
- **Desktop moderno:** 60 FPS
- **Laptop médio:** 45-60 FPS
- **Mobile:** 30+ FPS

### Se Performance Cair
```javascript
// Reduzir asteroides:
this.config.maxAsteroids = 25;

// Simplificar órbitas:
this.config.orbitLineSegments = 64;

// Desativar órbitas:
viewer.asteroidViewer.toggleOrbits(false);
```

---

## 🚀 Recursos Futuros (Roadmap)

### Planejado para Próxima Versão
- [ ] Click em asteroide mostra informações detalhadas
- [ ] Rótulos com nome do asteroide
- [ ] Filtro por tamanho/distância/velocidade
- [ ] Animação de trajetória de aproximação
- [ ] Modo "câmera segue asteroide"
- [ ] Comparação de tamanho (Terra vs Asteroide)
- [ ] Linha conectando asteroide à Terra no momento de aproximação
- [ ] Som de alerta para asteroides perigosos

---

## 🐛 Troubleshooting

### Problema: Asteroides não aparecem

**Solução 1:** Verifique console
```javascript
// Deve aparecer:
"✅ X asteroides adicionados à visualização"

// Se não aparecer:
- Verifique erros JavaScript
- Recarregue página
```

**Solução 2:** Force modo offline
```javascript
// No console:
viewer.asteroidViewer.createExampleAsteroids();
```

---

### Problema: Órbitas não aparecem

**Solução:**
```javascript
// Ativar manualmente:
viewer.asteroidViewer.toggleOrbits(true);

// Ou clique no botão "🌐 Alternar Órbitas"
```

---

### Problema: Performance baixa

**Solução:**
```javascript
// Reduzir asteroides:
viewer.asteroidViewer.config.maxAsteroids = 15;
viewer.asteroidViewer.loadNASAAsteroids();

// Desativar órbitas:
viewer.asteroidViewer.toggleOrbits(false);
```

---

## �� Arquivos Relacionados

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| `asteroid-orbital-view.js` | Módulo de visualização orbital | 15 KB |
| `app.js` | Integração no viewer principal | +3 KB |
| `index.html` | Interface (sem alterações) | - |

---

## 🎓 Exemplo de Uso Avançado

### Obter Informações de Asteroide Específico
```javascript
const viewer = window.astroShieldViewer;
const asteroidViewer = viewer.asteroidViewer;

// Pegar primeiro asteroide
const firstAsteroid = asteroidViewer.asteroids[0];

// Obter informações
const info = asteroidViewer.getAsteroidInfo(firstAsteroid);
console.log(info);

/*
{
    name: "(2023 DW)",
    id: "54325234",
    isHazardous: true,
    diameter: "0.057 km",
    distance: "450 mil km",
    velocity: "75000 km/h",
    approachDate: "2025-10-04T15:30:00.000Z"
}
*/
```

### Filtrar Apenas Perigosos
```javascript
const hazardous = asteroidViewer.asteroids.filter(
    a => a.userData.isHazardous
);

console.log(`${hazardous.length} asteroides perigosos`);
```

### Obter Estatísticas
```javascript
const stats = asteroidViewer.getStats();
console.log(stats);

/*
{
    total: 25,
    hazardous: 3,
    safe: 22,
    orbitsVisible: true
}
*/
```

---

## ✅ Checklist de Verificação

Após recarregar a página:

- [ ] Vejo a Terra no centro
- [ ] Vejo pequenos objetos orbitando
- [ ] Objetos são vermelhos (perigosos) ou laranjas (seguros)
- [ ] Objetos estão se movendo em órbita
- [ ] Vejo painel "🛰️ Asteroides Próximos" no canto superior direito
- [ ] Console mostra "✅ X asteroides adicionados à visualização"
- [ ] Botão "Alternar Órbitas" funciona

Se **TODOS** os itens ✅ → **FUNCIONANDO PERFEITAMENTE!**

---

**Status:** ✅ **VISUALIZAÇÃO ORBITAL INTEGRADA E FUNCIONAL**

**Teste agora e veja asteroides reais orbitando a Terra!** 🛰️🌍
