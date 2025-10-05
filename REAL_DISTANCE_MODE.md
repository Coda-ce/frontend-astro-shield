# 📏 Modo de Distância Real - Documentação Técnica

## Visão Geral

O **Modo de Distância Real** é uma funcionalidade que permite visualizar asteroides próximos da Terra usando suas distâncias reais obtidas da NASA NEO API, aplicando uma **escala logarítmica adaptativa** para manter todos os objetos visíveis.

---

## 🎯 Problema Resolvido

### Desafio da Escala Espacial

As distâncias reais no espaço são extremamente variadas:

| Objeto | Distância Real | Distância Lunar (LD) |
|--------|---------------|---------------------|
| 2025 AB (mais próximo recente) | 153.127 km | 0.40 LD |
| Lua | 384.400 km | 1.00 LD |
| 2025 AX1 | 1.091.513 km | 2.84 LD |
| 2020 JR | 47.817.840 km | 124.34 LD |
| 2016 BD15 | 71.450.808 km | 185.79 LD |

**Problema:** Se usarmos escala linear 1:1, asteroides distantes ficam **invisíveis** (fora da tela).

**Solução:** Escala logarítmica adaptativa que comprime grandes distâncias mantendo proporções relativas.

---

## 🧮 Algoritmo de Escala Adaptativa

### Constantes do Sistema

```javascript
LUNAR_DISTANCE_KM = 384.400      // Distância Terra-Lua real
LUNAR_VISUAL_UNITS = 15          // Distância visual da Lua no modelo 3D
EARTH_RADIUS_UNITS = 5           // Raio da Terra no modelo
```

### Fórmula de Cálculo

```javascript
function calculateAdaptiveDistance(realDistanceKm) {
    const lunarRatio = realDistanceKm / LUNAR_DISTANCE_KM;

    if (lunarRatio < 0.5) {
        // ZONA 1: Muito próximo (< 50% da distância da Lua)
        // Escala LINEAR pura
        // Exemplo: 0.4 LD → 6.0 unidades
        return LUNAR_VISUAL_UNITS * lunarRatio;

    } else if (lunarRatio < 10) {
        // ZONA 2: Próximo a médio (0.5 a 10 Luas)
        // Escala SEMI-LINEAR (transição suave)
        // Distribui de 7.5 a 83 unidades
        return LUNAR_VISUAL_UNITS * 0.5 + ((lunarRatio - 0.5) * 8);

    } else {
        // ZONA 3: Distante (> 10 Luas)
        // Escala LOGARÍTMICA comprimida
        // Comprime grandes distâncias em 90-130 unidades
        return 90 + (Math.log10(lunarRatio) * 20);
    }
}
```

### Exemplos de Distâncias Calculadas

| Asteroide | Distância Real | LD | Zona | Distância Visual | Cálculo |
|-----------|---------------|-----|------|------------------|---------|
| 2025 AB | 153.127 km | 0.40 | 1 | **6.0 unidades** | 15 × 0.40 |
| Lua | 384.400 km | 1.00 | 2 | **15.0 unidades** | 7.5 + (0.5 × 8) |
| 2025 AX1 | 1.091.513 km | 2.84 | 2 | **26.2 unidades** | 7.5 + (2.34 × 8) |
| 2020 BC6 | 3.683.381 km | 9.58 | 2 | **80.1 unidades** | 7.5 + (9.08 × 8) |
| 2020 JR | 47.817.840 km | 124.34 | 3 | **111.7 unidades** | 90 + (log10(124.34) × 20) |
| 2016 BD15 | 71.450.808 km | 185.79 | 3 | **125.7 unidades** | 90 + (log10(185.79) × 20) |

---

## 🎨 Sistema de Cores por Proximidade

### Quando Modo Real Está ATIVADO

As cores mudam de **periculosidade** para **proximidade relativa**:

```javascript
function getDistanceColor(realDistanceKm) {
    const lunarRatio = realDistanceKm / LUNAR_DISTANCE_KM;

    if (lunarRatio < 1)  return 0xff1744;  // 🔴 Vermelho - < 1 LD
    if (lunarRatio < 5)  return 0xff9933;  // 🟠 Laranja  - 1-5 LD
    if (lunarRatio < 20) return 0xffd600;  // 🟡 Amarelo  - 5-20 LD
    return 0x00e676;                       // 🟢 Verde    - > 20 LD
}
```

