import { sameName } from './progress';
import type { AppState, Unit, Workout } from './types';

export type Action =
  | { type: 'startWorkout'; id: string; now: number }
  | { type: 'finishWorkout'; now: number }
  | { type: 'deleteWorkout'; workoutId: string }
  | { type: 'tidyWorkout'; workoutId: string }
  | { type: 'addExercise'; workoutId: string; id: string; name: string }
  | { type: 'removeExercise'; workoutId: string; entryId: string }
  | { type: 'addSet'; workoutId: string; entryId: string; id: string; reps: number; weightKg: number }
  | { type: 'removeSet'; workoutId: string; entryId: string; setId: string }
  | { type: 'setUnit'; unit: Unit };

export const initialState: AppState = {
  version: 1,
  unit: 'lb',
  exerciseNames: [],
  workouts: [],
  activeWorkoutId: null,
};

function updateWorkout(state: AppState, id: string, update: (workout: Workout) => Workout): AppState {
  return {
    ...state,
    workouts: state.workouts.map((w) => (w.id === id ? update(w) : w)),
  };
}

// Drops exercises with no sets; a workout with nothing logged isn't worth keeping in history.
function tidy(state: AppState, id: string): AppState {
  const workout = state.workouts.find((w) => w.id === id);
  if (!workout) return state;
  const exercises = workout.exercises.filter((e) => e.sets.length > 0);
  if (exercises.length === 0) return reducer(state, { type: 'deleteWorkout', workoutId: id });
  return updateWorkout(state, id, (w) => ({ ...w, exercises }));
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'startWorkout': {
      if (state.activeWorkoutId) return state;
      const workout: Workout = { id: action.id, startedAt: action.now, endedAt: null, exercises: [] };
      return { ...state, workouts: [...state.workouts, workout], activeWorkoutId: workout.id };
    }

    case 'deleteWorkout':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.workoutId),
        activeWorkoutId: state.activeWorkoutId === action.workoutId ? null : state.activeWorkoutId,
      };

    case 'finishWorkout': {
      const id = state.activeWorkoutId;
      if (!id) return state;
      const finished = { ...updateWorkout(state, id, (w) => ({ ...w, endedAt: action.now })), activeWorkoutId: null };
      return tidy(finished, id);
    }

    case 'tidyWorkout':
      // The active workout keeps its empty exercises until it's finished.
      return action.workoutId === state.activeWorkoutId ? state : tidy(state, action.workoutId);

    case 'addExercise': {
      const typed = action.name.trim();
      if (!typed || !state.workouts.some((w) => w.id === action.workoutId)) return state;
      const name = state.exerciseNames.find((n) => sameName(n, typed)) ?? typed;
      const exerciseNames = [name, ...state.exerciseNames.filter((n) => !sameName(n, name))];
      return updateWorkout({ ...state, exerciseNames }, action.workoutId, (w) =>
        w.exercises.some((e) => sameName(e.name, name))
          ? w
          : { ...w, exercises: [...w.exercises, { id: action.id, name, sets: [] }] },
      );
    }

    case 'removeExercise':
      return updateWorkout(state, action.workoutId, (w) => ({
        ...w,
        exercises: w.exercises.filter((e) => e.id !== action.entryId),
      }));

    case 'addSet':
      return updateWorkout(state, action.workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((e) =>
          e.id === action.entryId
            ? { ...e, sets: [...e.sets, { id: action.id, reps: action.reps, weightKg: action.weightKg }] }
            : e,
        ),
      }));

    case 'removeSet':
      return updateWorkout(state, action.workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((e) =>
          e.id === action.entryId ? { ...e, sets: e.sets.filter((s) => s.id !== action.setId) } : e,
        ),
      }));

    case 'setUnit':
      return { ...state, unit: action.unit };
  }
}
