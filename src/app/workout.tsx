import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseCard } from '../components/ExerciseCard';
import { Button } from '../components/ui';
import { sameName } from '../lib/progress';
import { newId, useActiveWorkout, useStore } from '../lib/store';
import { colors, fonts } from '../theme';

export default function WorkoutScreen() {
  const { state, dispatch } = useStore();
  const workout = useActiveWorkout();
  const [name, setName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(() => workout?.exercises.at(-1)?.id ?? null);

  if (!workout) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No workout in progress.</Text>
        <Button label="Back home" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const query = name.trim().toLowerCase();
  const suggestions = state.exerciseNames
    .filter((n) => !workout.exercises.some((e) => sameName(e.name, n)))
    .filter((n) => !query || n.toLowerCase().includes(query))
    .filter((n) => n.toLowerCase() !== query)
    .slice(0, 6);

  function addExercise(input: string) {
    if (!input.trim()) return;
    const existing = workout!.exercises.find((e) => sameName(e.name, input));
    const id = existing?.id ?? newId();
    if (!existing) dispatch({ type: 'addExercise', id, name: input });
    setExpandedId(id);
    setName('');
  }

  function finish() {
    dispatch({ type: 'finishWorkout', now: Date.now() });
    router.back();
  }

  function cancel() {
    const discard = () => {
      dispatch({ type: 'cancelWorkout' });
      router.back();
    };
    const message = 'This workout and its sets will be deleted.';
    if (Platform.OS === 'web') {
      if (window.confirm(`Discard workout? ${message}`)) discard();
      return;
    }
    Alert.alert('Discard workout?', message, [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: discard },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {workout.exercises.map((entry) => (
            <ExerciseCard
              key={entry.id}
              entry={entry}
              workoutId={workout.id}
              expanded={entry.id === expandedId}
              onExpand={() => setExpandedId(entry.id)}
            />
          ))}

          <View style={styles.addSection}>
            <Text style={styles.addLabel}>
              {workout.exercises.length === 0 ? 'What are you starting with?' : 'Next exercise'}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                onSubmitEditing={() => addExercise(name)}
                placeholder="Exercise name"
                placeholderTextColor={colors.textFaint}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                style={styles.input}
              />
              <Button label="Add" onPress={() => addExercise(name)} disabled={!name.trim()} style={styles.addButton} />
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    accessibilityRole="button"
                    onPress={() => addExercise(s)}
                    style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.border }]}
                  >
                    <Text style={styles.chipLabel}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Cancel" variant="ghost" onPress={cancel} style={styles.cancel} />
          <Button label="Finish workout" onPress={finish} style={styles.flex} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  addSection: {
    gap: 10,
    paddingTop: 8,
  },
  addLabel: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 17,
  },
  addButton: {
    paddingHorizontal: 22,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancel: {
    paddingHorizontal: 16,
  },
});
