import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';
import { Icon, type IconName } from './Icon';

type StepperProps = {
  label: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
  decimal?: boolean;
};

export function Stepper({ label, value, step, onChange, decimal }: StepperProps) {
  const [text, setText] = useState(display(value));

  // Keep the field in sync with stepper taps and unit switches without clobbering typing.
  useEffect(() => {
    if (parse(text) !== value) setText(display(value));
  }, [value]);

  function parse(input: string): number {
    const n = decimal ? parseFloat(input.replace(',', '.')) : parseInt(input, 10);
    return Number.isFinite(n) ? n : NaN;
  }

  function commit(input: string) {
    setText(input);
    const n = parse(input);
    if (!Number.isNaN(n) && n >= 0) onChange(n);
  }

  const bump = (delta: number) => onChange(Math.max(0, Math.round((value + delta) * 100) / 100));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <StepButton icon="minus" accessibilityLabel={`Decrease ${label}`} onPress={() => bump(-step)} />
        <TextInput
          value={text}
          onChangeText={commit}
          onBlur={() => setText(display(value))}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          selectTextOnFocus
          accessibilityLabel={label}
          style={styles.input}
        />
        <StepButton icon="plus" accessibilityLabel={`Increase ${label}`} onPress={() => bump(step)} />
      </View>
    </View>
  );
}

function display(value: number): string {
  return String(Math.round(value * 100) / 100);
}

function StepButton({
  icon,
  accessibilityLabel,
  onPress,
}: {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.stepButton, pressed && { backgroundColor: colors.surfaceRaised }]}
    >
      <Icon name={icon} size={22} color={colors.accentPressed} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
    paddingLeft: 4,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 999,
    overflow: 'hidden',
  },
  stepButton: {
    width: 42,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 56,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
