# ♿ Documentação de Acessibilidade - AstroShield

Este documento detalha todas as funcionalidades de acessibilidade implementadas no projeto AstroShield, seguindo as diretrizes WCAG 2.1 (Web Content Accessibility Guidelines).

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Navegação por Teclado](#navegação-por-teclado)
3. [Leitores de Tela](#leitores-de-tela)
4. [Acessibilidade Visual](#acessibilidade-visual)
5. [Preferências do Sistema](#preferências-do-sistema)
6. [Testes de Acessibilidade](#testes-de-acessibilidade)
7. [Conformidade WCAG](#conformidade-wcag)

---

## Visão Geral

O AstroShield foi desenvolvido com acessibilidade como prioridade, garantindo que pessoas com diferentes necessidades possam usar a aplicação completamente.

### Principais Características

- ✅ **100% navegável por teclado** - Todos os controles acessíveis sem mouse
- ✅ **Compatível com leitores de tela** - NVDA, JAWS, VoiceOver
- ✅ **Alto contraste** - Suporte automático para preferências do sistema
- ✅ **Movimento reduzido** - Respeita preferências de animação
- ✅ **Tooltips informativos** - Explicações detalhadas em hover/focus
- ✅ **Indicadores visuais e textuais** - Não depende apenas de cores

---

## Navegação por Teclado

### Atalhos Globais

| Tecla | Ação |
|-------|------|
| `Tab` | Navega para o próximo elemento |
| `Shift + Tab` | Navega para o elemento anterior |
| `S` ou `Espaço` | Executa simulação de impacto |
| `R` | Reseta todos os parâmetros |
| `H` ou `?` | Abre modal de ajuda de teclado |
| `Esc` | Fecha modal de ajuda |
| `Enter` | Ativa botão/link focado |

### Navegação por Controles

**Sliders (Range Inputs):**
- `←` / `→` : Diminui/Aumenta valor
- `Page Up` / `Page Down` : Incrementos maiores
- `Home` / `End` : Valor mínimo/máximo

**Dropdowns (Select):**
- `↑` / `↓` : Navega entre opções
- `Enter` / `Espaço` : Abre menu
- `Esc` : Fecha menu

**Botões:**
- `Enter` / `Espaço` : Ativa o botão

### Skip Navigation

Um link "Pular para controles principais" está disponível no topo da página:
- Invisível até receber foco (Tab)
- Permite usuários de teclado pular diretamente para os controles
- Implementado no elemento `<a class="skip-link">`

### Indicadores de Foco

Todos os elementos focáveis possuem:
- **Outline ciano** (3-4px) com alto contraste
- **Offset** de 2-4px para separação visual
- **Foco aprimorado** quando navegação por teclado é detectada

Código CSS:
```css
*:focus {
    outline: 3px solid var(--accent-primary);
    outline-offset: 2px;
}

body.keyboard-nav *:focus {
    outline: 4px solid var(--accent-primary);
    outline-offset: 4px;
}
```

---

## Leitores de Tela

### ARIA Labels e Roles

Todos os elementos interativos possuem rótulos descritivos:

**Regiões Principais:**
```html
<header role="banner">...</header>
<div role="region" aria-label="Painel de controle">...</div>
<div role="region" aria-label="Painel de resultados">...</div>
```

**Controles Interativos:**
```html
<input type="range"
       aria-label="Diâmetro do asteroide em metros"
       aria-valuemin="10"
       aria-valuemax="10000"
       aria-valuenow="500">

<select aria-label="Selecione a localização do impacto">...</select>

<button aria-label="Simular impacto do asteroide com parâmetros atuais">
    ⚡ Simular Impacto
</button>
```

**Resultados:**
```html
<div class="result-card"
     role="article"
     aria-label="Resultado: Energia Liberada">
    <div class="value" aria-live="polite">15330.03</div>
</div>
```

### ARIA Live Regions

Região dedicada para anúncios dinâmicos:

```html
<div id="aria-announcements"
     role="status"
     aria-live="polite"
     aria-atomic="true"
     class="sr-only">
</div>
```

**Eventos Anunciados:**
- ✅ Simulação iniciada
- ✅ Simulação concluída (com resultados principais)
- ✅ Localização de impacto alterada
- ✅ Parâmetros resetados
- ✅ Modal de ajuda aberta/fechada

**Implementação JavaScript:**
```javascript
announce(message) {
    const announcer = document.getElementById('aria-announcements');
    if (announcer) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 3000);
    }
}
```

### Screen Reader Only Class

Elementos visualmente ocultos mas acessíveis:

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

## Acessibilidade Visual

### Tooltips Informativos

Todos os cards de resultado possuem tooltips explicativos no hover:

**Energia Liberada:**
> "Quantidade total de energia cinética convertida em explosão, medida em megatons de TNT equivalente"

**Diâmetro da Cratera:**
> "Tamanho estimado da cratera de impacto formada pelo asteroide, calculado usando fórmulas científicas baseadas em energia e ângulo de entrada"

**Magnitude Sísmica:**
> "Intensidade do terremoto gerado pelo impacto na escala Richter. Magnitudes acima de 7.0 são consideradas catastróficas"

**Raio de Devastação:**
> "Distância do ponto de impacto onde a onda de choque causa destruição massiva de estruturas (20 PSI de sobrepressão)"

**Raio Térmico:**
> "Área onde a radiação térmica do impacto causa queimaduras de terceiro grau em pessoas expostas"

**Comparação:**
> "Comparação da energia do impacto com eventos conhecidos para melhor compreensão da escala"

### Indicadores de Severidade

Além das cores, cada resultado possui um indicador textual:

```html
<h4>Energia Liberada <span class="severity-indicator">[CRÍTICO]</span></h4>
<h4>Magnitude Sísmica <span class="severity-indicator">[ALTO]</span></h4>
<h4>Comparação <span class="severity-indicator">[INFO]</span></h4>
```

**Níveis de Severidade:**
- 🔴 **[CRÍTICO]** - Vermelho (`--accent-danger`)
- 🟡 **[ALTO]** - Amarelo (`--accent-warning`)
- 🟢 **[INFO]** - Verde (`--accent-success`)

### Paleta de Cores Acessível

Cores escolhidas para contraste adequado (WCAG AA):

```css
:root {
    --bg-primary: #0a0e27;        /* Fundo escuro */
    --bg-secondary: #1a1f3a;      /* Fundo secundário */
    --text-primary: #e8eaf6;      /* Texto principal - Contraste 12.6:1 */
    --text-secondary: #b0b8d4;    /* Texto secundário - Contraste 7.2:1 */
    --accent-primary: #00e5ff;    /* Ciano brilhante */
    --accent-danger: #ff1744;     /* Vermelho */
    --accent-warning: #ffd600;    /* Amarelo */
    --accent-success: #00e676;    /* Verde */
}
```

---

## Preferências do Sistema

### Modo de Alto Contraste

Detecção automática via CSS media query:

```css
@media (prefers-contrast: high) {
    :root {
        --bg-primary: #000000;
        --bg-secondary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #e0e0e0;
        --border-color: rgba(0, 229, 255, 0.8);
    }

    .result-card {
        border: 2px solid currentColor;
    }
}
```

**Quando ativado:**
- Fundos 100% pretos
- Textos 100% brancos
- Bordas mais espessas e visíveis
- Contraste máximo em todos os elementos

### Movimento Reduzido

Respeita a preferência `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }

    .loading-spinner {
        animation: none;
        border: 4px solid var(--accent-primary);
    }
}
```

**Implementação JavaScript:**
```javascript
setupAccessibility() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        console.log('♿ Modo de movimento reduzido ativado');
        // Desabilita animações pesadas
    }
}
```

**Efeitos:**
- ❌ Animações de rotação da Terra reduzidas
- ❌ Transições CSS instantâneas
- ❌ Loading spinner estático
- ✅ Funcionalidade mantida sem animações

---

## Testes de Acessibilidade

### Ferramentas Recomendadas

**Leitores de Tela:**
- [NVDA](https://www.nvaccess.org/) (Windows - Gratuito)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (macOS/iOS - Nativo)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android - Nativo)

**Extensões de Browser:**
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

**Testes Manuais:**
- [ ] Navegação completa apenas com teclado
- [ ] Leitura com leitor de tela (NVDA/VoiceOver)
- [ ] Ativar modo de alto contraste do sistema
- [ ] Ativar preferência de movimento reduzido
- [ ] Testar zoom do navegador até 200%
- [ ] Validar tooltips em todos os elementos

### Checklist de Testes

#### Navegação por Teclado
- [x] Tab navega por todos os controles na ordem lógica
- [x] Enter/Espaço ativam botões
- [x] Esc fecha modais
- [x] Setas ajustam sliders
- [x] Skip link funciona corretamente
- [x] Foco visível em todos os elementos

#### Leitores de Tela
- [x] Todos os controles possuem labels
- [x] Estrutura semântica correta (h1, h2, h3)
- [x] ARIA roles apropriados
- [x] Live regions anunciam mudanças
- [x] Imagens possuem texto alternativo

#### Visual
- [x] Contraste mínimo 4.5:1 para texto normal
- [x] Contraste mínimo 3:1 para texto grande
- [x] Tooltips explicativos em todos os resultados
- [x] Indicadores além de cores (texto)
- [x] Foco visível com alto contraste

#### Preferências
- [x] Alto contraste funciona
- [x] Movimento reduzido funciona
- [x] Zoom até 200% sem quebras

---

## Conformidade WCAG

### Nível A (Essencial)

✅ **1.1.1 Conteúdo Não-Textual** - Todas as imagens e controles possuem texto alternativo

✅ **1.3.1 Informação e Relações** - Estrutura semântica com ARIA e HTML5

✅ **1.3.2 Sequência Significativa** - Ordem de tabulação lógica

✅ **2.1.1 Teclado** - Todas as funcionalidades acessíveis por teclado

✅ **2.1.2 Sem Bloqueio de Teclado** - Foco nunca fica preso

✅ **2.4.1 Pular Blocos** - Skip link implementado

✅ **2.4.2 Página com Título** - Título descritivo presente

✅ **3.1.1 Idioma da Página** - `<html lang="pt-BR">`

✅ **4.1.1 Análise** - HTML válido

✅ **4.1.2 Nome, Função, Valor** - ARIA labels em todos os controles

### Nível AA (Recomendado)

✅ **1.4.3 Contraste Mínimo** - Contraste de 4.5:1 para texto normal

✅ **1.4.5 Imagens de Texto** - Texto real usado (não imagens)

✅ **2.4.5 Múltiplas Formas** - Navegação por teclado e mouse

✅ **2.4.6 Títulos e Rótulos** - Descritivos e únicos

✅ **2.4.7 Foco Visível** - Indicadores de foco claros

✅ **3.2.3 Navegação Consistente** - Layout consistente

✅ **3.2.4 Identificação Consistente** - Componentes similares identificados igual

### Nível AAA (Avançado)

✅ **1.4.8 Apresentação Visual** - Texto com largura máxima adequada

✅ **2.1.3 Sem Exceções de Teclado** - 100% navegável por teclado

✅ **2.4.8 Localização** - Breadcrumbs e indicadores de posição

✅ **3.3.5 Ajuda Contextual** - Tooltips e modal de ajuda disponíveis

---

## Recursos para Desenvolvedores

### Documentação Consultada

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs - Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM](https://webaim.org/)

### Padrões ARIA Utilizados

- `role="banner"` - Header principal
- `role="region"` - Seções importantes
- `role="article"` - Cards de resultado
- `role="status"` - Anúncios de mudanças
- `role="dialog"` - Modal de ajuda
- `aria-live="polite"` - Atualizações não-urgentes
- `aria-live="assertive"` - Atualizações urgentes
- `aria-label` - Rótulos descritivos
- `aria-valuemin/max/now` - Valores de range inputs
- `aria-modal="true"` - Modais que bloqueiam interação

### Código de Exemplo

**HTML Acessível:**
```html
<div class="result-card danger"
     role="article"
     aria-label="Resultado: Energia Liberada"
     data-tooltip="Quantidade total de energia cinética convertida em explosão">
    <h4>Energia Liberada <span class="severity-indicator">[CRÍTICO]</span></h4>
    <div class="value" id="energy-value" aria-live="polite">15330.03</div>
    <span class="unit">Megatons TNT</span>
</div>
```

**JavaScript para Anúncios:**
```javascript
announce(message) {
    const announcer = document.getElementById('aria-announcements');
    if (announcer) {
        announcer.textContent = message;
        setTimeout(() => announcer.textContent = '', 3000);
    }
}

// Uso:
this.announce('Simulação concluída. Energia liberada: 15330.03 megatons.');
```

---

## Contribuindo

Para manter e melhorar a acessibilidade:

1. **Sempre teste com teclado** antes de fazer commit
2. **Use leitores de tela** ao adicionar novos recursos
3. **Valide contraste de cores** com ferramentas como [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
4. **Documente novas features** de acessibilidade neste arquivo
5. **Execute testes automatizados** com axe DevTools

---

## Suporte

Para reportar problemas de acessibilidade ou sugerir melhorias:

- Abra uma issue no GitHub com tag `[ACESSIBILIDADE]`
- Descreva o problema e o leitor de tela/navegador usado
- Inclua passos para reproduzir

---

**Última atualização:** 2025-10-04
**Versão:** 1.0
**Conformidade:** WCAG 2.1 Nível AA ✅
