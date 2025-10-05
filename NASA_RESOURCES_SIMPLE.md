# 🚀 O que o AstroShield usa da NASA?

## Um guia simples e direto

---

## 🎯 Em Resumo

O **AstroShield** usa dados **reais e atualizados** da NASA para mostrar asteroides que passam perto da Terra e simular o que aconteceria se eles colidissem com nosso planeta.

---

## 🛰️ 1. Dados de Asteroides em Tempo Real

### O que é?
A NASA tem um sistema que monitora **todos os asteroides** que passam perto da Terra. Esses dados são atualizados **todos os dias**.

### O que pegamos da NASA?
- 📛 **Nome de cada asteroide** - Ex: "(2025 AB)"
- 📏 **Distância da Terra** - Quão perto ele vai passar
- 📐 **Tamanho** - De quantos metros ele tem
- 🚀 **Velocidade** - Quão rápido ele está viajando
- ⚠️ **Nível de perigo** - Se a NASA considera ele perigoso ou não
- 📅 **Data de aproximação** - Quando ele vai passar mais perto

### Onde usamos no projeto?
- **Globo 3D:** Cada ponto brilhante orbitando a Terra é um asteroide real
- **Lista de Asteroides:** Todos os dados que você vê vêm diretamente da NASA
- **Atualização:** Sempre que você abre a página, buscamos os asteroides mais recentes

### Exemplo Real:
```
Asteroide: (2025 AB)
Distância: 153.127 km (mais perto que a Lua!)
Tamanho: 10-22 metros
Velocidade: 41.617 km/h
Status: ✅ Seguro (vai passar longe)
Data: 3 de Janeiro de 2025, 14:30
```

---

## 🔬 2. Ciência de Impactos de Asteroides

### O que é?
Cientistas da NASA criaram **fórmulas matemáticas** para calcular o que acontece quando um asteroide atinge a Terra.

### O que calculamos?
- 💥 **Energia da explosão** - Em megatons (como bombas nucleares)
- 🕳️ **Tamanho da cratera** - Quantos quilômetros de buraco
- 🌍 **Terremoto gerado** - Intensidade na escala Richter
- 💨 **Onda de choque** - Até onde a destruição alcança
- 🔥 **Radiação térmica** - Área de queimaduras graves

### De onde vem?
Pesquisadores da NASA e JPL (Jet Propulsion Laboratory) estudaram impactos reais e criaram essas fórmulas em 2005.

### Exemplo no Projeto:
Quando você clica em **"Simular Impacto"** com um asteroide de 500 metros:
```
💥 Energia: 15.330 Megatons
🕳️ Cratera: 94 km de diâmetro
🌍 Terremoto: 10.0 na escala Richter
💨 Destruição: até 53 km do ponto de impacto
🔥 Queimaduras: até 182 km de distância

📊 Comparação: 306x a Bomba de Hiroshima
```

---

## 🌍 3. Modelo 3D da Terra

### O que é?
A NASA tem imagens de satélite da Terra inteira que usamos para criar o globo 3D.

### De onde vem?
- **Projeto Blue Marble** - Fotos tiradas por satélites da NASA
- **NASA Earth Observatory** - Biblioteca de imagens do nosso planeta

### Como usamos?
O globo 3D que você vê girando na tela é baseado nessas imagens reais da NASA.

---

## 📏 4. Medidas do Espaço

### Distância Terra-Lua
```
384.400 km = 1 LD (Distância Lunar)
```
A NASA usa essa medida como **régua** para asteroides próximos. No AstroShield:
- 🔴 Vermelho = Menos de 1 LD (mais perto que a Lua!)
- 🟠 Laranja = 1 a 5 vezes a distância da Lua
- 🟡 Amarelo = 5 a 20 vezes
- 🟢 Verde = Mais de 20 vezes

### Outros Números da NASA:
- **Raio da Terra:** 6.371 km
- **Unidade Astronômica (UA):** 149 milhões de km (distância Terra-Sol)

---

## ⚠️ 5. Classificação de Perigo

### O que é um "Asteroide Potencialmente Perigoso"?

A NASA define como perigoso quando:
1. Passa a **menos de 7,5 milhões de km** da Terra
2. Tem **mais de 140 metros** de diâmetro

### Como identificamos?
- ⚠️ **Badge Vermelho** = NASA classificou como perigoso
- ✅ **Badge Verde** = Seguro

**Importante:** "Potencialmente perigoso" NÃO significa que vai colidir! Só que a NASA fica de olho nele.

---

## 🔗 6. Links para Mais Informações

### NASA JPL (Jet Propulsion Laboratory)

Cada asteroide tem um botão **"NASA JPL"** que leva você para a página oficial da NASA com:
- Órbita completa do asteroide
- Histórico de aproximações
- Dados técnicos detalhados
- Gráficos e visualizações

Exemplo de link:
```
https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3740934
```

---

## 📚 7. Conhecimento Científico

### Eventos Históricos

**Extinção dos Dinossauros (66 milhões de anos atrás):**
- Asteroide: 10-15 km de diâmetro
- Impacto: 10 **bilhões** de bombas de Hiroshima
- Resultado: 75% das espécies extintas
- **Fonte:** NASA Planetary Defense Office

