import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Stat, UnitToggle } from '../components/ui';
import { newId, useActiveWorkout, useStore } from '../lib/store';
import { formatNumber, fromKg } from '../lib/units';
import { summarizeWeek } from '../lib/week';
import { colors, fonts } from '../theme';

export default function Home() {
  const { state, dispatch } = useStore();
  const active = useActiveWorkout();
  const week = summarizeWeek(state.workouts);
  const recent = state.workouts
    .filter((w) => w.endedAt !== null)
    .sort((a, b) => b.endedAt! - a.endedAt!)
    .slice(0, 5);

  function startOrContinue() {
    if (!active) dispatch({ type: 'startWorkout', id: newId(), now: Date.now() });
    router.push('/workout');
  }

  const activeSets = active?.exercises.reduce((n, e) => n + e.sets.length, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>Peachy</Text>
          <UnitToggle />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{active ? 'Workout in progress' : 'Ready when you are'}</Text>
          <Text style={styles.heroBody}>
            {active
              ? `Started ${formatTime(active.startedAt)} · ${activeSets} ${activeSets === 1 ? 'set' : 'sets'} logged`
              : 'Tap start, name an exercise, log your sets.'}
          </Text>
          <Button label={active ? 'Continue workout' : 'Start workout'} onPress={startOrContinue} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/summary')}
          style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surfaceRaised }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This week</Text>
            <Text style={styles.cardLink}>Summary ›</Text>
          </View>
          <View style={styles.stats}>
            <Stat label="workouts" value={String(week.workoutCount)} />
            <Stat label="sets" value={String(week.totalSets)} />
            <Stat
              label={`${state.unit} volume`}
              value={formatNumber(fromKg(week.totalVolumeKg, state.unit), 0)}
            />
          </View>
        </Pressable>

        {recent.length > 0 && (
          <View style={styles.recent}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recent.map((w) => (
              <View key={w.id} style={styles.recentRow}>
                <Text style={styles.recentDate}>{formatDate(w.endedAt!)}</Text>
                <Text style={styles.recentExercises} numberOfLines={1}>
                  {w.exercises.map((e) => e.name).join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: fonts.serifItalic,
    fontSize: 36,
    color: colors.accent,
  },
  hero: {
    gap: 8,
    paddingVertical: 12,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.text,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.text,
  },
  cardLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.accent,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  recent: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.text,
    marginBottom: 6,
  },
  recentRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentDate: {
    width: 96,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  recentExercises: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
});
