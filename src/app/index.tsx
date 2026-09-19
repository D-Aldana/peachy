import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Peach } from '../components/Icon';
import { Button, Stat, UnitToggle, WeekPeaches } from '../components/ui';
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
          <View style={styles.brand}>
            <Peach size={22} />
            <Text style={styles.wordmark}>peachy</Text>
          </View>
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
          style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This week</Text>
            <Text style={styles.cardLink}>Summary ›</Text>
          </View>
          <WeekPeaches days={week.days} />
          <View style={styles.divider} />
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
              <Pressable
                key={w.id}
                accessibilityRole="button"
                accessibilityHint="Opens this workout to edit"
                onPress={() => router.push({ pathname: '/workout', params: { id: w.id } })}
                style={({ pressed }) => [styles.recentRow, pressed && { backgroundColor: colors.surfaceRaised }]}
              >
                <Text style={styles.recentDate}>{formatDate(w.endedAt!)}</Text>
                <Text style={styles.recentExercises} numberOfLines={1}>
                  {w.exercises.map((e) => e.name).join(', ')}
                </Text>
                <Text style={styles.recentChevron}>›</Text>
              </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.text,
  },
  hero: {
    gap: 6,
    paddingTop: 16,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.text,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    gap: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  cardLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.accentPressed,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  recent: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  recentDate: {
    width: 92,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.textMuted,
  },
  recentExercises: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  recentChevron: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textFaint,
  },
});