**Tunguska, Sibéria (1908):**
- Asteroide: ~50 metros
- Energia: 10-15 megatons
- Área devastada: 2.000 km²
- **Fonte:** NASA Near-Earth Object Program

### No AstroShield:
A seção "Curiosidade Científica" usa esses dados históricos para educação.

---

## 🛡️ 8. Defesa Planetária

### O que é?

A NASA tem um departamento específico chamado **Planetary Defense Coordination Office (PDCO)** que:
- Monitora todos os asteroides perigosos
- Estuda formas de desviar asteroides
- Alerta governos sobre riscos

### Como aplicamos?
- **Sistema de cores** por proximidade
- **Alertas visuais** para asteroides muito próximos
- **Dados em tempo real** do monitoramento da NASA

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────┐
│  DADOS DA NASA USADOS NO ASTROSHIELD            │
├─────────────────────────────────────────────────┤
│                                                  │
│  🛰️ API de Asteroides                           │
│  └─ Nome, tamanho, distância, velocidade        │
│                                                  │
│  🔬 Fórmulas de Impacto                         │
│  └─ Energia, cratera, terremoto, destruição     │
│                                                  │
│  🌍 Imagens da Terra                            │
│  └─ Modelo 3D, texturas, Blue Marble            │
│                                                  │
│  📏 Constantes Astronômicas                     │
│  └─ Distância Lua, raio Terra, UA               │
│                                                  │
│  ⚠️ Classificação de Risco                      │
│  └─ Potencialmente perigoso ou seguro           │
│                                                  │
│  🔗 Links JPL                                   │
│  └─ Acesso a dados completos da NASA            │
│                                                  │
│  📚 Conhecimento Científico                     │
│  └─ Eventos históricos, educação                │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ❓ Perguntas Frequentes

### **Os dados são atualizados?**
✅ Sim! Toda vez que você abre a página, buscamos os asteroides mais recentes da NASA.

### **A NASA realmente tem uma API pública?**
✅ Sim! A NASA disponibiliza vários dados gratuitamente para projetos como o nosso.

### **As simulações são precisas?**
✅ Sim! Usamos as mesmas fórmulas que cientistas da NASA usam para estudar impactos.

### **Onde posso ver os asteroides reais?**
✅ No globo 3D na página principal, cada ponto colorido é um asteroide real da NASA.

### **Como a NASA sabe tudo isso?**
Através de:
- 🔭 Telescópios terrestres
- 🛰️ Satélites espaciais
- 📡 Radares especializados
- 🤖 Sondas espaciais

---

## 🎓 O que você aprende com o AstroShield?

### Sobre Asteroides:
- ✅ Quantos passam perto da Terra todos os dias
- ✅ Quão rápido eles viajam (10+ km por segundo!)
- ✅ Tamanhos variados (de metros a quilômetros)
- ✅ Distâncias no espaço (comparadas com a Lua)

### Sobre Impactos:
- ✅ Energia liberada (megatons)
- ✅ Tamanho das crateras formadas
- ✅ Alcance da destruição
- ✅ Comparação com eventos conhecidos

### Sobre Ciência:
- ✅ Como a NASA monitora o espaço
- ✅ O que significa "potencialmente perigoso"
- ✅ Eventos históricos reais
- ✅ Esforços de defesa planetária

---

## 🌟 Créditos

### Todos os dados científicos vêm de:

**NASA (National Aeronautics and Space Administration)**
- Near-Earth Object Program
- Jet Propulsion Laboratory (JPL)
- Center for Near-Earth Object Studies (CNEOS)
- Planetary Defense Coordination Office (PDCO)
- Earth Observatory
- Scientific Visualization Studio

**Acesso aos Dados:**
- API: https://api.nasa.gov/
- NEO Database: https://cneos.jpl.nasa.gov/
- Small-Body Database: https://ssd.jpl.nasa.gov/

---

## 💡 Por que isso é importante?

### 1. **Educação Pública**
Torna dados científicos complexos **fáceis de entender** para qualquer pessoa.

### 2. **Consciência**
Mostra que a NASA **está nos protegendo** monitorando asteroides 24/7.

### 3. **Ciência Real**
Não é ficção científica - são **dados e cálculos reais** validados por cientistas.

### 4. **Transparência**
A NASA compartilha esses dados publicamente para que todos possam aprender e criar.

---

## 🚀 Conclusão

O **AstroShield** transforma dados científicos da NASA em uma experiência:
- 🎮 **Interativa** - Você clica, explora, simula
- 📚 **Educativa** - Aprende conceitos astronômicos
- 🎨 **Visual** - Vê asteroides reais em 3D
- 🔬 **Precisa** - Baseada em ciência validada

**Tudo isso usando recursos 100% públicos e gratuitos da NASA!**

---

**Criado para:** NASA Space Apps Challenge 2025
**Projeto:** AstroShield
**Missão:** Tornar a ciência espacial acessível a todos

*Os dados da NASA são de domínio público e disponibilizados gratuitamente para fins educacionais e científicos.*