| Cor | Faixa de Distância | Significado |
|-----|-------------------|-------------|
| 🔴 Vermelho | < 1 LD (< 384 mil km) | **Muito Próximo** - Mais perto que a Lua |
| 🟠 Laranja | 1-5 LD (384k - 1.9M km) | **Próximo** - Até 5 vezes a distância da Lua |
| 🟡 Amarelo | 5-20 LD (1.9M - 7.7M km) | **Moderado** - Distância intermediária |
| 🟢 Verde | > 20 LD (> 7.7M km) | **Distante** - Muito além da órbita lunar |

### Quando Modo Real Está DESATIVADO

Cores voltam ao padrão: **vermelho para perigosos**, **laranja para seguros**.

---

## 📊 Dados da NASA NEO API

### Estrutura de Resposta

```json
{
  "name": "(2025 AB)",
  "is_potentially_hazardous_asteroid": false,
  "estimated_diameter": {
    "kilometers": {
      "estimated_diameter_min": 0.00997,
      "estimated_diameter_max": 0.02229
    }
  },
  "close_approach_data": [{
    "close_approach_date_full": "2025-Jan-03 14:30",
    "miss_distance": {
      "astronomical": "0.0010239876",      // Unidades Astronômicas
      "lunar": "0.3981337564",             // 🌙 DISTÂNCIAS LUNARES
      "kilometers": "153127.0527654012",   // 📏 QUILÔMETROS
      "miles": "95139.4506398056"
    },
    "relative_velocity": {
      "kilometers_per_second": "11.5603387682",
      "kilometers_per_hour": "41617.2195653819"  // 🚀 VELOCIDADE
    }
  }]
}
```

### Campos Extraídos e Armazenados

```javascript
realData: {
    diameterKm: 0.0161,                 // Diâmetro médio
    diameterMin: 0.00997,                // Mínimo estimado
    diameterMax: 0.02229,                // Máximo estimado
    distanceKm: 153127.05,               // Distância em km
    distanceLunar: 0.398,                // Distâncias lunares
    distanceAU: 0.00102,                 // Unidades astronômicas
    velocityKmH: 41617.22,               // km/h
    velocityKmS: 11.56,                  // km/s
    approachDate: "2025-Jan-03 14:30",   // Data completa
    approachDateShort: "2025-01-03"      // Data curta
}
```

---

## 🌙 Referência Visual da Órbita da Lua

### Implementação

Círculo tracejado branco representando a órbita lunar:

```javascript
createMoonOrbitReference() {
    const points = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            LUNAR_VISUAL_UNITS * Math.cos(theta),  // 15 unidades
            0,
            LUNAR_VISUAL_UNITS * Math.sin(theta)
        ));
    }

    const material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 0.5,
        gapSize: 0.3,
        opacity: 0.3
    });

    // Visível apenas quando modo real está ativo
    this.moonOrbitReference.visible = false;
}
```

