import React, { useState } from 'react';
import {
  Pen,
  Minus,
  MoveRight,
  Square,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Image,
  ChevronUp,
  Pencil,
} from 'lucide-react';
import type { DrawingTool } from '../../types';

interface CanvasToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (w: number) => void;
  filled: boolean;
  onFilledChange: (f: boolean) => void;
  fontSize: number;
  onFontSizeChange: (s: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onImageUpload: (file: File) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // マーカーモード
  markerMode?: string | null;
  onMarkerMode?: (mode: string | null) => void;
  markerButtons?: { mode: string; label: string; icon: React.ReactNode; active: boolean }[];
}

const QUICK_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#000000', '#ffffff',
];

const EXTRA_COLORS = ['#ec4899', '#64748b', '#7c3aed', '#0891b2', '#15803d', '#dc2626'];

const TOOLS: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { id: 'pen',    icon: <Pen size={16} />,       label: 'ペン' },
  { id: 'line',   icon: <Minus size={16} />,     label: '直線' },
  { id: 'arrow',  icon: <MoveRight size={16} />, label: '矢印' },
  { id: 'rect',   icon: <Square size={16} />,    label: '四角' },
  { id: 'circle', icon: <Circle size={16} />,    label: '円' },
  { id: 'text',   icon: <Type size={16} />,      label: 'テキスト' },
  { id: 'eraser', icon: <Eraser size={16} />,    label: '消しゴム' },
];

const LINE_WIDTHS = [2, 4, 6, 10];
const FONT_SIZES = [12, 16, 20, 28];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  filled,
  onFilledChange,
  fontSize,
  onFontSizeChange,
  onUndo,
  onRedo,
  onClear,
  onImageUpload,
  markerButtons,
  onMarkerMode,
}) => {
  const [showTools, setShowTools] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onImageUpload(f);
    e.target.value = '';
  };

  // 現在のアクティブツール情報
  const activeMeta = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="bg-white border-t border-gray-200 px-1 py-1.5 safe-bottom">

      {/* ─── 描画ツールパネル（展開時） ─── */}
      {showTools && (
        <div className="flex items-center gap-0.5 pb-1.5 mb-1 border-b border-gray-100 overflow-x-auto scrollbar-hide"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onToolChange(activeTool === t.id ? 'none' : t.id);
                if (activeTool !== t.id) setShowTools(false); // ツール選択で閉じる
              }}
              title={t.label}
              className={`
                flex items-center gap-1 px-2.5 py-1.5 shrink-0 rounded-lg text-xs font-medium transition-all
                ${activeTool === t.id
                  ? 'bg-golf-green text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Row 1: メインバー（常時表示） ─── */}
      <div className="flex items-center gap-0.5">

        {/* 描画ツール トグルボタン */}
        <button
          onClick={() => setShowTools(!showTools)}
          className={`
            flex items-center gap-1 px-2 py-1.5 shrink-0 rounded-lg text-xs font-medium transition-all
            ${showTools
              ? 'bg-golf-green text-white shadow-sm'
              : activeMeta
                ? 'bg-gray-100 text-golf-green ring-1 ring-golf-green'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          title="描画ツールを開く"
        >
          {activeMeta ? (
            <>
              {activeMeta.icon}
              <span>{activeMeta.label}</span>
            </>
          ) : (
            <>
              <Pencil size={14} />
              <span>描画</span>
            </>
          )}
          <ChevronUp
            size={11}
            className={`transition-transform ${showTools ? '' : 'rotate-180'}`}
          />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

        {/* カラーパレット */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-6 h-6 shrink-0 rounded-full border-2 transition-transform ${
                color === c ? 'border-golf-green scale-125' : 'border-gray-200 shadow-sm hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          {/* カスタム色（選択中の場合のみ表示） */}
          {!QUICK_COLORS.includes(color) && (
            <div
              className="w-6 h-6 shrink-0 rounded-full border-2 border-golf-green scale-125 shadow"
              style={{ backgroundColor: color }}
            />
          )}
          {/* カスタムカラーピッカー */}
          <label
            className="w-6 h-6 shrink-0 rounded-full border border-gray-300 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-br from-red-400 via-green-400 to-blue-500"
            title="カスタム色"
          >
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="opacity-0 w-1 h-1 absolute"
            />
          </label>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

        {/* オプション展開ボタン */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`px-2 py-1 shrink-0 rounded-lg text-xs transition-all ${
            showOptions ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="線幅・サイズ設定"
        >
          {lineWidth}px
        </button>

        <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />

        {/* Undo / Redo / Clear */}
        <button onClick={onUndo} className="p-2 shrink-0 rounded-lg text-gray-600 hover:bg-gray-100" title="元に戻す">
          <Undo2 size={15} />
        </button>
        <button onClick={onRedo} className="p-2 shrink-0 rounded-lg text-gray-600 hover:bg-gray-100" title="やり直し">
          <Redo2 size={15} />
        </button>
        <button onClick={onClear} className="p-2 shrink-0 rounded-lg text-red-500 hover:bg-red-50" title="全消去">
          <Trash2 size={15} />
        </button>

        {/* 画像アップロード */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 shrink-0 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200"
          title="コース図を読み込む"
        >
          <Image size={15} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* ─── Row 2: オプション（展開時） ─── */}
      {showOptions && (
        <div className="mt-1 pt-2 border-t border-gray-100 space-y-2">
          {/* 追加カラー */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 w-8">追加色</span>
            {EXTRA_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-golf-green scale-125' : 'border-white shadow-sm hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* 線幅 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8">線幅</span>
            <div className="flex gap-1">
              {LINE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => onLineWidthChange(w)}
                  className={`px-2 py-1 rounded text-xs ${
                    lineWidth === w ? 'bg-golf-green text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1 text-xs text-gray-600 ml-2">
              <input
                type="checkbox"
                checked={filled}
                onChange={(e) => onFilledChange(e.target.checked)}
                className="rounded"
              />
              塗り
            </label>
          </div>

          {/* フォントサイズ（テキストツール時） */}
          {activeTool === 'text' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">文字</span>
              <div className="flex gap-1">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => onFontSizeChange(s)}
                    className={`px-2 py-1 rounded text-xs ${
                      fontSize === s ? 'bg-golf-green text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── マーカーボタン（常時表示） ─── */}
      {markerButtons && markerButtons.length > 0 && (
        <div className="flex items-center gap-1 mt-1 pt-1 border-t border-gray-100 overflow-x-auto scrollbar-hide"
             style={{ WebkitOverflowScrolling: 'touch' }}>
          <span className="text-xs text-gray-400 shrink-0 mr-0.5">📍</span>
          {markerButtons.map((mb) => (
            <button
              key={mb.mode}
              onClick={() => onMarkerMode?.(mb.active ? null : mb.mode)}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all shrink-0
                ${mb.active
                  ? 'bg-golf-gold text-golf-green-dark ring-2 ring-golf-gold ring-offset-1'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {mb.icon}
              {mb.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
