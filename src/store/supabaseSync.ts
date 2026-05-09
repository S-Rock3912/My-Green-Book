import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Course, Hole } from '../types';

// ── Sync status ──────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'loading' | 'saving' | 'error';

let _status: SyncStatus = 'idle';
const _listeners = new Set<() => void>();

function setStatus(s: SyncStatus) {
  _status = s;
  _listeners.forEach((cb) => cb());
}

export function getSyncStatus(): SyncStatus {
  return _status;
}

export function useSyncStatus(): SyncStatus {
  const [status, setS] = useState<SyncStatus>(_status);
  useEffect(() => {
    const cb = () => setS(_status);
    _listeners.add(cb);
    return () => { _listeners.delete(cb); };
  }, []);
  return status;
}

// ── Data types ───────────────────────────────────────────────────────────────
interface AppData {
  courses: Course[];
  holes: Hole[];
}

// Green Book用のキーサフィックス (Yardage Bookとの競合防止)
const GREEN_BOOK_SUFFIX = ':green';

// ── Load ─────────────────────────────────────────────────────────────────────
export async function loadStateFromSupabase(userId: string): Promise<AppData | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  setStatus('loading');
  const { data, error } = await supabase
    .from('user_state')
    .select('state_json')
    .eq('user_id', userId + GREEN_BOOK_SUFFIX)
    .single();

  if (error || !data) {
    setStatus('idle');
    return null;
  }

  setStatus('idle');
  const state = data.state_json as AppData;
  return {
    courses: state.courses ?? [],
    holes: state.holes ?? [],
  };
}

// ── Save ─────────────────────────────────────────────────────────────────────
export async function saveStateToSupabase(
  userId: string,
  courses: Course[],
  holes: Hole[]
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  setStatus('saving');
  const { error } = await supabase.from('user_state').upsert(
    {
      user_id: userId + GREEN_BOOK_SUFFIX,
      state_json: { courses, holes },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  setStatus(error ? 'error' : 'idle');
}

// ── Debounced save ───────────────────────────────────────────────────────────
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSave(userId: string, courses: Course[], holes: Hole[]): void {
  if (saveTimer) clearTimeout(saveTimer);
  setStatus('saving');
  saveTimer = setTimeout(() => {
    saveStateToSupabase(userId, courses, holes);
  }, 1500);
}

// ── Yardage Book データ読み込み (インポート用) ─────────────────────────────────
interface YardageBookHole {
  id: string;
  courseId: string;
  number: number;
  greenImageDataUrl: string | null;
  greenDrawingShapes: unknown[];
  [key: string]: unknown; // Yardage Book固有のフィールドは無視
}

interface YardageBookData {
  courses: Course[];
  holes: YardageBookHole[];
}

export async function loadYardageBookData(userId: string): Promise<YardageBookData | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('user_state')
    .select('state_json')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  const state = data.state_json as YardageBookData;
  return {
    courses: state.courses ?? [],
    holes: state.holes ?? [],
  };
}
