import Storage from 'expo-sqlite/kv-store';
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

import { initialState, reducer, type Action } from './reducer';
import type { AppState } from './types';

const STORAGE_KEY = 'peachy:state';

function loadState(): AppState {
  try {
    const raw = Storage.getItemSync(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...(JSON.parse(raw) as AppState) };
  } catch {
    return initialState;
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

type Store = {
  state: AppState;
  dispatch: (action: Action) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const store = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export function useActiveWorkout() {
  const { state } = useStore();
  return state.workouts.find((w) => w.id === state.activeWorkoutId) ?? null;
}
