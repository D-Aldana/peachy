import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useStore } from '../lib/store';
import type { Trend, Unit } from '../lib/types';
import { colors, fonts, trendStyles } from '../theme';
import { Icon, Peach } from './Icon';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && { backgroundColor: pressed ? colors.accentPressed : colors.accent },
        variant === 'secondary' && { backgroundColor: pressed ? colors.surfaceRaised : colors.surface },
        variant === 'ghost' && pressed && { opacity: 0.6 },
        pressed && variant !== 'ghost' && { transform: [{ scale: 0.97 }] },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          { color: variant === 'primary' ? colors.onAccent : variant === 'ghost' ? colors.textMuted : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekPeaches({ days, size = 32 }: { days: boolean[]; size?: number }) {
  const today = (new Date().getDay() + 6) % 7;
  const count = days.filter(Boolean).length;
  return (
    <View
      style={styles.week}
      accessible
      accessibilityLabel={`Trained ${count} ${count === 1 ? 'day' : 'days'} this week`}
    >
      {days.map((ripe, i) => (
        <View key={i} style={styles.day}>
          <Peach size={size} ripe={ripe} ring={i === today ? colors.accent : undefined} />
          <Text style={[styles.dayLabel, ripe && styles.dayLabelRipe, i === today && styles.dayLabelToday]}>{WEEKDAYS[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export function TrendBadge({ trend }: { trend: Trend }) {
  const { label, color, background } = trendStyles[trend];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Icon name={trend === 'first' ? 'first-time' : `trend-${trend}`} size={14} color={color} />
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

export function UnitToggle() {
  const { state, dispatch } = useStore();
  const units: Unit[] = ['lb', 'kg'];
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup">
      {units.map((unit) => {
        const selected = state.unit === unit;
        return (
          <Pressable
            key={unit}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => dispatch({ type: 'setUnit', unit })}
            hitSlop={6}
            style={[styles.toggleOption, selected && styles.toggleSelected]}
          >
            <Text style={[styles.toggleLabel, selected && { color: colors.text }]}>{unit}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StreakStat({ weeks }: { weeks: number }) {
  return <Stat label="streak" value={`${weeks} ${weeks === 1 ? 'wk' : 'wks'}`} />;
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 999,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textFaint,
  },
  dayLabelRipe: {
    color: colors.textMuted,
  },
  dayLabelToday: {
    fontFamily: fonts.bold,
    color: colors.accentPressed,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  toggleSelected: {
    backgroundColor: colors.surface,
  },
  toggleLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textMuted,
  },
  stat: {
    flex: 1,
    gap: 0,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
