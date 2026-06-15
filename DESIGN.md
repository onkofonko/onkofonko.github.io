---
name: Ondrej Michal Očkaj Portfolio
description: Premium Business Analyst portfolio combining process mapping rigor with high-end editorial design.
colors:
  primary: "#9496f2"
  neutral-bg: "#0a0a0a"
  neutral-surface: "#141414"
  neutral-stroke: "#1f1f1f"
  ink-primary: "#f5f5f5"
  ink-muted: "#bfbfbf"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3.5rem, 8vw, 7.5rem)"
    fontWeight: 300
    lineHeight: 0.95
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "rgba(255,255,255,0.015)"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "rgba(255,255,255,0.03)"
  card:
    backgroundColor: "rgba(255,255,255,0.015)"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Ondrej Michal Očkaj Portfolio

## 1. Overview

**Creative North Star: "Analytical Elegance"**

This design system expresses a unique professional profile: a Junior Business Analyst with a rigorous foundation in process optimization, UML, and BPMN modeling, backed by a strong education and interest in visual design. The visual environment balances technical, structured precision with premium editorial typography and organic textures. 

The interface resides in a deeply dark space layered with a soft organic noise grain and animated WebGL gradients (Aurora and LiquidGlass). Every section is structured clearly like a declassified blueprint or a clean report, utilizing BPMN notation symbols as architectural elements (start/end events, gateways, service tasks). The layout rejects standard landing page tropes, generic SaaS card grids, and flat gray monocultures in favor of highly tactile, responsive materials.

**Key Characteristics:**
- **Technically Grounded**: Structured BPMN symbols serve as kickers, borders, and indicators.
- **Tactile Materials**: LiquidGlass surfaces that scale, tilt, and attract light interactively.
- **Editorial Contrast**: Sophisticated, italic display serif paired with clean, geometric sans-serif body text.

## 2. Colors

The color palette is built on deep, velvet-dark bases to provide a premium background, highlighted by a clean, vibrant lilac accent and high-contrast, readable ink.

