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
  round: 50,
} as const;
