import React, { useState } from 'react';
import { Plus, Book, Cloud, CloudOff, Loader2, LogOut, Download } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { CourseCard } from '../components/course/CourseCard';
import { CourseFormModal } from '../components/course/CourseFormModal';
import { ImportModal } from '../components/import/ImportModal';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import { useSyncStatus } from '../store/supabaseSync';
import { isSupabaseConfigured } from '../lib/supabase';
import { logout, useAuth } from '../hooks/useAuth';
import type { Course } from '../types';

// ── Sync status badge ────────────────────────────────────────────────────────
const SyncBadge: React.FC = () => {
  const status = useSyncStatus();

  if (!isSupabaseConfigured) return null;

  if (status === 'loading' || status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-200">
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">同期中</span>
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-300">
        <CloudOff size={14} />
        <span className="hidden sm:inline">エラー</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-green-300">
      <Cloud size={14} />
      <span className="hidden sm:inline">同期済み</span>
    </span>
  );
};

// ── Logout button ────────────────────────────────────────────────────────────
const LogoutButton: React.FC = () => {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);

  if (!isSupabaseConfigured || !user) return null;

  if (confirming) {
    return (
      <button
        onClick={async () => { await logout(); }}
        className="text-xs text-red-300 hover:text-red-200 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        ログアウト
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      onBlur={() => setConfirming(false)}
      className="p-2 rounded-xl hover:bg-white/10 transition-colors text-green-200 hover:text-white"
      title={user.email}
      aria-label="ログアウト"
    >
      <LogOut size={17} />
    </button>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, getCourseHoles } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);

  const handleEdit = (course: Course) => {
    setEditTarget(course);
    setModalOpen(true);
  };

  const handleSave = (data: Pick<Course, 'name' | 'location'>) => {
    if (editTarget) {
      updateCourse(editTarget.id, data);
    } else {
      addCourse(data);
    }
    setEditTarget(null);
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      <Header
        title="My Green Book"
        actions={
          <>
            <SyncBadge />
            {isSupabaseConfigured && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Download size={14} />}
                onClick={() => setImportOpen(true)}
              >
                インポート
              </Button>
            )}
            <Button
              size="sm"
              variant="gold"
              icon={<Plus size={15} />}
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
            >
              コース追加
            </Button>
            <LogoutButton />
          </>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {courses.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              holes={getCourseHoles(course.id)}
              onEdit={handleEdit}
              onDelete={deleteCourse}
            />
          ))
        )}
      </main>

      <CourseFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
};

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
    <div className="w-20 h-20 bg-golf-green/10 rounded-full flex items-center justify-center mb-4">
      <Book size={36} className="text-golf-green" />
    </div>
    <h2 className="text-lg font-bold text-gray-800 mb-1">コースがありません</h2>
    <p className="text-sm text-gray-500 mb-6">
      「コース追加」からゴルフコースを登録して<br />グリーン図を作成しましょう
    </p>
    <Button icon={<Plus size={16} />} onClick={onAdd}>
      最初のコースを追加
    </Button>
  </div>
);
