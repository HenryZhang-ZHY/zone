# Design System

## 1. Visual Theme & Atmosphere

The design system embodies a minimalist, tech-forward aesthetic that balances sophistication with accessibility. It emphasizes clean typography, generous whitespace, and a restrained color palette anchored in deep navy and pure black, punctuated by strategic use of electric blue and coral red for interactive moments. The visual language is understated yet confident, maintaining a warm, approachable tone through serif body typography and subtle, light-tinted card surfaces. The atmosphere conveys innovation, clarity, and forward-thinking design that prioritizes content and functionality over ornamental flourish.

**Key Characteristics**
- Minimalist, content-first approach with emphasis on typography
- Deep navy (`#213547`) and black as primary brand anchors
- Warm cream/off-white surfaces with subtle transparency for depth
- Electric blue (`#0095FF`) for critical interactions and primary CTAs
- Coral red (`#ED3C50`) for secondary emphasis and alerts
- Monospace typography for technical precision paired with serif for readability and CJK support
- Transparent or very light backgrounds for cards and containers
- Restrained use of color—neutral grays dominate, with accent colors reserved for intentional focus

## 2. Color Palette & Roles

### Primary
- **Brand Navy** (`#213547`): Primary text, headings, and structural elements; establishes brand identity and hierarchy
- **Pure Black** (`#000000`): Primary headings, navigation links, and maximum contrast text
- **Electric Blue** (`#0095FF`): Primary call-to-action buttons, interactive states, and key links requiring attention

### Accent Colors
- **Coral Red** (`#ED3C50`): Secondary action buttons, alerts, and emphasis points
- **Warning Yellow** (`#FFC517`): Warning states and cautionary messaging

### Interactive
- **Deep Slate** (`#111827`): Alternative dark text for secondary navigation or hover states
- **Medium Gray** (`#374151`): Secondary text and de-emphasized UI elements
- **Subdued Gray** (`#4B5563`): Tertiary text for hints, placeholders, and supporting copy

### Neutral Scale
- **Light Gray** (`#9CA3AF`): Disabled states, borders on light backgrounds
- **Border Gray** (`#D1D5DB`): Subtle dividers and container borders
- **Pale Gray** (`#E5E7EB`): Background fills, secondary borders, and light dividers
- **Very Light Gray** (`#EBEBEB`): Minimal borders and ultra-subtle separators
- **Warm White** (`#FAF7F5`): Slightly warm background alternative to pure white
- **Pure White** (`#FFFFFF`): Primary background and foreground surfaces
- **Dark Neutral** (`#737373`): Muted text for tertiary information
- **Charcoal** (`#3C3C3C`): Alternative dark text in specific contexts

### Surface & Borders
- **Card Background** (`#FFFFFF` at 45% opacity or `#FAF7F5`): Semi-transparent container surfaces with subtle depth
- **Border Stroke** (`#E5E7EB`): Default border color for containers and dividers
- **Subtle Border** (`#D1D5DB`): Soft borders on interactive elements

## 3. Typography Rules

### Font Family
**Primary (Headings & Body):** IBM Plex Mono (monospace, geometric)
Fallback: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

**Secondary (Body & CJK):** LXGW WenKai (serif, high readability, CJK support)
Fallback: `Georgia, "Times New Roman", serif`

