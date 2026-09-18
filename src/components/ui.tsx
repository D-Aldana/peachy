import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useStore } from '../lib/store';
import type { Trend, Unit } from '../lib/types';
import { colors, fonts, trendStyles } from '../theme';

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
        variant === 'secondary' && {
          backgroundColor: pressed ? colors.surfaceRaised : colors.surface,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        variant === 'ghost' && pressed && { opacity: 0.6 },
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

export function TrendBadge({ trend }: { trend: Trend }) {
  const { label, color, background } = trendStyles[trend];
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
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
            <Text style={[styles.toggleLabel, selected && { color: colors.onAccent }]}>{unit}</Text>
          </Pressable>
        );
      })}
    </View>
  );
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
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleSelected: {
    backgroundColor: colors.accent,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
