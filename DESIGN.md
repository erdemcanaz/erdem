# Design System — Erdem's Personal Website

## Design Philosophy

Minimal, calm, and elegant. The design should never compete with the content. Inspired by Linear's blog (for post pages) and Unit8's homepage (for the landing page). Light, airy, and confident.

**Principles:**
- Content-first: typography and whitespace do the heavy lifting
- No visual noise: every element earns its place
- Subtle motion: animations guide attention, never distract
- Monochrome foundation: color is used sparingly and intentionally

---

## Color Palette

```
Background:
  page-bg:        #F5F5F5    (light warm gray — main background)
  card-bg:        #FFFFFF    (white — content cards, post bodies)
  card-bg-hover:  #FAFAFA    (subtle hover state)

Text:
  text-primary:   #1A1A1A    (near-black — headings, body text)
  text-secondary: #6B7280    (gray-500 — metadata, dates, captions)
  text-tertiary:  #9CA3AF    (gray-400 — disabled, placeholders)

Accents:
  accent:         #3B82F6    (blue-500 — links, active states, timeline dots)
  accent-hover:   #2563EB    (blue-600 — hover on accent)
  accent-light:   #EFF6FF    (blue-50 — subtle accent backgrounds)

Borders:
  border-light:   #E5E7EB    (gray-200 — card borders, dividers)
  border-medium:  #D1D5DB    (gray-300 — input borders)

Agent Commentary Colors (subtle left-border accents):
  economic:       #F59E0B    (amber)
  social:         #8B5CF6    (violet)
  technical:      #06B6D4    (cyan)
  scientific:     #10B981    (emerald)
  summary:        #3B82F6    (blue — matches main accent)

Status:
  deleted-bg:     #FEF2F2    (red-50 — soft-deleted version background)
  deleted-text:   #DC2626    (red-600 — "removed" notice text)
```

---

## Typography

```
Font Family:
  headings:   'Inter', system-ui, -apple-system, sans-serif
  body:       'Inter', system-ui, -apple-system, sans-serif
  mono:       'JetBrains Mono', 'Fira Code', monospace  (code blocks)

Font Sizes (desktop):
  hero-title:     48px / 3rem     (font-weight: 700, line-height: 1.1)
  page-title:     36px / 2.25rem  (font-weight: 700, line-height: 1.2)
  post-title:     32px / 2rem     (font-weight: 700, line-height: 1.3)
  section-title:  24px / 1.5rem   (font-weight: 600, line-height: 1.3)
  card-title:     20px / 1.25rem  (font-weight: 600, line-height: 1.4)
  body:           16px / 1rem     (font-weight: 400, line-height: 1.75)
  small:          14px / 0.875rem (font-weight: 400, line-height: 1.5)
  caption:        12px / 0.75rem  (font-weight: 500, line-height: 1.5)

Font Sizes (mobile):
  hero-title:     32px / 2rem
  page-title:     28px / 1.75rem
  post-title:     24px / 1.5rem
  body:           16px / 1rem     (unchanged)
```

---

## Spacing System

```
Based on 4px grid:

  xs:    4px   (0.25rem)
  sm:    8px   (0.5rem)
  md:    16px  (1rem)
  lg:    24px  (1.5rem)
  xl:    32px  (2rem)
  2xl:   48px  (3rem)
  3xl:   64px  (4rem)
  4xl:   96px  (6rem)

Page max-width:  1200px (centered)
Content width:   720px  (post body — optimized for reading)
Card padding:    24px (desktop), 16px (mobile)
Section gap:     64px (between major sections)
```

---

## Component Styles

### Navbar
```
Position: sticky top
Background: #F5F5F5 with subtle backdrop-blur
Height: 64px
Logo: "Erdem" — text-primary, font-weight 700, 20px
Nav items: text-secondary, 14px, font-weight 500, uppercase tracking-wider
  Hover: text-primary
  Active: text-primary with subtle underline
Spacing: items evenly spaced, right-aligned
Mobile: hamburger menu, slide-in from right
```

### Homepage Hero (Unit8-style)
```
Layout: centered, full-width section
Padding: 96px top, 64px bottom
Title: hero-title size, text-primary, centered
  Example: "Ideas evolve. So do I."
Subtitle: body size, text-secondary, centered, max-width 600px
  Example: "Exploring the boundaries of thought and discovery."
Below: 3-column grid of category cards (24px gap)

Category Cards:
  Background: white
  Border: 1px border-light
  Border-radius: 12px
  Padding: 32px
  Shadow: 0 1px 3px rgba(0,0,0,0.04)
  Hover: shadow increases to 0 4px 12px rgba(0,0,0,0.08), translateY(-2px)
  Transition: all 300ms ease

  Icon area: geometric abstract SVG (circles/lines), 48px, monochrome
  Title: section-title, text-primary
  Tagline: small size, text-secondary, 3 lines max
  "Explore →" link: accent color, small size, font-weight 500
```

