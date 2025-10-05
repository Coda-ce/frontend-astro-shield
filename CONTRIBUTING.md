# 🤝 Guia de Contribuição - AstroShield

Obrigado por considerar contribuir para o AstroShield! Este documento fornece diretrizes para desenvolvedores que desejam melhorar a plataforma.

## 📋 Sumário

1. [Como Contribuir](#como-contribuir)
2. [Áreas Prioritárias](#áreas-prioritárias)
3. [Roadmap Técnico](#roadmap-técnico)
4. [Padrões de Código](#padrões-de-código)
5. [Testing](#testing)
6. [Processo de Pull Request](#processo-de-pull-request)

---

## Como Contribuir

### Reportar Bugs
- Use o GitHub Issues
- Descreva passos para reproduzir
- Inclua screenshots se aplicável
- Especifique navegador e versão

### Sugerir Funcionalidades
- Verifique se já não foi sugerido
- Explique o caso de uso
- Descreva benefícios educacionais/científicos
- Proponha implementação técnica

### Contribuir com Código
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona feature X'`
4. Push para branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## Áreas Prioritárias

### 🔴 Alta Prioridade

#### 1. Integração USGS
**Descrição:** Implementar overlay de dados geoespaciais reais.

**Tarefas:**
- [ ] Integrar API do USGS National Map
- [ ] Adicionar camada de densidade populacional
- [ ] Implementar visualização de topografia 3D
- [ ] Calcular população afetada por zona de impacto

**Tecnologias:** PostGIS, GeoJSON, USGS APIs

**Dificuldade:** Alta

---

#### 2. Simulação de Tsunamis
**Descrição:** Calcular ondas de tsunami para impactos oceânicos.

**Tarefas:**
- [ ] Detectar impactos em oceano vs. terra
- [ ] Implementar modelo Ward & Asphaug (2000)
- [ ] Visualizar propagação de ondas no globo
- [ ] Estimar altura de tsunami em costas

**Tecnologias:** WebGL shaders, física de fluidos

**Dificuldade:** Muito Alta

**Referências:**
- Ward, S.N., Asphaug, E. (2000) - "Asteroid Impact Tsunami"

---

#### 3. Backend Django
**Descrição:** Criar API REST para salvar simulações e usuários.

**Tarefas:**
- [ ] Setup Django 5.x + PostgreSQL
- [ ] Models: User, Simulation, Asteroid
- [ ] API endpoints (CRUD simulações)
- [ ] Autenticação JWT
- [ ] Deploy em AWS/Heroku

**Tecnologias:** Django, DRF, PostgreSQL, Docker

**Dificuldade:** Média

---

### 🟡 Média Prioridade

#### 4. Estratégias de Mitigação Interativas
**Descrição:** Simular missões de deflexão como DART.

**Tarefas:**
- [ ] Implementar cálculo de Δv (mudança de velocidade)
- [ ] Visualizar trajetória antes/depois da deflexão
- [ ] 3 estratégias: Impacto Cinético, Trator Gravitacional, Nuclear
- [ ] Calcular probabilidade de sucesso baseada em tempo de antecedência

**Tecnologias:** Mecânica orbital, Three.js animações

**Dificuldade:** Alta

**Referências:**
- Missão DART da NASA (2022)
- JPL Small-Body Database

---

#### 5. Modo Gamificado
**Descrição:** Sistema de missões e pontuação.

**Tarefas:**
- [ ] 10 missões progressivas
- [ ] Sistema de pontos e badges
- [ ] Leaderboard global (requer backend)
- [ ] Animações de conquistas

**Tecnologias:** LocalStorage (MVP), Backend API (produção)

**Dificuldade:** Média

---

#### 6. Exportação de Relatórios
**Descrição:** Gerar PDFs e compartilhar simulações.

**Tarefas:**
- [ ] Gerar PDF com parâmetros e resultados
- [ ] Screenshot do globo 3D
- [ ] Botão de compartilhamento em redes sociais
- [ ] URL única para cada simulação

**Tecnologias:** jsPDF, html2canvas, URL shortener

**Dificuldade:** Baixa

---

### 🟢 Baixa Prioridade (Futuro)

#### 7. Realidade Aumentada (AR)
**Descrição:** Projetar impactos no mundo real via smartphone.

**Tecnologias:** WebXR, AR.js, Model Viewer

**Dificuldade:** Muito Alta

---

#### 8. IA Preditiva
**Descrição:** Machine learning para prever trajetórias.

**Tecnologias:** TensorFlow.js, Python (treinamento)

**Dificuldade:** Muito Alta

---

#### 9. API Pública
**Descrição:** Permitir desenvolvedores usar AstroShield.

**Exemplo:**
```javascript
fetch('https://api.astroshield.space/simulate', {
    method: 'POST',
    body: JSON.stringify({
        diameter_m: 500,
        velocity_km_s: 28,
        angle_deg: 45,
        location: { lat: 40.7, lon: -74.0 }
    })
})
```

**Dificuldade:** Média (requer backend)

---

## Roadmap Técnico

### Fase 1: MVP (✅ Concluído)
- [x] Visualização 3D com Three.js
- [x] Cálculos físicos básicos
- [x] Interface de parâmetros
- [x] Seleção de local de impacto
- [x] Painel de resultados

### Fase 2: Beta (Em Desenvolvimento)
- [ ] Integração NASA NEO API
- [ ] Dados USGS básicos
- [ ] Backend Django
- [ ] Sistema de usuários
- [ ] Histórico de simulações

### Fase 3: Produção
- [ ] Gamificação completa
- [ ] Estratégias de mitigação
- [ ] Modo multi-idioma
- [ ] Exportação de relatórios
- [ ] Dashboard de riscos globais

### Fase 4: Avançado
- [ ] AR/VR
- [ ] IA preditiva
- [ ] API pública
- [ ] Parcerias institucionais

---

## Padrões de Código

### JavaScript/ES6+

**Estilo:**
```javascript
// ✅ BOM
class AsteroidSimulator {
    constructor(params) {
        this.params = params;
    }

    calculateImpact() {
        const { diameter, velocity } = this.params;
        return this.kineticEnergy(diameter, velocity);
    }
}

// ❌ EVITAR
function calculate_impact(d, v) {
    var energy = 0.5 * d * v * v;
    return energy;
}
```

**Convenções:**
- Use `const` e `let`, nunca `var`
- CamelCase para classes: `ImpactCalculator`
- camelCase para funções: `calculateEnergy()`
- UPPER_CASE para constantes: `EARTH_RADIUS_KM`
- Arrow functions quando apropriado
- Template literals em vez de concatenação

---

### HTML/CSS

**Estrutura:**
```html
<!-- Use classes semânticas -->
<div class="scenario-card danger">
    <h3 class="scenario-title">Título</h3>
    <p class="scenario-description">Descrição</p>
</div>
```

**CSS:**
```css
/* Use CSS variables */
:root {
    --accent-primary: #00e5ff;
    --spacing-md: 20px;
}

.scenario-card {
    padding: var(--spacing-md);
    color: var(--accent-primary);
}
```

---

### Comentários

**Bom:**
```javascript
/**
 * Calcula energia cinética de impacto
 * @param {number} mass - Massa em kg
 * @param {number} velocity - Velocidade em m/s
 * @returns {number} Energia em Joules
 */
function calculateKineticEnergy(mass, velocity) {
    return 0.5 * mass * Math.pow(velocity, 2);
}
```

**Evitar:**
```javascript
// calcula energia
function calc(m, v) {
    return 0.5 * m * v * v; // formula
}
```

---

## Testing

### Testes Científicos

**Validação de Cálculos:**
```javascript
// test/impact-calculator.test.js
describe('ImpactCalculator', () => {
    it('should calculate Meteor Crater impact correctly', () => {
        const energy = ImpactCalculator.calculateKineticEnergy(
            3e8, // mass kg (50m ferro-níquel)
            12800 // velocity m/s
        );

        const energyMT = ImpactCalculator.energyToMegatons(energy);

        expect(energyMT).toBeCloseTo(10, 1); // ~10 MT
    });

    it('should match Tunguska event', () => {
        const crater = ImpactCalculator.calculateCraterDiameter(
            12, // 12 MT
            30, // 30° angle
            2500 // rocky target
        );

        // Tunguska não formou cratera (airburst)
        // Mas se tivesse: ~1.5 km
        expect(crater).toBeGreaterThan(1);
        expect(crater).toBeLessThan(2);
    });
});
```

**Executar testes:**
```bash
npm install --save-dev jest
npm test
```

---

### Testes de UI

**Manual (MVP):**
1. Verificar todos sliders funcionam
2. Testar clique no globo
3. Confirmar cálculos exibidos
4. Testar responsividade mobile

**Automatizado (futuro):**
```javascript
// Cypress, Playwright, ou Puppeteer
describe('Impact Simulation', () => {
    it('should simulate Apophis impact', () => {
        cy.visit('/examples.html');
        cy.contains('Apophis').click();
        cy.get('#simulate-btn').click();
        cy.get('#energy-value').should('contain', '1200');
    });
});
```

---

## Processo de Pull Request

### Checklist antes de submeter

- [ ] Código segue padrões acima
- [ ] Funcionalidade testada manualmente
- [ ] Sem console.errors no browser
- [ ] Comentários explicativos adicionados
- [ ] README atualizado (se necessário)
- [ ] Screenshots incluídos (para mudanças visuais)

### Template de PR

```markdown
## Descrição
Breve descrição da mudança.

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Screenshots (se aplicável)
[Adicione imagens]

## Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Sem warnings no console
```

---

## Referências Científicas

Ao implementar cálculos físicos, sempre cite fontes:

**Cratera:**
- Collins, G.S., et al. (2005) - "Earth Impact Effects Program"

**Tsunami:**
- Ward, S.N., Asphaug, E. (2000) - "Asteroid Impact Tsunami"

**Energia:**
- Toon, O.B., et al. (1997) - "Environmental Perturbations Caused by Impacts"

**Deflexão:**
- Dearborn, D., Miller, P. (2014) - "Defending Planet Earth"

---

## Comunidade

**Canais:**
- GitHub Issues: Bugs e features
- Discussions: Ideias e perguntas
- Discord (futuro): Chat em tempo real

**Conduta:**
- Seja respeitoso
- Foque em ciência
- Ajude novos contribuidores
- Comemore sucessos juntos

---

## Agradecimentos

Toda contribuição, por menor que seja, é valiosa:
- Correção de typos
- Melhorias de UX
- Novos cenários
- Tradução
- Documentação
- Código

**Obrigado por defender a Terra! 🛡️🌍**

---

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a MIT License.
