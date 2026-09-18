import { sameName } from './progress';
import type { AppState, Unit, Workout } from './types';

export type Action =
  | { type: 'startWorkout'; id: string; now: number }
  | { type: 'cancelWorkout' }
  | { type: 'finishWorkout'; now: number }
  | { type: 'addExercise'; id: string; name: string }
  | { type: 'removeExercise'; entryId: string }
  | { type: 'addSet'; entryId: string; id: string; reps: number; weightKg: number }
  | { type: 'removeSet'; entryId: string; setId: string }
  | { type: 'setUnit'; unit: Unit };

export const initialState: AppState = {
  version: 1,
  unit: 'lb',
  exerciseNames: [],
  workouts: [],
  activeWorkoutId: null,
};

function updateActive(state: AppState, update: (workout: Workout) => Workout): AppState {
  return {
    ...state,
    workouts: state.workouts.map((w) => (w.id === state.activeWorkoutId ? update(w) : w)),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'startWorkout': {
      if (state.activeWorkoutId) return state;
      const workout: Workout = { id: action.id, startedAt: action.now, endedAt: null, exercises: [] };
      return { ...state, workouts: [...state.workouts, workout], activeWorkoutId: workout.id };
    }

    case 'cancelWorkout':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== state.activeWorkoutId),
        activeWorkoutId: null,
      };

    case 'finishWorkout': {
      const active = state.workouts.find((w) => w.id === state.activeWorkoutId);
      if (!active) return state;
      const exercises = active.exercises.filter((e) => e.sets.length > 0);
      // A workout with nothing logged isn't worth keeping in history.
      if (exercises.length === 0) return reducer(state, { type: 'cancelWorkout' });
      return {
        ...updateActive(state, (w) => ({ ...w, exercises, endedAt: action.now })),
        activeWorkoutId: null,
      };
    }

    case 'addExercise': {
      const typed = action.name.trim();
      if (!typed || !state.activeWorkoutId) return state;
      const name = state.exerciseNames.find((n) => sameName(n, typed)) ?? typed;
      const exerciseNames = [name, ...state.exerciseNames.filter((n) => !sameName(n, name))];
      return updateActive({ ...state, exerciseNames }, (w) =>
        w.exercises.some((e) => sameName(e.name, name))
          ? w
          : { ...w, exercises: [...w.exercises, { id: action.id, name, sets: [] }] },
      );
    }

    case 'removeExercise':
      return updateActive(state, (w) => ({
        ...w,
        exercises: w.exercises.filter((e) => e.id !== action.entryId),
      }));

    case 'addSet':
      return updateActive(state, (w) => ({
        ...w,
        exercises: w.exercises.map((e) =>
          e.id === action.entryId
            ? { ...e, sets: [...e.sets, { id: action.id, reps: action.reps, weightKg: action.weightKg }] }
            : e,
        ),
      }));

    case 'removeSet':
      return updateActive(state, (w) => ({
        ...w,
        exercises: w.exercises.map((e) =>
          e.id === action.entryId ? { ...e, sets: e.sets.filter((s) => s.id !== action.setId) } : e,
        ),
      }));

    case 'setUnit':
      return { ...state, unit: action.unit };
  }
}
