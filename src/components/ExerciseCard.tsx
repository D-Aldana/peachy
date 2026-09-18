import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bestSet, compareSets, previousSession } from '../lib/progress';
import { newId, useStore } from '../lib/store';
import type { ExerciseEntry, Unit } from '../lib/types';
import { defaultWeight, formatWeight, fromKg, roundTo, toKg, weightStep } from '../lib/units';
import { colors, fonts } from '../theme';
import { Stepper } from './Stepper';
import { Button, TrendBadge } from './ui';

type Props = {
  entry: ExerciseEntry;
  workoutId: string;
  expanded: boolean;
  onExpand: () => void;
};

export function ExerciseCard({ entry, workoutId, expanded, onExpand }: Props) {
  const { state, dispatch } = useStore();
  const { unit } = state;
  const previous = previousSession(state.workouts, entry.name, { excludeId: workoutId });
  const trend = compareSets(entry.sets, previous?.sets ?? null);
  const previousBest = previous ? bestSet(previous.sets) : null;

  const [draft, setDraft] = useState(() => {
    const seed = entry.sets.at(-1) ?? previous?.sets.at(-1);
    return {
      reps: seed?.reps ?? 8,
      weight: seed ? roundTo(fromKg(seed.weightKg, unit), 0.1) : defaultWeight(unit),
    };
  });

  const draftUnit = useRef<Unit>(unit);
  useEffect(() => {
    const from = draftUnit.current;
    if (from === unit) return;
    draftUnit.current = unit;
    setDraft((d) => ({ ...d, weight: roundTo(fromKg(toKg(d.weight, from), unit), 0.1) }));
  }, [unit]);

  function addSet() {
    dispatch({
      type: 'addSet',
      entryId: entry.id,
      id: newId(),
      reps: draft.reps,
      weightKg: toKg(draft.weight, unit),
    });
  }

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      <Pressable onPress={onExpand} disabled={expanded} accessibilityRole="button" style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{entry.name}</Text>
          <Text style={styles.reference}>
            {previous && previousBest
              ? `Last time: ${previous.sets.length} ${previous.sets.length === 1 ? 'set' : 'sets'}, best ${formatWeight(previousBest.weightKg, unit)} ${unit} × ${previousBest.reps}`
              : 'No history yet'}
          </Text>
        </View>
        {!expanded && <Text style={styles.setCount}>{entry.sets.length}</Text>}
      </Pressable>

      {(entry.sets.length > 0 || trend === 'first') && <TrendBadge trend={trend} />}

      {entry.sets.length > 0 && (
        <View style={styles.sets}>
          {entry.sets.map((set, i) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.setIndex}>{i + 1}</Text>
              <Text style={styles.setValue}>
                {formatWeight(set.weightKg, unit)} {unit} × {set.reps}
              </Text>
              {expanded && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove set ${i + 1}`}
                  onPress={() => dispatch({ type: 'removeSet', entryId: entry.id, setId: set.id })}
                  hitSlop={12}
                  style={({ pressed }) => [styles.remove, pressed && { opacity: 0.5 }]}
                >
                  <Text style={styles.removeLabel}>×</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}

      {expanded && (
        <View style={styles.entry}>
          <View style={styles.steppers}>
            <Stepper
              label="Reps"
              value={draft.reps}
              step={1}
              onChange={(reps) => setDraft((d) => ({ ...d, reps: Math.round(reps) }))}
            />
            <Stepper
              label={`Weight (${unit})`}
              value={draft.weight}
              step={weightStep(unit)}
              decimal
              onChange={(weight) => setDraft((d) => ({ ...d, weight }))}
            />
          </View>
          <Button label="Add set" onPress={addSet} disabled={draft.reps < 1} />
          {entry.sets.length === 0 && (
            <Button
              label="Remove exercise"
              variant="ghost"
              onPress={() => dispatch({ type: 'removeExercise', entryId: entry.id })}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardExpanded: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.text,
  },
  reference: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  setCount: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  sets: {
    gap: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    gap: 12,
  },
  setIndex: {
    width: 20,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textFaint,
    fontVariant: ['tabular-nums'],
  },
  setValue: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  remove: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: {
    fontSize: 22,
    color: colors.textFaint,
  },
  entry: {
    gap: 12,
    paddingTop: 4,
  },
  steppers: {
    flexDirection: 'row',
    gap: 12,
  },
});
