import Svg, { Defs, Mask, Path, Rect } from 'react-native-svg';

import { colors } from '../theme';

// Stroke paths from the brand kit's outline UI icons (24×24 grid).
const paths = {
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  delete: ['M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6'],
  'trend-up': ['m4 16 5-5 4 3 7-8', 'M15 6h5v5'],
  'trend-even': ['M4 12h16', 'm16 8 4 4-4 4'],
  'trend-down': ['m4 8 5 5 4-3 7 8', 'M15 18h5v-5'],
  'first-time': [
    'M12 21v-8M12 15c-4 0-6-2.2-6-5 4 0 6 1.8 6 5ZM12 13c3.7 0 5.5-2 5.5-4.5-3.7 0-5.5 1.7-5.5 4.5Z',
    'M5 3v3M3.5 4.5h3',
  ],
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24, color = colors.text }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[name].map((d) => (
        <Path key={d} d={d} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

const BODY =
  'M510 300 C455 235 360 220 285 260 C170 320 150 500 205 635 C265 780 415 838 528 840 C664 845 808 747 842 585 C875 430 824 292 714 244 C630 207 551 236 510 300 Z';
const CHANNEL = 'M535 248 C610 355 640 460 584 553 C528 646 431 691 461 787 C473 825 500 853 531 886';

/** The Peachy mark: ripe when `ripe`, otherwise a dashed outline of the fruit. */
export function Peach({ size, ripe = true, ring }: { size: number; ripe?: boolean; ring?: string }) {
  // Keep the dashed outline ~2px wide regardless of size.
  const unit = 840 / size;
  return (
    <Svg width={size} height={size} viewBox="100 60 840 840">
      {ripe ? (
        <>
          <Defs>
            <Mask id="peach-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
              <Rect width="1024" height="1024" fill="black" />
              <Path d={BODY} fill="white" />
              <Path d={CHANNEL} fill="none" stroke="black" strokeWidth={82} strokeLinecap="round" />
            </Mask>
          </Defs>
          <Path d={BODY} fill={colors.accent} mask="url(#peach-cut)" />
          <Path d="M520 302 C527 244 552 199 610 167" fill="none" stroke={colors.accentPressed} strokeWidth={32} strokeLinecap="round" />
          <Path d="M600 171 C650 95 775 80 832 113 C800 211 693 253 604 217 C582 204 584 183 600 171 Z" fill={colors.leaf} />
        </>
      ) : (
        <Path
          d={BODY}
          fill="none"
          stroke={ring ?? colors.border}
          strokeWidth={2 * unit}
          strokeDasharray={[4 * unit, 3 * unit]}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
