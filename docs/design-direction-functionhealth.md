# Design Direction — Referência Function Health

> Documento de direção de design extraído de [functionhealth.com](https://www.functionhealth.com/how-it-works).
> Objetivo: catalogar o sistema de estilo como referência para implementação em **shadcn/ui + Tailwind CSS v4**.
> Não é cópia — é tradução do DNA visual para linguagem de framework.

---

## 1. Paleta de Cores

### Core Colors (extraídas do CSS)

| Token                  | Hex/Valor                      | Uso                                | Tailwind Config          |
|------------------------|--------------------------------|-------------------------------------|--------------------------|
| `--color-core--orange` | `#B05A36`                      | CTA, acentos, links hover, markers | `primary`                |
| `--color-core--cream`  | `#FEF9EF`                      | Background principal (claro)       | `background`             |
| `--color-core--beige`  | `#F5EEE1`                      | Cards, badges, ícones sociais      | `muted`                  |
| Midnight               | `#2A2B2F`                      | Texto principal, logotipo          | `foreground`             |
| Gray                   | `#515151`                      | Texto secundário                   | `muted-foreground`       |
| Light Gray             | `#D1C9BF`                      | Borders, dividers                  | `border`                 |
| Badge BG               | `#F5F5F0`                      | Badge backgrounds                  | `accent`                 |
| Badge Text             | `#777777`                      | Texto terciário, metadados         | `accent-foreground`      |
| Badge Border           | `#E5E5E0`                      | Bordas sutis                       | `ring`                   |
| Package BG             | `#FEFEF9`                      | Card backgrounds                   | `card`                   |
| Teal Accent            | `#2A9D8F`                      | Status positivo, health indicators | `chart-2` / `success`    |
| Dark Overlay           | `rgba(55, 24, 6, 0.45)`       | Overlays escuros sobre imagens     | Tailwind arbitrary       |
| Orange Highlight       | `rgba(176, 90, 54, 0.3)`      | Search highlights, focus states    | `primary/30`             |

### CSS Variables (shadcn/ui)

```css
:root {
  --background: 39 100% 97%;        /* #FEF9EF - cream */
  --foreground: 228 5% 16%;         /* #2A2B2F - midnight */
  --card: 60 50% 99%;               /* #FEFEF9 */
  --card-foreground: 228 5% 16%;    /* #2A2B2F */
  --popover: 39 100% 97%;           /* #FEF9EF */
  --popover-foreground: 228 5% 16%; /* #2A2B2F */
  --primary: 18 52% 45%;            /* #B05A36 - terracotta */
  --primary-foreground: 39 33% 90%; /* #F5EEE1 */
  --secondary: 39 33% 90%;          /* #F5EEE1 - beige */
  --secondary-foreground: 228 5% 16%;
  --muted: 40 14% 95%;              /* #F5F5F0 */
  --muted-foreground: 0 0% 47%;     /* #777777 */
  --accent: 40 14% 95%;             /* #F5F5F0 */
  --accent-foreground: 228 5% 16%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 30 11% 79%;             /* #D1C9BF */
  --input: 30 11% 79%;
  --ring: 18 52% 45%;               /* #B05A36 */
  --radius: 1rem;                   /* 16px base */

  /* Custom - Function Health extended */
  --success: 170 42% 40%;           /* #2A9D8F - teal */
  --success-foreground: 0 0% 100%;
  --overlay: 18 80% 12% / 0.45;     /* Dark brown overlay */
}
```

---

## 2. Tipografia

### Famílias

| Papel            | Font Family (Original)                         | Alternativa Acessível (Google Fonts)       | shadcn/Tailwind var           |
|------------------|------------------------------------------------|--------------------------------------------|-------------------------------|
| **Sans (body)**  | `FT Base`, `Inter`, system stack               | `Inter` ou `DM Sans`                       | `--font-sans`                 |
| **Serif (accent)** | `PT Serif` (italic para ênfase)             | `PT Serif` ou `Cormorant Garamond`         | `--font-accent` / `font-serif`|
| **Mono (tags)**  | `Fragment Mono`, `SFMono`, Consolas            | `Fragment Mono` ou `JetBrains Mono`        | `--font-mono`                 |

### Escala Tipográfica

| Classe    | Tamanho     | Peso  | Line Height | Letter Spacing | Uso                          |
|-----------|-------------|-------|-------------|----------------|------------------------------|
| `text-xs` | 0.6875rem   | 600   | 1.3         | 0.06em         | Badges, tags (uppercase)     |
| `text-sm` | 0.875rem    | 400   | 1.5         | 0              | Body small, tooltips         |
| `text-base`| 1rem       | 400   | 1.5         | 0              | Body padrão                  |
| `text-lg` | 1.125rem    | 400   | 1.3         | 0              | Subtítulos de cards          |
| `text-xl` | 1.5rem      | 700   | 1.2         | -0.02em        | Títulos de cards             |
| Heading H2| ~2.5rem     | 700   | 1.1         | -0.01em        | Seções principais            |
| Heading H1| ~3.5rem     | 300-400 | 0.95-1.05 | -0.02em        | Hero headline                |

### Padrões de Ênfase

```css
/* Itálico em headings usa a font serif */
.rich-inherit em { font-family: var(--font-accent); }

/* Strong/em em headings customizados recebe a cor accent */
.custom-heading em,
.custom-heading strong {
  color: var(--primary);        /* #B05A36 terracotta */
  font-weight: inherit;
}
```

**Tailwind equivalente:**
```html
<h2 class="text-3xl font-light tracking-tight">
  Most people wait until it's <em class="font-serif text-primary not-italic">too late.</em>
</h2>
```

---

## 3. Espaçamento & Layout

### Spacing Scale

| Token   | Valor  | Uso                                  |
|---------|--------|--------------------------------------|
| `s-1`   | 4px    | Micro gaps                           |
| `s-2`   | 6-8px  | Badge padding, inline gaps           |
| `s-3`   | 12px   | Card inner padding, element spacing  |
| `s-4`   | 16px   | Standard gap                         |
| `s-5`   | 20px   | Card content padding                 |
| `s-6`   | 24px   | Section inner spacing, modal padding |
| `s-8`   | 32px   | Section gaps                         |
| `s-10`  | 40px   | Modal padding, large section spacing |
| `s-16`  | 64px   | Section vertical padding             |

### Container

```css
/* Layout principal */
--site-width: var referenciado internamente;
--main: max-width do container;
--_spacing---side: padding lateral responsivo;

/* Referência prática */
.container {
  max-width: 1200px;      /* estimado do layout */
  padding-inline: 24px;   /* mobile */
  padding-inline: 40px;   /* desktop */
}
```

---

## 4. Border Radius

| Token        | Valor   | Uso                                        | Tailwind              |
|--------------|---------|--------------------------------------------|-----------------------|
| `--radius`   | 16px    | Cards padrão (package-imagery)             | `rounded-2xl`         |
| full         | 100vw   | Botões pill, inputs de busca               | `rounded-full`        |
| large        | 24px    | Modais, cards grandes                      | `rounded-3xl`         |
| medium       | 14px    | Links de resultado, cards interativos      | `rounded-xl`          |
| small        | 8px     | Badges                                     | `rounded-lg`          |
| tiny         | 6px     | Tooltips, thumbnails                       | `rounded-md`          |
| circle       | 50%     | Avatares, ícones circulares                | `rounded-full`        |

**Padrão predominante:** bordas bem arredondadas (pill buttons, cards com 16-24px). Design é suave e orgânico.

---

## 5. Sombras

```css
/* Card shadow (suave, elevation mínima) */
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);

/* Modal shadow (mais pronunciada) */
--shadow-modal: 0 24px 64px rgba(42, 43, 47, 0.18);
```

**Tailwind:**
```js
boxShadow: {
  'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
  'modal': '0 24px 64px rgba(42, 43, 47, 0.18)',
}
```

---

## 6. Animações & Transições

### Easing Curves

```css
--ease: /* standard ease (provavelmente ease-in-out) */
--smooth: cubic-bezier(0.76, 0, 0.24, 1);  /* easeInOutQuart — suave e premium */
```

### Padrões de Transição

| Tipo               | Duração   | Easing                              | Uso                         |
|--------------------|-----------|-------------------------------------|-----------------------------|
| Hover simples      | 0.1s      | `--smooth`                          | Botões, links, ícones       |
| Hover médio        | 0.2s      | ease                                | Background, box-shadow      |
| Reveal             | 0.4s      | `--smooth`                          | Underlines, elementos       |
| Panel slide        | 0.8s      | `cubic-bezier(0.76, 0, 0.24, 1)`   | Painéis laterais, modais    |
| Modal appear       | 150-180ms | ease                                | Opacity + translateY        |
| Flex expand        | 0.8s      | `cubic-bezier(0.76, 0, 0.24, 1)`   | Cards accordion/expand      |

### Técnicas Usadas

- **Clip-path reveals** para painéis: `clip-path: inset(0 0 0 100%)` → `inset(0 0 0 0%)`
- **Underline animation** com `scaleX` e `transform-origin` swap
- **Mask-image gradients** para fade-out em marquees
- **Backdrop-filter blur** para navbar glass effect

**Motion (framer-motion) equivalente:**
```tsx
// Panel slide
<motion.div
  initial={{ clipPath: "inset(0 0 0 100%)", x: 100 }}
  animate={{ clipPath: "inset(0 0 0 0%)", x: 0 }}
  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
/>

// Modal appear
<motion.div
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.18 }}
/>
```

---

## 7. Componentes — Padrões de Referência

### 7.1 Navegação (Glass Nav)

```
Comportamento: glassmorphism com backdrop-filter blur
Background: transparente → cream quando aberto
Scroll: retrai/compacta com transição suave
Burger menu: linhas com rotação 45deg (X)
```

**shadcn equivalente:** `NavigationMenu` customizado com:
```css
.nav_wrap {
  backdrop-filter: blur(16px) saturate(140%);
  background: transparent;
  transition: background-color 0.3s;
}
.nav_wrap.scrolled {
  background: var(--background);
}
```

### 7.2 Botões

```
Estilo principal: pill (rounded-full), bg terracotta, text cream
Hover: transição suave de background + border-color
Variante: outline com border + text color
```

**shadcn `Button` variants:**
```tsx
// Primary (CTA)
<Button className="rounded-full bg-primary text-primary-foreground px-6 py-3
  transition-all duration-100 ease-[cubic-bezier(0.76,0,0.24,1)]
  hover:bg-primary/90">
  Start testing
</Button>

// Secondary / Ghost
<Button variant="ghost" className="rounded-full">
  Log in
</Button>
```

### 7.3 Cards (Package Imagery)

```
Background: #FEFEF9 (quase branco quente)
Border-radius: 16px
Shadow: 0 4px 24px rgba(0,0,0,0.06)
Título: 1.5rem/700, letter-spacing -0.02em
Badge: uppercase, 0.6875rem, 600, letter-spacing 0.06em
Stripe gráfico na base com gradiente teal
Ícone circular com bg semi-transparente
```

**shadcn `Card` customizado:**
```tsx
<Card className="rounded-2xl shadow-card overflow-hidden max-w-xs bg-card">
  <CardContent className="p-5 space-y-1">
    <h3 className="text-xl font-bold tracking-tight">Title</h3>
    <p className="text-lg text-muted-foreground">Subtitle</p>
    <Badge variant="outline" className="rounded-lg text-[0.6875rem] font-semibold
      tracking-widest uppercase">
      Label
    </Badge>
  </CardContent>
  <div className="h-[120px] bg-gradient-to-r from-teal-700 via-teal-500 to-teal-400" />
</Card>
```

### 7.4 Step Indicators

```
Padrão: STEP 01 • label
Visual: tag/badge + número + separador bullet
Fonte: monospace/sans uppercase
Cor: texto secundário, com dot separator
```

```tsx
<div className="flex items-center gap-2 text-xs font-semibold tracking-widest
  uppercase text-muted-foreground font-mono">
  <span>Step 01</span>
  <span className="text-primary">•</span>
  <span>schedule tests</span>
</div>
```

### 7.5 FAQ / Accordion

```
Toggle: ícone circular que muda bg para terracotta no hover
Cor do toggle no hover: bg orange, text beige
Transição: 0.1s com --smooth easing
```

**shadcn `Collapsible` ou `Accordion`:**
```tsx
<AccordionTrigger className="group">
  <span className="rounded-full p-2 border transition-colors duration-100
    group-hover:bg-primary group-hover:text-primary-foreground">
    <ChevronDown />
  </span>
</AccordionTrigger>
```

### 7.6 Footer Links

```
Hover underline: scaleX animation com transform-origin swap
Links organizados em 3 colunas: Company, Explore, Community
Ícones sociais: rect fill muda no hover
Newsletter: input com rounded-full, CTA join
```

### 7.7 Search Modal

```
Background: #FEF9EF (cream)
Border-radius: 24px
Padding: 40px
Shadow: 0 24px 64px rgba(42,43,47,0.18)
Input: pill shape (rounded-full), 48px height
Tabs: underline indicator com ::after bar
Results: thumbnail + tag (mono uppercase) + title + description
Appear: translateY(-16px) → 0, opacity 0 → 1, 180ms
```

---

## 8. Identidade Visual — DNA do Design

### Princípios Extraídos

1. **Warmth over Clinical** — Paleta de terras e cremes em vez de azul/branco hospitalar
2. **Organic Shapes** — Border-radius generosos (pill, 16-24px), sem cantos vivos
3. **Typographic Contrast** — Sans-serif limpa para corpo + serif itálico para ênfase emocional
4. **Subtle Motion** — Transições suaves (0.8s cubic-bezier), clip-path reveals, sem animações bruscas
5. **Editorial Premium** — Layout com bastante whitespace, shadows mínimas, cards clean
6. **Glass & Blur** — Nav transparente com backdrop-filter, overlays semi-transparentes
7. **Mono for Data** — Tags e dados técnicos em monospace uppercase com tracking largo

### Mood

```
Warm ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → Cool
  ████████████░░░░░░░░░░░░░░░░

Clinical ← ─ ─ ─ ─ ─ ─ ─ ─ → Friendly
  ░░░░░░░░░░████████████░░░░░░

Minimal ← ─ ─ ─ ─ ─ ─ ─ ─ → Rich
  ░░░░░████████████░░░░░░░░░░░

Static ← ─ ─ ─ ─ ─ ─ ─ ─ ─ → Animated
  ░░░░░░░░░░░░████████░░░░░░░░
```

---

## 9. Implementação Rápida — shadcn/ui + Tailwind v4

### tailwind.config (extensões relevantes)

```ts
// Sugestão de extensão para Tailwind
theme: {
  extend: {
    colors: {
      'terracotta': {
        DEFAULT: '#B05A36',
        50: '#FEF9EF',
        100: '#F5EEE1',
        200: '#E5D5C4',
        300: '#D1C9BF',
        400: '#C08A5C',
        500: '#B05A36',
        600: '#8E4829',
        700: '#6C361F',
        800: '#4A2405',
        900: '#2A2B2F',
      },
      'teal': {
        DEFAULT: '#2A9D8F',
        dark: '#1D6B62',
        light: '#48C9B8',
      },
    },
    fontFamily: {
      sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      serif: ['PT Serif', 'Cormorant Garamond', 'serif'],
      mono: ['Fragment Mono', 'JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      'card': '16px',
      'modal': '24px',
    },
    boxShadow: {
      'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
      'modal': '0 24px 64px rgba(42, 43, 47, 0.18)',
    },
    transitionTimingFunction: {
      'smooth': 'cubic-bezier(0.76, 0, 0.24, 1)',
    },
  },
}
```

### CSS Variables (globals.css para shadcn)

```css
@layer base {
  :root {
    --background: 39 100% 97%;
    --foreground: 228 5% 16%;
    --card: 60 50% 99%;
    --card-foreground: 228 5% 16%;
    --popover: 39 100% 97%;
    --popover-foreground: 228 5% 16%;
    --primary: 18 52% 45%;
    --primary-foreground: 39 33% 90%;
    --secondary: 39 33% 90%;
    --secondary-foreground: 228 5% 16%;
    --muted: 40 14% 95%;
    --muted-foreground: 0 0% 47%;
    --accent: 40 14% 95%;
    --accent-foreground: 228 5% 16%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 30 11% 79%;
    --input: 30 11% 79%;
    --ring: 18 52% 45%;
    --radius: 1rem;
  }
}
```

---

## 10. Referência Visual

- **Screenshot:** `.firecrawl/functionhealth-screenshot.png`
- **HTML raw:** `.firecrawl/functionhealth-raw.html`
- **Conteúdo markdown:** `.firecrawl/functionhealth-how-it-works.json`
- **URL fonte:** https://www.functionhealth.com/how-it-works

---

*Documento gerado em 2026-03-06. Referência de design, não implementação.*
*Fonte: Function Health — análise de CSS, screenshot e conteúdo.*
