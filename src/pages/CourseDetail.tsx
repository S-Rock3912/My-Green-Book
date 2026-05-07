import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { getCourse, getCourseHoles, addHole, deleteHole } = useStore();

  const course = getCourse(courseId!);
  const holes = getCourseHoles(courseId!);

  if (!course) {
    return (
      <div className="flex flex-col h-dvh items-center justify-center">
        <p className="text-gray-500">コースが見つかりません</p>
        <Button className="mt-4" onClick={() => navigate('/')}>ホームへ</Button>
      </div>
    );
  }

  const handleAddHole = () => {
    const nextNum = holes.length + 1;
    if (nextNum > 18) return;
    const hole = addHole(course.id, nextNum);
    navigate(`/hole/${hole.id}`);
  };

  const handleDeleteHole = (id: string, num: number) => {
    if (confirm(`ホール ${num} を削除しますか？`)) {
      deleteHole(id);
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      <Header
        title={course.name}
        subtitle={course.location}
        back="/"
      />

      <main className="flex-1 overflow-y-auto pb-safe">
        {/* サマリー */}
        <div className="bg-golf-green text-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-golf-gold text-xs font-bold">HOLES</div>
              <div className="text-3xl font-black">{holes.length}</div>
            </div>
            <div className="text-center">
              <div className="text-golf-gold text-xs font-bold">グリーン図</div>
              <div className="text-3xl font-black">
                {holes.filter((h) => h.greenImageDataUrl).length}
              </div>
              <div className="text-green-300 text-xs">登録済み</div>
            </div>
          </div>
        </div>

        {/* ホールリスト */}
        <div className="px-4 py-4 space-y-2">
          {holes.map((hole) => (
            <button
              key={hole.id}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm
                         flex items-center px-4 py-3 hover:shadow-md active:scale-[0.98] transition-all text-left"
              onClick={() => navigate(`/hole/${hole.id}`)}
            >
              <div className="w-10 h-10 bg-golf-green rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm">{hole.number}</span>
              </div>

              <div className="ml-3 flex-1">
                <span className="text-sm font-bold text-gray-900">Hole {hole.number}</span>
              </div>

              <div className="ml-2 flex items-center gap-2">
                {hole.greenImageDataUrl && (
                  <span className="text-xs text-green-600 font-medium">✓ グリーン図</span>
                )}
              </div>

              <button
                className="ml-2 p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                onClick={(e) => { e.stopPropagation(); handleDeleteHole(hole.id, hole.number); }}
              >
                <Trash2 size={14} />
              </button>
            </button>
          ))}

          {holes.length < 18 && (
            <button
              onClick={handleAddHole}
              className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200
                         flex items-center justify-center gap-2 py-4 text-gray-500
                         hover:border-golf-green hover:text-golf-green hover:bg-green-50 transition-all"
            >
              <Plus size={18} />
              <span className="font-medium">ホール {holes.length + 1} を追加</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};
