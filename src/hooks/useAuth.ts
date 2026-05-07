import { useState, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // セッション変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export async function login(email: string, password: string): Promise<string | null> {
  if (!supabase) return 'Supabase が設定されていません';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

export async function signUp(email: string, password: string): Promise<string | null> {
  if (!supabase) return 'Supabase が設定されていません';
  const { error } = await supabase.auth.signUp({ email, password });
  return error?.message ?? null;
}

export async function logout(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
