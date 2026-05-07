import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GreenEditor } from '../components/green/GreenEditor';
import { useStore } from '../store/useStore';

export const HoleDetail: React.FC = () => {
  const { holeId } = useParams<{ holeId: string }>();
  const navigate = useNavigate();
  const {
    getHole, getCourse, getCourseHoles,
    updateGreenDrawing, updateGreenImage,
  } = useStore();

  const hole = getHole(holeId!);
  const course = hole ? getCourse(hole.courseId) : null;
  const courseHoles = course ? getCourseHoles(course.id) : [];

  if (!hole || !course) {
    return (
      <div className="flex flex-col h-dvh items-center justify-center">
        <p className="text-gray-500">ホールが見つかりません</p>
        <Button className="mt-4" onClick={() => navigate('/')}>ホームへ</Button>
      </div>
    );
  }

  const sortedHoles = courseHoles.sort((a, b) => a.number - b.number);
  const currentIdx = sortedHoles.findIndex((h) => h.id === hole.id);
  const prevHole = currentIdx > 0 ? sortedHoles[currentIdx - 1] : null;
  const nextHole = currentIdx < sortedHoles.length - 1 ? sortedHoles[currentIdx + 1] : null;

  return (
    <div className="flex flex-col h-dvh bg-gray-50 overflow-hidden">
      {/* ヘッダー */}
      <header className="bg-golf-green text-white px-3 pt-safe-top pb-2 flex items-center gap-2 shadow-lg">
        <button
          onClick={() => navigate(`/course/${course.id}`)}
          className="p-1.5 -ml-1 rounded-xl hover:bg-white/10 transition-colors shrink-0"
          aria-label="戻る"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold leading-tight">Hole {hole.number}</span>
            <span className="text-green-400 text-xs">·</span>
            <span className="text-xs text-green-200 truncate leading-tight">{course.name}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-green-100">
            <span className="font-bold text-golf-gold">グリーン図</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {prevHole && (
            <button
              onClick={() => navigate(`/hole/${prevHole.id}`)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {nextHole && (
            <button
              onClick={() => navigate(`/hole/${nextHole.id}`)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </header>

      {/* グリーンエディタ */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <GreenEditor
          imageDataUrl={hole.greenImageDataUrl}
          shapes={hole.greenDrawingShapes}
          onImageChange={(url) => updateGreenImage(hole.id, url)}
          onShapesChange={(s) => updateGreenDrawing(hole.id, s)}
        />
      </div>

      {/* ナビゲーション (下部) */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between safe-bottom">
        <button
          onClick={() => prevHole && navigate(`/hole/${prevHole.id}`)}
          disabled={!prevHole}
          className="flex items-center gap-1 text-sm font-medium text-golf-green disabled:text-gray-300 transition-colors"
        >
          <ChevronLeft size={18} />
          {prevHole ? `Hole ${prevHole.number}` : 'なし'}
        </button>

        <span className="text-xs text-gray-400 font-medium">
          {currentIdx + 1} / {sortedHoles.length}
        </span>

        <button
          onClick={() => nextHole && navigate(`/hole/${nextHole.id}`)}
          disabled={!nextHole}
          className="flex items-center gap-1 text-sm font-medium text-golf-green disabled:text-gray-300 transition-colors"
        >
          {nextHole ? `Hole ${nextHole.number}` : 'なし'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
