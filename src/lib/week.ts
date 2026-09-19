import { bestSet, compareSets, previousSession } from './progress';
import type { Trend, Workout, WorkoutSet } from './types';

/** Local Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export type ExerciseWeekSummary = {
  name: string;
  totalSets: number;
  best: WorkoutSet | null;
  trend: Trend;
};

export type WeekSummary = {
  start: Date;
  end: Date;
  workoutCount: number;
  totalSets: number;
  /** Consecutive weeks with at least one finished workout. */
  streak: number;
  /** Monday-first; true where a workout was finished that day. */
  days: boolean[];
  exercises: ExerciseWeekSummary[];
};

export function summarizeWeek(workouts: Workout[], now = new Date()): WeekSummary {
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const inWeek = workouts
    .filter((w) => w.endedAt !== null && w.endedAt >= start.getTime() && w.endedAt < end.getTime())
    .sort((a, b) => a.endedAt! - b.endedAt!);

  const byName = new Map<string, { name: string; sets: WorkoutSet[]; latest: WorkoutSet[] }>();
  let totalSets = 0;

  for (const workout of inWeek) {
    for (const entry of workout.exercises) {
      if (entry.sets.length === 0) continue;
      totalSets += entry.sets.length;

      const key = entry.name.trim().toLowerCase();
      const existing = byName.get(key);
      if (existing) {
        existing.sets.push(...entry.sets);
        existing.latest = entry.sets;
      } else {
        byName.set(key, { name: entry.name, sets: [...entry.sets], latest: entry.sets });
      }
    }
  }

  // The week's most recent session is compared to the last session before the week began.
  const exercises = [...byName.values()].map(({ name, sets, latest }) => {
    const before = previousSession(workouts, name, { before: start.getTime() });
    return {
      name,
      totalSets: sets.length,
      best: bestSet(sets),
      trend: compareSets(latest, before?.sets ?? null),
    };
  });

  const days = Array.from({ length: 7 }, () => false);
  for (const workout of inWeek) days[(new Date(workout.endedAt!).getDay() + 6) % 7] = true;

  return { start, end, workoutCount: inWeek.length, totalSets, streak: weekStreak(workouts, now), days, exercises };
}

export function weekStreak(workouts: Workout[], now = new Date()): number {
  const trained = new Set(
    workouts.filter((w) => w.endedAt !== null).map((w) => startOfWeek(new Date(w.endedAt!)).getTime()),
  );
  const cursor = startOfWeek(now);
  // This week only breaks the streak once it's over.
  if (!trained.has(cursor.getTime())) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (trained.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
