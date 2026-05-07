import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { CourseDetail } from './pages/CourseDetail';
import { HoleDetail } from './pages/HoleDetail';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { useStore } from './store/useStore';
import { loadStateFromSupabase, debouncedSave } from './store/supabaseSync';
import { isSupabaseConfigured } from './lib/supabase';

const SyncManager: React.FC<{ userId: string }> = ({ userId }) => {
  const loadFromSupabase = useStore((s) => s.loadFromSupabase);

  // ログイン時にSupabaseからデータを読み込む
  useEffect(() => {
    loadStateFromSupabase(userId).then((data) => {
      if (data) loadFromSupabase(data);
    });
  }, [userId, loadFromSupabase]);

  // 状態変化をSupabaseに同期
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      debouncedSave(userId, state.courses, state.holes);
    });
    return unsub;
  }, [userId]);

  return null;
};

export const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-golf-green flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Supabaseが未設定の場合は認証なしで動作（localStorageのみ）
  if (!isSupabaseConfigured) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/hole/:holeId" element={<HoleDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 未ログイン → ログイン画面
  if (!user) {
    return <Login />;
  }

  // ログイン済み → アプリ本体
  return (
    <BrowserRouter>
      <SyncManager userId={user.id} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/hole/:holeId" element={<HoleDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
