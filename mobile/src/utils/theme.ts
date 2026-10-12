// Tokens from DESIGN.md. Keep the two in sync.
export const colors = {
  dominant1: '#F4F5EE',
  dominant2: '#F1E8DC',
  charcoal: '#2B2630',
  primary1: '#8DB4D6',
  primaryDark: '#1F6299',
  secondary1: '#D6C6E3',
  secondaryDark: '#7A45A8',
  accent1: '#FF854D',
  accentDark: '#993608',
  white: '#FFFFFF',
  // Not in DESIGN.md: charcoal at reduced opacity for supporting text and
  // hairlines. textMuted stays above 4.5:1 on either dominant background.
  textMuted: 'rgba(43, 38, 48, 0.72)',
  border: 'rgba(43, 38, 48, 0.16)',
} as const;

export interface Tone {
  background: string;
  text: string;
}

// Fill + text pairings that pass WCAG AA. The hue-matched darks from the
// palette (e.g. primaryDark on primary1) only reach ~3:1, so light fills
// take charcoal text and dark fills take white.
export const tones = {
  accent: { background: colors.accent1, text: colors.charcoal },
  primarySoft: { background: colors.primary1, text: colors.charcoal },
  primary: { background: colors.primaryDark, text: colors.white },
  secondarySoft: { background: colors.secondary1, text: colors.charcoal },
  secondary: { background: colors.secondaryDark, text: colors.white },
} as const satisfies Record<string, Tone>;

export const fonts = {
  heading: {
    semiBold: 'Fraunces_600SemiBold',
    bold: 'Fraunces_700Bold',
  },
  body: {
    regular: 'JosefinSans_400Regular',
    semiBold: 'JosefinSans_600SemiBold',
  },
} as const;

// DESIGN.md sizes are drawn on the 656-wide design canvas; DESIGN_SCALE
// converts them to points on a ~375pt-wide phone (72 -> 41, 32 -> 18).
export const DESIGN_WIDTH = 656;
const DESIGN_SCALE = 375 / DESIGN_WIDTH;
const scaled = (size: number, lineHeightRatio: number) => {
  const fontSize = Math.round(size * DESIGN_SCALE);
  return { fontSize, lineHeight: Math.round(fontSize * lineHeightRatio) };
};

export const typography = {
  h0: { fontFamily: fonts.heading.semiBold, ...scaled(72, 1.1) },
  h1: { fontFamily: fonts.heading.semiBold, ...scaled(60, 1.15) },
  h2: { fontFamily: fonts.heading.semiBold, ...scaled(48, 1.2) },
  itemTitle: { fontFamily: fonts.heading.bold, ...scaled(36, 1.25) },
  paragraph: { fontFamily: fonts.body.regular, ...scaled(32, 1.45) },
  // Not in DESIGN.md: a smaller Josefin Sans step for field labels, button
  // text and metadata, where paragraph size would crowd the layout.
  label: { fontFamily: fonts.body.semiBold, fontSize: 15, lineHeight: 20 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 28,
  round: 50,
} as const;

// Minimum touch target (Apple HIG 44pt / Material 48dp).
export const MIN_TOUCH = 48;
