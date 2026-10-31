---
name: Vitality Flow
colors:
  surface: '#f5fbf5'
  surface-dim: '#d5dcd6'
  surface-bright: '#f5fbf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff5ef'
  surface-container: '#e9efe9'
  surface-container-high: '#e4eae4'
  surface-container-highest: '#dee4de'
  on-surface: '#171d19'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#2c322e'
  inverse-on-surface: '#ecf2ec'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#9b3e3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ba5551'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#7f2928'
  background: '#f5fbf5'
  on-background: '#171d19'
  surface-variant: '#dee4de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 120px
---

## Brand & Style

The design system is engineered for a transformative health journey, balancing medical precision with empathetic motivation. It avoids the sterile, clinical feel of traditional healthcare apps in favor of a "Vital-Modern" aesthetic—combining the clarity of **Minimalism** with the depth of **Glassmorphism**.

The visual narrative focuses on clarity and momentum. High-performance glass containers house critical health data, providing a sense of transparency and lightness. The interface prioritizes high legibility and breathability, ensuring that users feel focused rather than overwhelmed during their weight loss and fasting protocols.

## Colors

The palette uses functional color-coding to provide immediate cognitive feedback:
- **Primary (Emerald):** Represents success, completion, and growth. Used for primary actions and goal achievements.
- **Secondary (Teal):** Used for supplementary navigation and steady-state data visualization.
- **Supportive Accents:** **Amber** signals streaks and active efforts; **Rose** is reserved strictly for medical red flags or critical alerts.
- **Functional Specifics:** **Purple** is dedicated to fasting intervals, and **Blue** is dedicated to hydration tracking to prevent mental overlap between metrics.
- **Backgrounds:** A crisp Slate-tinted White (#F8FAFC) ensures a clean, medical-grade canvas that lets the colored data-points pop.

## Typography

The design system utilizes **Plus Jakarta Sans** across all levels to maintain a modern, friendly, yet professional tone. 

- **Display & Headlines:** Use tighter letter-spacing and heavier weights (700-800) to create a sense of authority and confidence in health stats.
- **Body Text:** Set with generous line heights to ensure long-form medical guidance or nutritional info is easily digestible.
- **Labels:** Use a medium weight with slight tracking for metadata and button text to differentiate from body content.

## Layout & Spacing

This design system follows a **fluid grid** model rooted in an 8px rhythm. 

- **Mobile:** 4-column layout with 20px side margins. Elements typically stack vertically to maintain readability for data charts.
- **Desktop:** 12-column layout with a maximum container width of 1280px. 
- **Rhythm:** Use `lg` (40px) spacing between major sections (e.g., Progress Overview vs. Daily Log) and `sm` (16px) for internal card padding to maintain a compact, "medical-dashboard" feel.

## Elevation & Depth

Depth is achieved through the layering of glass surfaces rather than traditional heavy shadows.

- **Surface 1 (Base):** #F8FAFC (Flat).
- **Surface 2 (Cards):** White at 70% opacity with a **12px Backdrop Blur**. Border is a 1px solid white at 40% opacity to simulate a glass edge.
- **Shadows:** Use extremely soft, low-opacity ambient shadows (Color: Slate-900, Opacity: 4%, Blur: 20px) to give a subtle lift to active glass panels.
- **Active State:** When an element is focused or interacted with, the backdrop blur increases slightly, and the border opacity increases to 80%.

## Shapes

The design system uses **Rounded (0.5rem)** as the default radius for components like input fields and small cards. This strikes a balance between the precision of sharp corners and the "friendliness" of fully rounded shapes.

- **Standard Buttons & Inputs:** 8px (0.5rem).
- **Progress Containers:** 16px (1rem) for a softer, more pill-like appearance.
- **Interactive Icons:** Circular (Pill-shaped) to distinguish them from data containers.

## Components

- **Buttons:** Feature a subtle `scale(1.02)` transform on hover. Primary buttons use a solid Emerald fill with white text. Secondary buttons use a Ghost style with a Teal border.
- **Glass Cards:** The signature component. Must include `backdrop-filter: blur(12px)` and a thin, semi-transparent white border.
- **Progress Bars:** Use linear gradients (e.g., Emerald to Teal) to represent movement and "flow." The background track should be a very pale version of the primary color at 10% opacity.
- **Badges:** High-contrast backgrounds with white text for "Goal Reached" or "Fasting" status. Use `label-sm` typography.
- **Form Inputs:** Soft Slate backgrounds that transition to a 2px Emerald border on focus. Include a subtle inner shadow to signify "input" depth.
- **Checklists:** Used for daily habit tracking. Checkboxes should animate with a "spring" effect when toggled to provide a hit of dopamine (encouragement).