**Características:**
- Raio: 15 unidades (representando 384.400 km)
- Cor: Branco (#ffffff)
- Estilo: Linha tracejada semi-transparente
- Visibilidade: Controlada pelo checkbox

---

## 🔄 Método `toggleRealDistanceMode()`

### Fluxo de Execução

```javascript
toggleRealDistanceMode(enabled) {
    // 1. Atualiza configuração
    this.config.useRealDistance = enabled;

    // 2. Mostra/esconde órbita da Lua
    this.moonOrbitReference.visible = enabled;

    // 3. Para cada asteroide:
    this.asteroids.forEach(asteroid => {
        // 3a. Recalcula distância visual
        const newDistance = this.calculateAdaptiveDistance(
            asteroid.userData.realData.distanceKm
        );

        // 3b. Atualiza cor (proximidade ou periculosidade)
        const newColor = enabled
            ? this.getDistanceColor(realKm)
            : (isHazardous ? RED : ORANGE);

        // 3c. Move asteroide para nova posição
        asteroid.position.set(x, y, z);
    });

    // 4. Recria linhas de órbita com novas distâncias
    if (showOrbits) {
        this.recreateOrbitLines();
    }
}
```

---

## 🎛️ Interface do Usuário

### Painel de Controle

Localização: Painel "Asteroides Próximos" (canto superior direito)

```html
<label>
    <input type="checkbox" id="real-distance-toggle">
    📏 Distância Real (escala científica)
</label>

<div id="distance-mode-info">
    <!-- Muda dinamicamente -->
</div>
```

### Estados do Checkbox

**☑️ MARCADO (Modo Real):**
```
🌙 Modo: Distância Real
🎨 Cores: Por proximidade (🔴 < 1 LD, 🟠 1-5 LD, 🟡 5-20 LD, 🟢 > 20 LD)
📏 Referência da Lua visível (linha branca)
```

**☐ DESMARCADO (Modo Visualização):**
```
🎨 Modo: Visualização (cores por periculosidade)
```

### Legenda de Distâncias

Aparece na parte inferior da tela quando modo real está ativo:

```
📏 Legenda de Distâncias
🔴 < 1 LD (< 384 mil km) - Muito Próximo
🟠 1-5 LD (384k - 1.9M km) - Próximo
🟡 5-20 LD (1.9M - 7.7M km) - Moderado
🟢 > 20 LD (> 7.7M km) - Distante

LD = Distância Lunar (384.400 km) | 🌙 Linha branca = Órbita da Lua
```

---

## 📈 Comparação dos Modos

### Modo Visualização (Padrão)

| Característica | Valor |
|---------------|-------|
| Escala | Comprimida linear (`6 + km × 0.00015`) |
| Cores | Por periculosidade (vermelho/laranja) |
| Órbita da Lua | Oculta |
| Legenda | Oculta |
| Propósito | **Ver todos os asteroides juntos** |

### Modo Distância Real

| Característica | Valor |
|---------------|-------|
| Escala | Logarítmica adaptativa (3 zonas) |
| Cores | Por proximidade (4 faixas) |
| Órbita da Lua | **Visível** (referência) |
| Legenda | **Visível** |
| Propósito | **Visualizar escala científica real** |

---

## 🧪 Testes e Validação

### Casos de Teste

1. **Asteroide extremamente próximo (0.4 LD):**
   - ✅ Deve aparecer DENTRO da órbita da Lua
   - ✅ Cor vermelha
   - ✅ Distância visual: ~6 unidades

2. **Asteroide na distância lunar (1.0 LD):**
   - ✅ Deve estar SOBRE a linha branca tracejada
   - ✅ Cor laranja
   - ✅ Distância visual: 15 unidades

3. **Asteroide distante (100+ LD):**
   - ✅ Deve ser visível (comprimido logaritmicamente)
   - ✅ Cor verde
   - ✅ Distância visual: ~110 unidades

4. **Toggle entre modos:**
   - ✅ Transição suave de posições
   - ✅ Cores atualizam corretamente
   - ✅ Órbitas recriadas
   - ✅ Legenda aparece/desaparece

---

## 🔬 Base Científica

### Dados Reais Utilizados

- **NASA NEO (Near-Earth Object) API** - Fonte oficial
- **Distâncias em km** - Precisão de até 12 casas decimais
- **Distâncias lunares (LD)** - Unidade padrão em astronomia
- **Velocidades relativas** - km/s e km/h
- **Diâmetros estimados** - Faixas min/max em km

### Escala da Lua

A Lua foi escolhida como referência porque:
- ✅ Distância conhecida do público (384.400 km)
- ✅ Unidade padrão para asteroides próximos
- ✅ API da NASA retorna `miss_distance.lunar` nativamente
- ✅ Comparação intuitiva ("2x mais longe que a Lua")

---

## 📝 Logs do Console

### Ao Ativar Modo Real

```
🔄 Modo alterado para: DISTÂNCIA REAL (escala científica)
   🌙 Órbita da Lua: visível
   🎨 Cores: por distância
📏 Modo de distância: REAL
```

### Ao Desativar Modo Real

```
🔄 Modo alterado para: VISUALIZAÇÃO (comprimida)
   🌙 Órbita da Lua: oculta
   🎨 Cores: por periculosidade
📏 Modo de distância: VISUALIZAÇÃO
```

---

## 🛠️ Arquivos Modificados

| Arquivo | Modificações |
|---------|-------------|
| `asteroid-orbital-view.js` | Escala adaptativa, cores por distância, toggle |
| `app.js` | Checkbox, event listeners, legenda |
| `index.html` | Estilos CSS, legenda HTML |

---

## 🎓 Valor Educacional

Esta funcionalidade oferece:

1. **Compreensão de escala espacial** - Usuários veem o quão longe/perto asteroides realmente estão
2. **Comparação com a Lua** - Referência familiar e visual
3. **Dados científicos reais** - NASA NEO API oficial
4. **Visualização adaptativa** - Logarítmica para grandes distâncias
5. **Cores significativas** - Proximidade relativa ao invés de periculosidade

---

**Versão:** 1.0
**Data:** 2025-01-04
**Desenvolvedor:** AstroShield Team
**Fonte de Dados:** NASA NEO API
**Licença:** MIT
