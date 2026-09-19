import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { bestSet, compareSets, previousSession } from '../lib/progress';
import { newId, useStore } from '../lib/store';
import type { ExerciseEntry, Unit } from '../lib/types';
import { formatWeight, fromKg, roundTo, toKg, weightStep } from '../lib/units';
import { colors, fonts } from '../theme';
import { Icon } from './Icon';
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
  // A past workout compares against sessions before it, not ones logged since.
  const endedAt = state.workouts.find((w) => w.id === workoutId)?.endedAt ?? undefined;
  const previous = previousSession(state.workouts, entry.name, { excludeId: workoutId, before: endedAt });
  const trend = compareSets(entry.sets, previous?.sets ?? null);
  const previousBest = previous ? bestSet(previous.sets) : null;

  const [draft, setDraft] = useState(() => {
    const seed = entry.sets.at(-1) ?? previous?.sets.at(-1);
    return {
      reps: seed?.reps ?? 8,
      weight: seed ? roundTo(fromKg(seed.weightKg, unit), 0.1) : 0,
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
      workoutId,
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
                  onPress={() => dispatch({ type: 'removeSet', workoutId, entryId: entry.id, setId: set.id })}
                  hitSlop={12}
                  style={({ pressed }) => [styles.remove, pressed && { opacity: 0.5 }]}
                >
                  <Icon name="delete" size={18} color={colors.textFaint} />
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
              onPress={() => dispatch({ type: 'removeExercise', workoutId, entryId: entry.id })}
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
    borderRadius: 28,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  cardExpanded: {
    borderColor: colors.border,
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
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
  },
  reference: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  setCount: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 32,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.accentPressed,
    fontVariant: ['tabular-nums'],
  },
  sets: {
    gap: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    gap: 12,
  },
  setIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: colors.surfaceRaised,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.accentPressed,
    fontVariant: ['tabular-nums'],
  },
  setValue: {
    flex: 1,
    fontFamily: fonts.bold,
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
  entry: {
    gap: 12,
    paddingTop: 4,
  },
  steppers: {
    flexDirection: 'row',
    gap: 12,
  },
});
