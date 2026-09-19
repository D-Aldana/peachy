import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Stat, TrendBadge, WeekPeaches } from '../components/ui';
import { useStore } from '../lib/store';
import { formatNumber, formatWeight, fromKg } from '../lib/units';
import { summarizeWeek } from '../lib/week';
import { colors, fonts } from '../theme';

export default function Summary() {
  const { state } = useStore();
  const { unit } = state;
  const week = summarizeWeek(state.workouts);
  const lastDay = new Date(week.end.getTime() - 1);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.range}>
        {formatDay(week.start)} – {formatDay(lastDay)}
      </Text>

      <View style={styles.card}>
        <WeekPeaches days={week.days} />
        <View style={styles.divider} />
        <View style={styles.stats}>
          <Stat label="workouts" value={String(week.workoutCount)} />
          <Stat label="sets" value={String(week.totalSets)} />
          <Stat label={`${unit} volume`} value={formatNumber(fromKg(week.totalVolumeKg, unit), 0)} />
        </View>
      </View>

      {week.exercises.length === 0 ? (
        <Text style={styles.empty}>Nothing logged yet this week. Your first workout will show up here.</Text>
      ) : (
        <View style={styles.list}>
          {week.exercises.map((exercise) => (
            <View key={exercise.name} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.name}>{exercise.name}</Text>
                <Text style={styles.meta}>
                  {exercise.totalSets} {exercise.totalSets === 1 ? 'set' : 'sets'}
                  {exercise.best && ` · best ${formatWeight(exercise.best.weightKg, unit)} ${unit} × ${exercise.best.reps}`}
                </Text>
              </View>
              <TrendBadge trend={exercise.trend} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  range: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    gap: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  list: {
    gap: 10,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  rowHeader: {
    gap: 4,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