**Combined Stack:** `'IBM Plex Mono', 'LXGW WenKai', ui-monospace, serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| **Display / H1** | Bold | 96px | 700 | 163.2px (1.7×) | 0px | Hero headlines, max emphasis |
| **Heading 2 / H2** | IBM Plex Mono Semibold | 64px | 700 | 108.8px (1.7×) | 0px | Section titles and major headings |
| **Heading 3 / H3** | IBM Plex Mono Semibold | 28px | 600 | 36.4px (1.3×) | 0px | Subsection headings |
| **Body Large** | IBM Plex Mono / LXGW WenKai | 16px | 400 | 32px (2×) | 0px | Primary body text, descriptions |
| **Body Regular** | IBM Plex Mono / LXGW WenKai | 14px | 500 | 20px (1.43×) | 0px | Supporting text, secondary copy |
| **Link** | IBM Plex Mono Semibold | 14px | 600 | 20px (1.43×) | 0px | Navigation links, CTAs |
| **Button** | IBM Plex Mono / LXGW WenKai or IBM Plex Mono Semibold | 14px | 500–600 | 20–24px | 0px | Interactive button text |
| **Caption / Small** | IBM Plex Mono / LXGW WenKai | 12px | 400 | 18px (1.5×) | 0px | Captions, metadata, helper text |

### Principles
- **Generous line spacing:** Aim for 1.4×–2× line height for comfortable reading and visual breathing room
- **Monospace for precision, serif for readability:** IBM Plex Mono provides technical character; LXGW WenKai brings warmth and CJK support
- **Weight contrast:** Bold headings (700–600) create clear visual hierarchy; body text remains light (400–500)
- **Minimal letter spacing:** Rely on size and weight for distinction; avoid excessive spacing unless needed for legal or disclaimer text

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background:** `#0095FF` (Electric Blue)
- **Text Color:** `#FFFFFF` (Pure White)
- **Font:** 14px, weight 600
- **Padding:** `8px 16px`
- **Height:** 36px
- **Border Radius:** `0px` (sharp corners)
- **Border:** None
- **Box Shadow:** None
- **Hover State:** Background `#0077CC` (darkened blue), text remains white
- **Active State:** Background `#005FA3`, text remains white
- **Disabled State:** Background `#D1D5DB` (Border Gray), text `#9CA3AF` (Light Gray)

#### Secondary Button
- **Background:** `rgba(255, 255, 255, 0)` (transparent)
- **Text Color:** `#213547` (Brand Navy)
- **Font:** PT Serif Regular, 16px, weight 400
- **Padding:** `6px 12px`
- **Height:** 36px
- **Border Radius:** `0px`
- **Border:** `1px solid #E5E7EB` (Pale Gray)
- **Box Shadow:** None
- **Hover State:** Background `#F9FAFB`, border `#D1D5DB`
- **Active State:** Background `#F3F4F6`, border `#9CA3AF`
- **Disabled State:** Background `rgba(0, 0, 0, 0)`, text `#9CA3AF`, border `#E5E7EB`

#### Ghost Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#000000` (Pure Black)
- **Font:** 14px, weight 600
- **Padding:** `0px 0px`
- **Height:** Auto
- **Border Radius:** `0px`
- **Border:** None
- **Box Shadow:** None
- **Hover State:** Text `#0095FF` (Electric Blue), underline `1px solid #0095FF`
- **Active State:** Text `#0077CC`, underline `1px solid #0077CC`

#### Icon Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#737373` (Dark Neutral)
- **Font Size:** 16px
- **Padding:** `0px`
- **Height:** 56px
- **Width:** 36px
- **Border Radius:** `0px`
- **Border:** None
- **Box Shadow:** None
- **Hover State:** Text Color `#213547`, opacity 0.8

### Cards & Containers

#### Translucent Card
- **Background:** `rgba(255, 255, 255, 0.45)` or `#FAF7F5` with opacity
- **Text Color:** `#213547` (Brand Navy)
- **Font:** PT Serif Regular, 16px, weight 400
- **Padding:** `28px 32px`
- **Border Radius:** `3px`
- **Border:** `1px solid rgba(0, 0, 0, 0.07)` (very subtle)
- **Box Shadow:** None
- **Line Height:** 27.2px

#### Minimal Card
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#213547`
- **Font:** PT Serif Regular, 16px, weight 400
- **Padding:** `0px`
- **Border Radius:** `0px`
- **Border:** None
- **Box Shadow:** None

#### Container with Border
- **Background:** `#FFFFFF` (Pure White)
- **Border:** `1px solid #E5E7EB` (Pale Gray)
- **Padding:** `20px 24px` (or responsive)
- **Border Radius:** `3px`

### Inputs & Forms

#### Text Input
- **Background:** `#FFFFFF`
- **Border:** `1px solid #D1D5DB` (Border Gray)
- **Border Radius:** `3px`
- **Padding:** `8px 12px`
- **Font:** PT Serif Regular, 14px, weight 400
- **Text Color:** `#213547`
- **Placeholder Color:** `#9CA3AF`
- **Focus State:** Border `2px solid #0095FF`, outline none
- **Error State:** Border `2px solid #ED3C50`, background `#FFF5F7`

#### Checkbox
- **Size:** 18px × 18px
- **Background (unchecked):** `#FFFFFF`
- **Border (unchecked):** `1px solid #D1D5DB`
- **Border Radius:** `3px`
- **Background (checked):** `#0095FF`
- **Border (checked):** None
- **Checkmark Color:** `#FFFFFF`

