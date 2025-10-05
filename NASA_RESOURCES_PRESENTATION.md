# 🚀 AstroShield + NASA
### Recursos Utilizados

---

## 🛰️ 1. NASA NEO API

**O que é:** Base de dados de asteroides próximos da Terra

**O que pegamos:**
- Nome e ID de cada asteroide
- Distância da Terra (em km e distâncias lunares)
- Tamanho estimado (diâmetro em metros)
- Velocidade relativa
- Classificação de perigo (⚠️ ou ✅)
- Data de aproximação

**Exemplo:**
```
(2025 AB)
📏 153.127 km (0.4 LD - mais perto que a Lua!)
📐 10-22 metros
🚀 41.617 km/h
📅 03/01/2025 14:30
```

---

## 🔬 2. Fórmulas de Impacto (JPL)

**Fonte:** Collins et al. (2005) - NASA/JPL

**O que calculamos:**
- 💥 Energia da explosão (megatons)
- 🕳️ Diâmetro da cratera (km)
- 🌍 Magnitude sísmica (Richter)
- 💨 Raio de devastação (km)
- 🔥 Raio térmico (km)

**Exemplo:** Asteroide de 500m
```
💥 15.330 Megatons
🕳️ Cratera de 94 km
🌍 Terremoto 10.0 Richter
📊 306x Bomba de Hiroshima
```

---

## 🌍 3. Visualização da Terra

**Fonte:** NASA Earth Observatory - Blue Marble

**Uso:**
- Modelo 3D do globo terrestre
- Texturas de satélite reais
- Representação científica precisa

---

## 📏 4. Medidas Astronômicas

**Constantes NASA:**
- **Distância Lunar:** 384.400 km (régua para asteroides)
- **Raio da Terra:** 6.371 km
- **Unidade Astronômica:** 149.597.871 km

**Sistema de Cores:**
- 🔴 < 1 LD (muito próximo)
- 🟠 1-5 LD (próximo)
- 🟡 5-20 LD (moderado)
- 🟢 > 20 LD (distante)

---

## ⚠️ 5. Classificação de Perigo

**Definição NASA - PHA (Potentially Hazardous Asteroid):**
- Distância mínima ≤ 7,5 milhões km
- Diâmetro ≥ 140 metros

**No Projeto:**
- ⚠️ Badge vermelho = Perigoso
- ✅ Badge verde = Seguro
- Filtro específico para PHAs

---

## 🔗 6. Integração JPL

**Link direto para cada asteroide:**
```
https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html
```

**Dados acessíveis:**
- Órbita completa
- Histórico de aproximações
- Características físicas detalhadas

---

## 📚 7. Dados Históricos

**Chicxulub (Dinossauros - 66M anos):**
- 10-15 km de diâmetro
- 10 bilhões de bombas de Hiroshima
- Extinção de 75% das espécies

**Tunguska (1908):**
- ~50 metros
- 10-15 megatons
- 2.000 km² devastados

**Fonte:** NASA Planetary Defense Office

---

## 🛡️ 8. Defesa Planetária

**NASA PDCO (Planetary Defense Coordination Office)**

**Aplicado:**
- Monitoramento em tempo real
- Alertas visuais por proximidade
- Dados atualizados diariamente
- Educação sobre riscos reais

---

## 📊 RESUMO

| Recurso | Onde Aparece | Impacto |
|---------|--------------|---------|
| **API NEO** | Globo 3D + Lista | ⭐⭐⭐⭐⭐ |
| **Fórmulas** | Simulação | ⭐⭐⭐⭐⭐ |
| **Modelo Terra** | Visualização | ⭐⭐⭐⭐ |
| **Medidas** | Escala real | ⭐⭐⭐⭐ |
| **Classificação** | Filtros/Badges | ⭐⭐⭐ |
| **Links JPL** | Botões | ⭐⭐⭐ |

---

## 🎯 IMPACTO DO PROJETO

### Transforma dados da NASA em:
✅ Visualização 3D interativa
✅ Simulações físicas precisas
✅ Educação acessível
✅ Consciência sobre defesa planetária

### Todos os dados:
✅ Atualizados em tempo real
✅ Científicamente validados
✅ Gratuitos e públicos
✅ 100% da NASA

---

## 🏆 CREDENCIAIS

**Fontes Oficiais:**
- NASA Near-Earth Object Program
- JPL (Jet Propulsion Laboratory)
- CNEOS (Center for NEO Studies)
- PDCO (Planetary Defense Office)

**APIs:**
- api.nasa.gov/neo
- ssd.jpl.nasa.gov

**Frequência:** Atualizado diariamente

---

## 💡 DIFERENCIAL

**Não é ficção científica:**
- Asteroides reais que passam HOJE
- Cálculos usados por cientistas NASA
- Dados do sistema de defesa real

**Acessível a todos:**
- Interface simples
- Explicações claras
- Visual e interativo

---

**NASA Space Apps Challenge 2025**
**Projeto AstroShield**

*Dados NASA de domínio público*
