export type Unit = 'kg' | 'lb';

export type WorkoutSet = {
  id: string;
  reps: number;
  weightKg: number;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  exercises: ExerciseEntry[];
};

export type AppState = {
  version: 1;
  unit: Unit;
  exerciseNames: string[];
  workouts: Workout[];
  activeWorkoutId: string | null;
};

export type Trend = 'up' | 'even' | 'down' | 'first';
