/**
 * Design tokens for FastCaption — single source of truth for spacing, radius, typography, and gradients.
 * Use these with theme for consistent UI across screens.
 * Phase 1 (Dribbble): display headline, subhead, gradient helpers, theme-aware shadow.
 */

// 4/8px grid
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Primary gradient colors (hero / CTA). Use with LinearGradient; theme may override.
export const gradient = {
  primaryStart: "#8B5CF6",
  primaryEnd: "#A78BFA",
  primaryStartLight: "#9D6EF7",
  primaryEndLight: "#B794F6",
};

// Typography: font sizes and weights (use with theme colors)
export const typography = {
  // Display: one clear anchor per screen (hero headline)
  display: {
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  // Subhead: value prop under the display headline
  subhead: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
  },
  heading1: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  heading2: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
};

// Shadow (platform-specific; use sparingly). Prefer getShadow(isDark, size) for theme-aware shadowColor.
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

/**
 * Theme-aware shadow style. Use for cards (sm) and modals/sheets (md/lg) so elevation reads in dark mode.
 * @param {boolean} isDark
 * @param {'sm'|'md'|'lg'} size
 */
export function getShadow(isDark, size = "sm") {
  const base = shadow[size];
  return {
    ...base,
    shadowColor: isDark ? "rgba(0,0,0,0.5)" : "#000",
  };
}
