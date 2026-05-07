import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flag } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  back?: string | boolean; // URL string or true (= go back)
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, back, actions }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-golf-green text-white px-4 pt-safe-top pb-3 flex items-center gap-3 shadow-lg">
      {back && (
        <button
          onClick={() =>
            typeof back === 'string' ? navigate(back) : navigate(-1)
          }
          className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="戻る"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!back && <Flag size={18} className="text-golf-gold shrink-0" />}
          <h1 className="text-base font-bold truncate">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-xs text-green-200 truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
};
