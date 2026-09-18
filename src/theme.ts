import type { Trend } from './lib/types';

export const colors = {
  background: '#24161F',
  surface: '#33212C',
  surfaceRaised: '#422B39',
  border: '#553A4A',
  text: '#FBEDE6',
  textMuted: '#BFA3AF',
  textFaint: '#8A6E7B',
  accent: '#FF9B7D',
  accentPressed: '#F07F5F',
  onAccent: '#2A1520',
  danger: '#F2A0A8',
};

export const fonts = {
  serif: 'Fraunces_600SemiBold',
  serifItalic: 'Fraunces_700Bold_Italic',
  serifRegular: 'Fraunces_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
};

export const trendStyles: Record<Trend, { label: string; color: string; background: string }> = {
  up: { label: 'Up on last time', color: '#BDE8C0', background: '#2F4A36' },
  even: { label: 'Even with last time', color: '#F2D6B8', background: '#4A3A2E' },
  down: { label: 'Down on last time', color: '#F2C2C8', background: '#4D2F3B' },
  first: { label: 'First time', color: colors.textMuted, background: colors.surfaceRaised },
};
