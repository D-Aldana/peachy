import type { Trend } from './lib/types';

export const colors = {
  background: '#FFF1EC',
  surface: '#FFFFFF',
  surfaceRaised: '#FFE4DA',
  border: '#F6D3C7',
  text: '#3A2330',
  textMuted: '#8E6C77',
  textFaint: '#C4A5AE',
  accent: '#FF9270',
  accentPressed: '#F57B57',
  onAccent: '#3A2330',
  leaf: '#7DB37C',
  danger: '#D9607A',
};

export const fonts = {
  display: 'MPLUSRounded1c_800ExtraBold',
  bold: 'MPLUSRounded1c_700Bold',
  body: 'MPLUSRounded1c_400Regular',
  bodyMedium: 'MPLUSRounded1c_500Medium',
};

export const trendStyles: Record<Trend, { label: string; color: string; background: string }> = {
  up: { label: 'Up on last time', color: '#3F7A45', background: '#E4F3E0' },
  even: { label: 'Even with last time', color: '#8A6420', background: '#FFF1CC' },
  down: { label: 'Down on last time', color: '#A8465C', background: '#FFE1E6' },
  first: { label: 'First time', color: colors.textMuted, background: colors.surfaceRaised },
};
