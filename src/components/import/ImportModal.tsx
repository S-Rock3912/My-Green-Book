import React, { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { loadYardageBookData } from '../../store/supabaseSync';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { Course } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface YardageBookCourse extends Course {
  holeCount: number;
  greenCount: number;
}

export const ImportModal: React.FC<Props> = ({ open, onClose }) => {
  const { user } = useAuth();
  const { courses: existingCourses, importCourseFromYardageBook } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ybCourses, setYbCourses] = useState<YardageBookCourse[]>([]);
  const [ybHoles, setYbHoles] = useState<any[]>([]);
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setError(null);

    loadYardageBookData(user.id).then((data) => {
      if (!data) {
        setError('Yardage Bookのデータが見つかりません');
        setLoading(false);
        return;
      }

      const coursesWithStats = data.courses.map((c) => {
        const courseHoles = data.holes.filter((h) => h.courseId === c.id);
        return {
          ...c,
          holeCount: courseHoles.length,
          greenCount: courseHoles.filter((h) => h.greenImageDataUrl).length,
        };
      });

      setYbCourses(coursesWithStats);
      setYbHoles(data.holes);
      setLoading(false);
    });
  }, [open, user]);

  const handleImport = (course: YardageBookCourse) => {
    const courseHoles = ybHoles
      .filter((h: any) => h.courseId === course.id)
      .sort((a: any, b: any) => a.number - b.number)
      .map((h: any) => ({
        number: h.number as number,
        greenImageDataUrl: h.greenImageDataUrl as string | null,
        greenDrawingShapes: h.greenDrawingShapes ?? [],
      }));

    importCourseFromYardageBook(course, courseHoles);
    setImported((prev) => new Set(prev).add(course.id));
  };

  const isAlreadyImported = (name: string) =>
    existingCourses.some((c) => c.name === name);

  if (!isSupabaseConfigured) {
    return (
      <Modal open={open} onClose={onClose} title="インポート">
        <div className="text-center py-6">
          <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Supabaseが設定されていないため、<br />インポート機能は利用できません
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Yardage Bookからインポート">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={28} className="animate-spin text-golf-green" />
          <span className="ml-2 text-sm text-gray-500">読み込み中...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertCircle size={40} className="mx-auto text-red-300 mb-3" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : ybCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Yardage Bookにコースがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">
            コースを選択してグリーン図をインポートします
          </p>
          {ybCourses.map((course) => {
            const done = imported.has(course.id) || isAlreadyImported(course.name);
            return (
              <div
                key={course.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-100 hover:border-golf-green'
                }`}
              >
                <div className="w-10 h-10 bg-golf-green rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-sm">{course.holeCount}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{course.name}</p>
                  <p className="text-xs text-gray-400">
                    {course.location ? `${course.location} · ` : ''}
                    グリーン図 {course.greenCount}/{course.holeCount}
                  </p>
                </div>
                {done ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
                    <CheckCircle size={14} />
                    インポート済み
                  </span>
                ) : (
                  <Button
                    size="sm"
                    icon={<Download size={12} />}
                    onClick={() => handleImport(course)}
                  >
                    取込
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
