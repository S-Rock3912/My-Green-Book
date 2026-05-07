import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import type { Course, Hole } from '../../types';

interface Props {
  course: Course;
  holes: Hole[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export const CourseCard: React.FC<Props> = ({ course, holes, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const greenCount = holes.filter((h) => h.greenImageDataUrl).length;

  const handleDelete = () => {
    if (confirm(`「${course.name}」を削除しますか？\nすべてのホール情報も削除されます。`)) {
      onDelete(course.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
        onClick={() => navigate(`/course/${course.id}`)}
      >
        <div className="w-12 h-12 bg-golf-green rounded-xl flex flex-col items-center justify-center shrink-0">
          <span className="text-white text-lg font-black leading-none">
            {holes.length}
          </span>
          <span className="text-golf-gold text-xs font-bold leading-none">H</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{course.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {course.location && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <MapPin size={10} />
                {course.location}
              </span>
            )}
            <span className="text-xs text-gray-400">
              グリーン図 {greenCount}/{holes.length}
            </span>
          </div>
        </div>

        <ChevronRight size={18} className="text-gray-400" />
      </button>

      {/* Hole chips */}
      {holes.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {holes.map((h) => (
            <button
              key={h.id}
              onClick={() => navigate(`/hole/${h.id}`)}
              className="px-2 py-0.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-700 hover:bg-golf-green hover:text-white transition-colors"
            >
              {h.number}H
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-100 px-3 py-1.5 flex justify-end gap-1">
        <button
          onClick={() => onEdit(course)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Edit2 size={12} /> 編集
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} /> 削除
        </button>
      </div>
    </div>
  );
};
