import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { DrawingShape, DrawingTool } from '../../types';
import { renderAllShapes, renderShape, readImageFile } from '../../lib/canvas';

// ── Public API ────────────────────────────────────────────────────────────────
export interface DrawingCanvasHandle {
  exportDataUrl: () => string;
  clear: () => void;
}

export interface DrawingCanvasProps {
  backgroundDataUrl?: string | null;
  shapes: DrawingShape[];
  onShapesChange: (shapes: DrawingShape[]) => void;
  onBackgroundChange?: (dataUrl: string | null) => void;
  activeTool: DrawingTool;
  color: string;
  lineWidth: number;
  opacity?: number;
  filled?: boolean;
  fontSize?: number;
  /** 上に重ねるReactノード（マーカーなど） */
  overlay?: React.ReactNode;
  onOverlayPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
  readOnly?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  (
    {
      backgroundDataUrl,
      shapes,
      onShapesChange,
      onBackgroundChange,
      activeTool,
      color,
      lineWidth,
      opacity = 1,
      filled = false,
      fontSize = 16,
      overlay,
      onOverlayPointerDown,
      className = '',
      readOnly = false,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);

    // 進行中シェイプ
    const isDrawingRef = useRef(false);
    const currentShapeRef = useRef<DrawingShape | null>(null);
    const startPosRef = useRef<[number, number]>([0, 0]);

    // テキスト入力UI
    const [textInput, setTextInput] = useState<{
      x: number; y: number; relX: number; relY: number;
    } | null>(null);
    const [textValue, setTextValue] = useState('');
    const textInputRef = useRef<HTMLInputElement>(null);

    // Undo/Redo スタック
    const undoStackRef = useRef<DrawingShape[][]>([]);
    const redoStackRef = useRef<DrawingShape[][]>([]);

    // 常に最新の shapes を参照できる ref（ResizeObserver などのコールバックで使用）
    const shapesRef = useRef<DrawingShape[]>(shapes);
    useEffect(() => { shapesRef.current = shapes; });

    // ── 再描画 ──
    const redraw = useCallback(
      (currentShapes: DrawingShape[], preview?: DrawingShape) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const { width: w, height: h } = canvas;

        renderAllShapes(ctx, currentShapes, w, h, bgImageRef.current);

        // プレビュー(描画中)
        if (preview) {
          const offscreen = document.createElement('canvas');
          offscreen.width = w;
          offscreen.height = h;
          const oCtx = offscreen.getContext('2d')!;
          renderShape(oCtx, preview, w, h);
          ctx.drawImage(offscreen, 0, 0);
        }
      },
      []
    );