### Post Card (Category Listing)
```
Background: white
Border: 1px border-light
Border-radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.04)
Hover: shadow increases, subtle translateY(-1px)

Layout:
  Top: category label (caption size, uppercase, text-secondary)
  Title: card-title, text-primary
  Summary: body size, text-secondary, 2-line clamp
  Bottom row: date (caption, text-tertiary) + version badge ("v3", caption, accent-light bg)
```

### Post Page (Linear-style)
```
Container: centered, max-width 720px
Background: white card on #F5F5F5 page
Card padding: 48px (desktop), 24px (mobile)
Border-radius: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.04)

Header:
  Category label: caption, uppercase, accent color, tracking-wider
  Title: post-title
  Date: small, text-secondary

Version Timeline (below header):
  Horizontal line with dots
  Each dot: 12px circle, border-light border
  Current version: filled accent color, slightly larger (14px)
  Deleted version: dashed border, red-tinted
  Below each dot: version label ("v1") + date (caption, text-tertiary)
  Clickable — navigates to that version
  Connector line: 2px, border-light color

Content:
  Markdown rendered with generous line-height (1.75)
  Paragraphs: margin-bottom 1.5rem
  h2: section-title, margin-top 2.5rem
  h3: card-title, margin-top 2rem
  Links: accent color, underline on hover
  Code blocks: mono font, #F8F9FA background, border-radius 8px, padding 16px
  Blockquotes: left border 3px accent, padding-left 16px, text-secondary italic
  Images: border-radius 8px, max-width 100%

Soft-deleted version:
  Card background: deleted-bg
  Content replaced with: "This content was removed by Erdem."
  Text: deleted-text, italic, centered, with subtle icon
```

### Attachments Section
```
Below post content, separated by border-light divider
Title: "References" — small, text-secondary, uppercase

Each attachment:
  Inline flex row
  Icon (PDF/image/video): 16px, text-secondary
  Label: small, text-primary
  Link: accent color
  Hover: underline
```

### Agent Commentary Section (Accordion)
```
Below attachments, separated by 48px spacing
Section title: "AI Perspectives" — section-title, text-primary

Summary Agent Card (always open by default):
  Background: white
  Border: 1px border-light
  Left border: 4px summary color (blue)
  Border-radius: 12px
  Padding: 24px

  Header row:
    Agent name: card-title, text-primary
    Model badge: caption, accent-light bg, border-radius 9999px, padding 2px 8px
    Date: caption, text-tertiary

  Content: markdown rendered, body size

  "Show prompt" toggle: caption, text-secondary, clickable
    Expands to show: system_prompt + user_prompt in mono font, #F8F9FA bg

Perspective Agent Cards (collapsed by default):
  Same style as summary but:
  - Left border color matches agent color (amber, violet, cyan, emerald)
  - Collapsed state: only header row visible
  - Expand/collapse icon: chevron, smooth 200ms rotation
  - Content area: smooth height animation 300ms ease
```

### Version Timeline Component
```
Layout: horizontal, centered, full content-width
Height: 60px
Margin: 24px 0

Timeline line: 2px solid border-light, horizontal

Version dots:
  Size: 12px (normal), 16px (current)
  Normal: white fill, border-light border, 2px
  Current: accent fill, no border
  Deleted: white fill, dashed red border
  Hover: scale(1.2), transition 150ms

Labels below dots:
  Version: "v1", caption, text-secondary
  Date: "Jan 2026", caption, text-tertiary

On click: navigates to /[category]/[slug]/v/[number]
```

---

## Animations

```
All transitions use: cubic-bezier(0.4, 0, 0.2, 1)

Card hover:
  transform: translateY(-2px)
  box-shadow: increase
  duration: 300ms

Accordion open/close:
  height: auto with max-height trick or framer-motion
  opacity: 0 → 1
  duration: 300ms

Page load:
  Fade in from opacity 0, translateY(8px) → normal
  duration: 500ms
  stagger: 100ms between elements (hero → cards)

Timeline dot hover:
  transform: scale(1.2)
  duration: 150ms

Nav link underline:
  width: 0 → 100%
  duration: 200ms

Scroll-triggered:
  Elements fade in as they enter viewport
  IntersectionObserver with threshold 0.1
  translateY(16px) → 0, opacity 0 → 1
  duration: 600ms
```

---

## Responsive Breakpoints

```
sm:   640px   (mobile landscape)
md:   768px   (tablet)
lg:   1024px  (desktop)
xl:   1280px  (wide desktop)

Mobile-first approach:
  - Homepage: 3-col → 1-col stack below md
  - Post page: full-width card below md, reduced padding
  - Navbar: hamburger below md
  - Timeline: horizontal scroll if > 5 versions on mobile
  - Agent cards: full-width, same accordion behavior
```

---

## Admin Pages (Minimal Styling)

Admin pages use a simpler, functional design:
- Sidebar navigation (left, 240px width)
- White background for content area
- Standard shadcn/ui components for forms, tables, buttons
- No decorative elements — pure utility
- Monospace font for prompt/README editors
