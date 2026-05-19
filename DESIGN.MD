---
name: Safety Core Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for the high-stakes environment of Safety and Health at Work (SST). It prioritizes **operational reliability, administrative authority, and user confidence**. The target audience ranges from field safety officers in Barranquilla's industrial sectors to corporate compliance executives.

The visual style is **Corporate / Modern** with a lean towards **Precision Minimalism**. It avoids decorative flourishes in favor of high-contrast layouts and functional density. The emotional response should be one of "controlled vigilance"—feeling secure, organized, and legally compliant. The aesthetic utilizes structured grids and a clear information hierarchy to reduce cognitive load during critical safety audits or incident reporting.

## Colors

The palette is anchored by **Deep Security Blue** (#0F172A), providing a foundation of stability and institutional trust. **Emerald Health Green** (#10B981) serves as the primary action and "safe state" indicator, connecting the UI to health and successful compliance. 

**Steel Gray** (#64748B) is used for secondary information, icons, and borders to maintain a professional, industrial tone. The background uses a crisp neutral off-white to ensure maximum legibility for data-heavy interfaces. High-contrast ratios are strictly maintained (WCAG AA compliant) to support readability in varying light conditions, such as outdoor industrial sites in Barranquilla.

## Typography

This design system utilizes **Inter** exclusively for its neutral, systematic, and highly legible qualities. The scale is built for density; body sizes are optimized for reading long compliance reports and complex data tables. 

**Headlines** use a tighter letter-spacing and heavier weights to command authority. **Labels** utilize uppercase styling for structural elements like table headers and section titles to differentiate them from interactive data. On mobile devices, headline sizes scale down to prevent excessive wrapping while maintaining a clear hierarchy for field workers.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop to maintain structured alignment of dashboard widgets and data tables, centering content within a 1440px max-width container. 

A strict **4px baseline grid** governs all spacing, ensuring vertical rhythm. For data-dense screens, use `stack-sm` (8px) for related elements. For general page sections, use `stack-lg` (32px). On mobile, the 12-column desktop grid reflows into a single column with 16px side margins to maximize the horizontal space for table horizontal-scrolling or card-based views.

## Elevation & Depth

This design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows. This reinforces a "flat and focused" industrial feel. 

1.  **Level 0 (Base):** The main canvas, using Neutral #F8FAFC.
2.  **Level 1 (Cards/Containers):** Pure white background with a 1px border in Steel Gray at 20% opacity. 
3.  **Level 2 (Dropdowns/Modals):** Pure white with a subtle, tight ambient shadow (Blur: 8px, Y: 4px, Opacity: 10% Black) to indicate temporary overlay without breaking the system's clean lines.

Interactive elements do not "lift" on hover; instead, they shift in background tone or border intensity, maintaining a sturdy, grounded appearance.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding removes the harshness of industrial software while maintaining a serious, geometric profile. 

- **Standard Elements (Buttons, Inputs):** 4px (0.25rem) corner radius.
- **Containers (Cards, Tables):** 8px (0.5rem) corner radius.
- **Status Badges:** 100px (Fully pill-shaped) to distinguish them from interactive buttons.
- **Selection Controls:** Checkboxes use a 2px radius; Radio buttons remain circular.

## Components

### Data Tables
Tables are the core of the SST platform. Use a zebra-stripe pattern (Neutral #F1F5F9 on even rows) for high readability. Headers must be "Deep Security Blue" with "Label-MD" typography.

### Status Badges
Used for compliance states (e.g., "Certified," "Expired"). Use low-saturation background tints with high-saturation text of the same hue (e.g., Emerald Health Green tint background with Deep Green text).

### Progress Bars
Used for training completion or audit scores. Use a 8px height track. The track should be Steel Gray (10% opacity) and the fill Emerald Health Green. For "At Risk" scores, the fill color must switch to Status Warning or Error colors.

### Certification Cards
These are specialized containers for worker credentials. They must feature a Level 1 elevation, a clear "label-sm" for the expiration date, and a prominent "Status Badge" in the top right corner.

### Input Fields
Fields use a 1px Steel Gray border. Focus states are indicated by a 2px Deep Security Blue border—no outer glow/halo. Error states use Status Error red for both border and helper text.

### Buttons
- **Primary:** Deep Security Blue background, White text.
- **Secondary:** Transparent background, Deep Security Blue border and text.
- **Success/Action:** Emerald Health Green background, White text (reserved for "Approve" or "Complete" actions).