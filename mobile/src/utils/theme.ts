export const colors = {
  primary: '#FEFAF5',
  secondary: '#8DB4D6',
  accent: '#F2A477',
  text: '#333333',
  textLight: '#666666',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  lightBlue: '#E4EFF7',
} as const;

export const circleColors = {
  orange: '#F2A477',
  purple: '#CDC1E5',
  yellow: '#F6E385',
  blue: '#8DB4D6',
  green: '#9FC2AF',
} as const;

// A deeper shade of each circleColors hue, for text placed on top of it —
// shared by the home screen's circle labels and the services screen's card
// labels so both read the same color for the same hue.
export const circleTextColors = {
  orange: '#9A4B1E',
  purple: '#5B4A82',
  yellow: '#8A7220',
  blue: '#2F5577',
  green: '#3F6657',
} as const;

export const fonts = {
  josefinSans: {
    regular: 'JosefinSans-Regular',
    medium: 'JosefinSans-Medium',
    semiBold: 'JosefinSans-SemiBold',
    bold: 'JosefinSans-Bold',
  },
  garet: {
    regular: 'Garet-Regular',
    medium: 'Garet-Medium',
    bold: 'Garet-Bold',
  },
  arimo: {
    regular: 'Arimo-Regular',
    medium: 'Arimo-Medium',
    bold: 'Arimo-Bold',
  },
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
