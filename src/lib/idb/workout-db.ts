import Dexie, { type Table } from 'dexie';
import type { ActiveWorkoutState } from '@/types/workout';

export interface SyncQueueItem {
  id?: number;
  action: 'SAVE_WORKOUT_SESSION' | 'CREATE_ROUTINE' | 'UPDATE_PR';
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  synced: number; // 0 for false, 1 for true for indexing
}

export interface CachedRoutine {
  id: string;
  name: string;
  methodology: string;
  daysCount: number;
  rawData: string; // JSON serialized
  cachedAt: number;
}

export class GymFlowDatabase extends Dexie {
  activeWorkouts!: Table<ActiveWorkoutState, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  cachedRoutines!: Table<CachedRoutine, string>;

  constructor() {
    super('GymFlowOfflineDB');
    this.version(1).stores({
      activeWorkouts: 'sessionId, startedAt',
      syncQueue: '++id, action, createdAt, synced',
      cachedRoutines: 'id, name, cachedAt',
    });
  }
}

export const db = new GymFlowDatabase();