#### Label
- **Font:** 14px, weight 600
- **Color:** `#213547`
- **Margin Bottom:** `6px`

### Navigation

#### Navigation Bar
- **Background:** `#FFFFFF` with `1px solid #E5E7EB` bottom border
- **Height:** 60px
- **Padding:** `0px 40px`

#### Navigation Link
- **Font:** 14px, weight 600
- **Color:** `#000000` (Pure Black)
- **Text Decoration:** None
- **Hover State:** Color `#0095FF`, text decoration underline
- **Active State:** Color `#0095FF`, border-bottom `2px solid #0095FF`
- **Padding:** `0px 16px`

#### Breadcrumb
- **Font:** PT Serif Regular, 12px, weight 400
- **Color:** `#737373` (Dark Neutral)
- **Separator:** `/` in `#9CA3AF`
- **Active Link:** `#213547`, weight 500

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale:**
- Micro: `4px`, `8px` — Compact spacing between adjacent inline elements
- Small: `12px`, `16px` — Spacing within component internals
- Medium: `20px`, `24px` — Section padding and gaps between moderate-size elements
- Large: `28px`, `32px` — Container padding, generous gaps
- XL: `36px`, `40px` — Major section spacing
- XXL: `48px`, `60px`, `80px` — Hero and full-width section gaps

**Usage Context:**
- Button/Input padding: `8px–12px` horizontal, `6px–8px` vertical
- Card/Container padding: `20px–32px`
- Section margins: `40px–80px` vertical
- Grid gaps: `20px–32px`

### Grid & Container

- **Max Container Width:** 1278px (based on extracted card widths)
- **Columns:** 12-column responsive grid
- **Gutter:** `24px` (12px on each side of column)
- **Section Width:** Full width to max container, centered with equal side margins
- **Breakpoints:** See Section 8 for responsive strategy

### Whitespace Philosophy

Embrace generous whitespace around headings, between sections, and within containers. Use 2× body line-height for breathing room between distinct content blocks. Cards and containers employ internal padding of at least `20px–32px` to prevent visual clutter. Rely on whitespace rather than borders to create visual separation; when borders are used, keep them subtle (`1px solid #E5E7EB`).

### Border Radius Scale

- **Sharp:** `0px` — Primary buttons, navigation, headings (brand aesthetic)
- **Subtle:** `3px` — Cards, inputs, checkboxes, subtle softening
- **No rounded corners on major UI elements** — Reinforces minimalist, technical tone

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| **Base / Surface 0** | No shadow, `background: #FFFFFF` | Page background, base surfaces |
| **Raised / Level 1** | `box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05)` | Cards, subtle depth |
| **Elevated / Level 2** | `box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08)` | Hover states, floating elements |
| **High / Level 3** | `box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.12)` | Modals, dropdowns, overlays |
| **Maximum / Level 4** | `box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.15)` | Top-level modals, full-screen overlays |

**Shadow Philosophy:** The design system relies primarily on subtle, transparent shadows for depth rather than heavy drops. Shadows are rarely used; instead, translucent card backgrounds and border subtlety create visual layers. When shadows are applied, they are soft and diffuse, maintaining the clean aesthetic. Most interactive elements achieve depth through color shift or border changes rather than shadow.

## 7. Do's and Don'ts

### Do
- **Use the full type hierarchy** — Distinguish content layers with size and weight; avoid mixing font families incorrectly
- **Maintain generous padding** — Provide breathing room within cards (28px–32px) and around sections (40px–80px)
- **Apply accent colors sparingly** — Reserve Electric Blue (`#0095FF`) for primary CTAs and Coral Red (`#ED3C50`) for warnings; avoid overuse
- **Embrace whitespace** — Let content breathe; negative space is part of the design
- **Keep corners sharp** — Use `0px` border-radius on major elements for the technical, minimalist aesthetic
- **Use transparent or very light card backgrounds** — `rgba(255, 255, 255, 0.45)` maintains visual interest without overwhelming
- **Pair monospace headings with serif body copy** — Maintains the technical, content-forward tone
- **Test for contrast** — Ensure all text meets WCAG AA standards (4.5:1 for body, 3:1 for large text)

