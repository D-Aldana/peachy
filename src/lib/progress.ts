import type { Trend, Workout, WorkoutSet } from './types';

// Weights round-trip through lb/kg conversion, so compare with a small tolerance.
const EPSILON = 0.01;

export function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function bestSet(sets: WorkoutSet[]): WorkoutSet | null {
  let best: WorkoutSet | null = null;
  for (const set of sets) {
    if (
      !best ||
      set.weightKg > best.weightKg + EPSILON ||
      (Math.abs(set.weightKg - best.weightKg) <= EPSILON && set.reps > best.reps)
    ) {
      best = set;
    }
  }
  return best;
}

export function volume(sets: WorkoutSet[]): number {
  return sets.reduce((sum, set) => sum + set.reps * set.weightKg, 0);
}

export function compareSets(current: WorkoutSet[], previous: WorkoutSet[] | null): Trend {
  if (!previous || previous.length === 0) return 'first';

  const curBest = bestSet(current)?.weightKg ?? 0;
  const prevBest = bestSet(previous)?.weightKg ?? 0;
  const curVolume = volume(current);
  const prevVolume = volume(previous);

  if (curBest > prevBest + EPSILON) return 'up';
  if (Math.abs(curBest - prevBest) <= EPSILON && curVolume > prevVolume + EPSILON) return 'up';
  if (curBest < prevBest - EPSILON || curVolume < prevVolume - EPSILON) return 'down';
  return 'even';
}

/** Sets from the most recent completed workout containing this exercise, optionally before a cutoff. */
export function previousSession(
  workouts: Workout[],
  name: string,
  options: { excludeId?: string; before?: number } = {},
): { workout: Workout; sets: WorkoutSet[] } | null {
  let found: { workout: Workout; sets: WorkoutSet[] } | null = null;
  for (const workout of workouts) {
    if (workout.endedAt === null || workout.id === options.excludeId) continue;
    if (options.before !== undefined && workout.endedAt >= options.before) continue;
    if (found && workout.endedAt <= found.workout.endedAt!) continue;
    const entry = workout.exercises.find((e) => sameName(e.name, name));
    if (entry && entry.sets.length > 0) found = { workout, sets: entry.sets };
  }
  return found;
}