    // ── 背景画像ロード ──
    useEffect(() => {
      if (!backgroundDataUrl) {
        bgImageRef.current = null;
        redraw(shapesRef.current);
        return;
      }
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        redraw(shapesRef.current);
      };
      img.src = backgroundDataUrl;
    }, [backgroundDataUrl, redraw]);

    useEffect(() => {
      redraw(shapes);
    }, [shapes, redraw]);

    // ── ResizeObserver でキャンバスサイズをコンテナに合わせる ──
    // shapes に依存させず、ref 経由で最新値を参照する（shapes 変更ごとの再生成を防ぐ）
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const ro = new ResizeObserver(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        canvas.width = w;
        canvas.height = h;
        redraw(shapesRef.current);
      });
      ro.observe(container);
      return () => ro.disconnect();
    }, [redraw]);

    // ── 座標変換 ──
    const toRelative = (clientX: number, clientY: number): [number, number] => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return [
        (clientX - rect.left) / rect.width,
        (clientY - rect.top) / rect.height,
      ];
    };

    // ── ポインターイベント ──
    const getPos = (e: React.PointerEvent | React.TouchEvent): [number, number] => {
      if ('touches' in e) {
        const t = e.touches[0];
        return toRelative(t.clientX, t.clientY);
      }
      return toRelative((e as React.PointerEvent).clientX, (e as React.PointerEvent).clientY);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (readOnly || activeTool === 'none') return;
      e.currentTarget.setPointerCapture(e.pointerId);

      // テキストツール: クリック位置にインプットを表示
      if (activeTool === 'text') {
        const [rx, ry] = toRelative(e.clientX, e.clientY);
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        setTextInput({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          relX: rx,
          relY: ry,
        });
        setTextValue('');
        setTimeout(() => textInputRef.current?.focus(), 0);
        return;
      }

      isDrawingRef.current = true;
      const pos = getPos(e);
      startPosRef.current = pos;

      const base = {
        id: uuidv4(),
        color,
        lineWidth,
        opacity,
      };

      if (activeTool === 'pen' || activeTool === 'eraser') {
        currentShapeRef.current = {
          ...base,
          type: activeTool,
          points: [pos],
        } as DrawingShape;
      } else if (activeTool === 'line') {
        currentShapeRef.current = {
          ...base,
          type: 'line',
          start: pos,
          end: pos,
        };
      } else if (activeTool === 'arrow') {
        currentShapeRef.current = {
          ...base,
          type: 'arrow',
          start: pos,
          end: pos,
        };
      } else if (activeTool === 'rect') {
        currentShapeRef.current = {
          ...base,
          type: 'rect',
          start: pos,
          end: pos,
          filled,
        };
      } else if (activeTool === 'circle') {
        currentShapeRef.current = {
          ...base,
          type: 'circle',
          center: pos,
          radiusX: 0,
          radiusY: 0,
          filled,
        };
      }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !currentShapeRef.current) return;
      const pos = getPos(e);

      const s = currentShapeRef.current;
      if (s.type === 'pen' || s.type === 'eraser') {
        (s as { points: [number, number][] }).points.push(pos);
      } else if (s.type === 'line' || s.type === 'arrow') {
        (s as { end: [number, number] }).end = pos;
      } else if (s.type === 'rect') {
        (s as { end: [number, number] }).end = pos;
      } else if (s.type === 'circle') {
        const [sx, sy] = startPosRef.current;
        const [ex, ey] = pos;
        (s as { radiusX: number; radiusY: number }).radiusX = (ex - sx) / 2;
        (s as { radiusX: number; radiusY: number }).radiusY = (ey - sy) / 2;
        (s as { center: [number, number] }).center = [(sx + ex) / 2, (sy + ey) / 2];
      }

      redraw(shapes, currentShapeRef.current);
    };

    const handlePointerUp = () => {
      if (!isDrawingRef.current || !currentShapeRef.current) return;
      isDrawingRef.current = false;

      // Undo スタックに現在の状態をプッシュ
      undoStackRef.current.push([...shapes]);
      redoStackRef.current = [];

      const newShapes = [...shapes, currentShapeRef.current];
      currentShapeRef.current = null;
      onShapesChange(newShapes);
    };

    // ── テキスト確定 ──
    const commitText = () => {
      if (textInput && textValue.trim()) {
        const shape: DrawingShape = {
          id: uuidv4(),
          type: 'text',
          color,
          lineWidth,
          opacity,
          position: [textInput.relX, textInput.relY],
          text: textValue.trim(),
          fontSize,
        };
        undoStackRef.current.push([...shapes]);
        redoStackRef.current = [];
        onShapesChange([...shapes, shape]);
      }
      setTextInput(null);
      setTextValue('');
    };

    // ── Undo / Redo (キーボード) ──
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          const prev = undoStackRef.current.pop();
          if (prev !== undefined) {
            redoStackRef.current.push([...shapes]);
            onShapesChange(prev);
          }
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          const next = redoStackRef.current.pop();
          if (next !== undefined) {
            undoStackRef.current.push([...shapes]);
            onShapesChange(next);
          }
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }, [shapes, onShapesChange]);

    // ── 画像貼り付け ──
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const dataUrl = await readImageFile(file);
      onBackgroundChange?.(dataUrl);
    };

    // ── 公開メソッド ──
    useImperativeHandle(ref, () => ({
      exportDataUrl: () => {
        const canvas = canvasRef.current!;
        // マーカーを含む最終画像用にそのまま返す
        return canvas.toDataURL('image/png');
      },
      clear: () => {
        undoStackRef.current.push([...shapes]);
        redoStackRef.current = [];
        onShapesChange([]);
      },
    }));

    const cursor =
      activeTool === 'pen'
        ? 'cursor-crosshair'
        : activeTool === 'eraser'
        ? 'cursor-cell'
        : activeTool === 'text'
        ? 'cursor-text'
        : activeTool === 'none'
        ? 'cursor-default'
        : 'cursor-crosshair';

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden rounded-xl ${className}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* メインキャンバス */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full touch-none ${cursor}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* マーカーなどのオーバーレイ */}
        {overlay && (
          <div
            className="absolute inset-0 pointer-events-none"
            onPointerDown={onOverlayPointerDown}
          >
            {overlay}
          </div>
        )}

        {/* テキスト入力UI */}
        {textInput && (
          <input
            ref={textInputRef}
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitText();
              if (e.key === 'Escape') { setTextInput(null); setTextValue(''); }
            }}
            className="absolute z-20 bg-white/80 border border-golf-green rounded px-1 py-0.5
                       text-sm outline-none min-w-[80px] pointer-events-auto"
            style={{
              left: textInput.x,
              top: textInput.y - 12,
              fontSize: `${fontSize}px`,
              color,
            }}
            placeholder="テキスト入力…"
          />
        )}

        {/* 背景なし時のヒント */}
        {!backgroundDataUrl && shapes.length === 0 && !readOnly && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <p className="text-golf-green/40 text-sm font-medium text-center px-4">
              画像をドラッグ&ドロップ<br />または上のボタンから読み込み
            </p>
          </div>
        )}
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';