### Don't
- **Don't mix serif and monospace carelessly** — Body must be serif (LXGW WenKai), headings must be monospace (IBM Plex Mono)
- **Don't use drop shadows on every element** — Reserve shadows for intentional depth; rely on color and borders
- **Don't use rounded corners on buttons or cards** — Sharp corners (`0px`) are brand-defining
- **Don't crowd elements** — Maintain minimum `20px` spacing between major components
- **Don't apply both border and shadow together** — Choose one; typically border is preferred for clarity
- **Don't use colors outside the palette** — Stick to defined hex values; custom gradients are not in scope
- **Don't place body text in light gray** — Maintain `#213547` or `#000000` for readability; minimum contrast ratio 4.5:1
- **Don't create hover states without visual change** — Always provide clear feedback: color shift, underline, or background change

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| **Mobile** | 320px–599px | Single column, `16px` padding, `40px` section gaps, font sizes -2px, stacked navigation |
| **Tablet** | 600px–1023px | 2-column grid, `24px` padding, `60px` section gaps, full typography, collapsed nav with menu |
| **Desktop** | 1024px–1439px | 12-column grid, `32px` padding, `80px` section gaps, full layout, horizontal nav |
| **Wide** | 1440px+ | Max width 1278px centered, `40px` side margins, optimized spacing |

### Touch Targets

- **Minimum touch area:** `44px × 44px` for buttons and interactive elements on mobile
- **Desktop click area:** `36px` minimum height acceptable
- **Spacing between touch targets:** `8px` minimum to prevent accidental activation
- **Links in text:** Underline on desktop, larger tap area on mobile (`32px` height min)

### Collapsing Strategy

- **Navigation:** Horizontal on desktop (14px links, `16px` padding) → Hamburger menu on tablet/mobile
- **Cards in grid:** 3 columns (desktop) → 2 columns (tablet) → 1 column (mobile)
- **Padding collapse:** `32px` (desktop) → `24px` (tablet) → `16px` (mobile)
- **Font sizes:** Reduce heading sizes by `4px–8px` on mobile (H1: 96px → 72px–80px)
- **Spacing:** Reduce vertical section gaps from `80px` → `60px` → `40px` across breakpoints
- **Hero section:** Maintain full-width hero; adjust text alignment and sizing for readability

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Electric Blue (`#0095FF`)
- **Primary Text / Brand Color:** Brand Navy (`#213547`)
- **Heading Text:** Pure Black (`#000000`)
- **Body Text:** Brand Navy (`#213547`) or Pure Black (`#000000`)
- **Secondary Action:** Coral Red (`#ED3C50`)
- **Warning / Alert:** Warning Yellow (`#FFC517`)
- **Borders / Dividers:** Pale Gray (`#E5E7EB`)
- **Disabled State:** Light Gray (`#9CA3AF`)
- **Background Surface:** Pure White (`#FFFFFF`) or Warm White (`#FAF7F5`)
- **Card Background:** `rgba(255, 255, 255, 0.45)` or light off-white

### Iteration Guide

1. **Typography first:** enforce weight and size from the hierarchy table strictly
2. **Color discipline:** Primary text is `#213547`; primary interactive is `#0095FF`; secondary is `#ED3C50`; never deviate without reason
3. **Spacing consistency:** Use the spacing scale (`4px` base unit) exclusively; padding for containers is `20px–32px`; section gaps are `40px–80px`
4. **Sharp corners:** Apply `border-radius: 0px` to all buttons, navigation, and major UI; use `3px` only for cards/inputs when subtle softening is needed
5. **Subtle borders over shadows:** Default to `1px solid #E5E7EB` for container definition; shadows are rare and soft (max `0px 4px 8px rgba(0, 0, 0, 0.08)`)
6. **Hover & focus states:** Buttons shift color or underline; inputs gain blue border `2px solid #0095FF`; links change to Electric Blue
7. **Accessibility baseline:** All text meets 4.5:1 contrast (body) or 3:1 (large); touch targets are minimum `44px` on mobile
8. **Card surfaces:** Use transparency `rgba(255, 255, 255, 0.45)` or `#FAF7F5` for visual interest without heaviness; minimal borders only
9. **Responsive collapse:** Grid changes from 3 cols (desktop) → 2 → 1; padding `32px` → `24px` → `16px`; font sizes reduce proportionally on mobile