### Primary
- **Lilac Accent** (#9496f2 / hsl(244 75% 76%)): Used for interactive highlights, active states, key icons, and BPMN node badge accents. Used sparingly to ensure it retains its visual impact.

### Neutral
- **Deep Gray-Black** (#0a0a0a / hsl(0 0% 4%)): The baseline background color.
- **Container Surface** (#141414 / hsl(0 0% 8%)): Layered surfaces, card backgrounds, and drawer overlays.
- **Divider Stroke** (#1f1f1f / hsl(0 0% 12%)): Grid borders, card strokes, and subtle separators.
- **High-Contrast Ink** (#f5f5f5 / hsl(0 0% 96%)): Primary readability color for headings and text.
- **Muted Ink** (#bfbfbf / hsl(0 0% 75%)): Secondary text, descriptions, and labels.

### Named Rules
**The Accent Rarity Rule.** The vibrant lilac accent must occupy no more than 10% of any given viewport surface. Its rarity draws the eye to crucial interactive highlights, active nav states, and BPMN status tags. Never use the accent for large background blocks.

**The Tinted Neutral Rule.** Muted texts or divider lines on top of dark components must use a slight opacity of the primary text color (rgba) rather than flat grays to ensure they blend natively with the background colors underneath.

## 3. Typography

The system pairs a high-contrast serif and geometric sans-serif to create an editorial layout that feels both professional and design-forward.

**Display Font:** Instrument Serif (serif)
**Body Font:** Plus Jakarta Sans (sans-serif)

**Character:**
Instrument Serif brings a traditional, academic, and elegant feel, especially when italicized. Plus Jakarta Sans balances this with modern, clean, geometric letterforms that work exceptionally well for lists, data tables, flow labels, and numeric statistics.

### Hierarchy
- **Display** (Light 300, clamp(3.5rem, 8vw, 7.5rem), line-height 0.95, italic): Used strictly for the hero name and prominent creative headings.
- **Headline** (Regular 400, 3xl to 5xl, line-height 1.15): Used for main section titles (e.g. "Skills & competencies", "Process library").
- **Title** (Semibold 600, text-base to text-lg, line-height 1.4): Used for card titles and category headers.
- **Body** (Regular 400, text-sm to text-base, line-height 1.625): Primary reading block font. Max line length should be kept between 65–75 characters for optimal readability.
- **Label** (Medium 500, text-xs, letter-spacing 0.15em, uppercase): Used for navigation tabs, buttons, kicker metadata, and table column headers.

### Named Rules
**The Balance & Pretty Rule.** All headings (H1–H3) must utilize `text-wrap: balance` to prevent awkward single-word line wraps. Long body copy and case study descriptions must utilize `text-wrap: pretty` to eliminate orphans.

## 4. Elevation

The design system is flat at rest but uses light refraction, backdrop filters, and cursor-following spotlights to convey elevation and interactivity.

Surfaces use the custom `LiquidGlass` component structure. Rather than using fuzzy drop shadows, depth is achieved by a 1px border stroke, high backdrop-blur values, and subtle interior specular highlights that simulate polished glass.

### Named Rules
**The Spotlight Response Rule.** Cards and interactive containers must remain flat and subtly blended with the background when the cursor is away. Upon hover, they must activate a localized radial gradient spotlight that follows the cursor coordinate, revealing the border stroke and adding depth dynamically.

**The Shadow Exclusion Rule.** It is forbidden to combine a solid 1px card border with a soft, wide drop shadow (blur radius ≥ 16px). This "ghost-card" pattern is replaced by inner glows and clean backdrop blurs.

## 5. Components

### Buttons
- **Shape:** Full pill-shape (`rounded-full`).
- **Primary:** Glass background (`rgba(255, 255, 255, 0.015)`) with a `border-white/[0.04]`. On hover, the background opacity increases to `rgba(255, 255, 255, 0.03)` with a `border-white/[0.08]`.
- **States:** Interactive hover pulls button slightly toward the cursor (magnetic pull) and tilts the button in 3D based on offset. A white light ripple spreads from the click contact point upon pointer down.

### Cards / Containers
- **Corner Style:** Rounded-2xl (`16px` radius).
- **Background:** `bg-white/[0.015]` with a backdrop blur of `backdrop-blur-lg`.
- **Border:** `1px solid border-white/[0.04]` which glows to `border-white/[0.08]` on hover.
- **Internal Padding:** `p-6` on mobile scale, `p-8` on desktop screens.

### Navigation (Navbar Tabs)
- **Style:** Compact pill layout. Active indicator uses a sliding glass highlight capsule (`highlight-pill` with `layoutId`) that stretches organically during transitions.
- **Hover:** Highlight capsule shifts smoothly to hovered tabs.

### BPMN Node Badges
- **Style:** Custom round indicators housing clean SVG vector shapes of standard BPMN elements (StartEvent, EndEvent, Task, ServiceTask, Gateway, MessageFlow). 
- **Application:** Used as kickers/eyebrows to structure section headers and label experience lists.

## 6. Do's and Don'ts

### Do:
- **Do** use `Instrument Serif` italics for primary display headings to highlight BA roles.
- **Do** wrap all page transitions and card hover animations in `@media (prefers-reduced-motion: reduce)` fallbacks that crossfade or trigger instantly.
- **Do** ensure contrast of body copy is ≥ 4.5:1 against the background under all states (active, hovered, flat).
- **Do** use BPMN symbols as purposeful visual motifs instead of generic generic icons.

### Don't:
- **Don't** use creamy, beige, or sandy neutral backgrounds (e.g. `#faf7f2` or `--paper` variables), which dilute the high-end dark-analytical aesthetic.
- **Don't** use tiny uppercase tracked eyebrows on every section; instead, use dynamic BPMN node badges as kicker symbols.
- **Don't** use sketchy, doodled, or hand-drawn SVG illustrations.
- **Don't** use text gradients (`background-clip: text` with multi-color gradients) on headings.
