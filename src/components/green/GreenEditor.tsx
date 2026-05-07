import React, { useRef, useState, useEffect } from 'react';
import { DrawingCanvas, type DrawingCanvasHandle } from '../canvas/DrawingCanvas';
import { CanvasToolbar } from '../canvas/CanvasToolbar';
import type { DrawingShape, DrawingTool } from '../../types';
import { readImageFile } from '../../lib/canvas';

interface GreenEditorProps {
  imageDataUrl: string | null;
  shapes: DrawingShape[];
  onImageChange: (url: string | null) => void;
  onShapesChange: (shapes: DrawingShape[]) => void;
}

export const GreenEditor: React.FC<GreenEditorProps> = ({
  imageDataUrl,
  shapes,
  onImageChange,
  onShapesChange,
}) => {
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [color, setColor] = useState('#22c55e');
  const [lineWidth, setLineWidth] = useState(3);
  const [filled, setFilled] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [imgAspect, setImgAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!imageDataUrl) { setImgAspect(null); return; }
    const img = new Image();
    img.onload = () => setImgAspect(img.naturalHeight / img.naturalWidth);
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col" style={imgAspect ? { aspectRatio: `1 / ${imgAspect}` } : { height: 260 }}>
        <div className="relative flex-1 rounded-xl overflow-hidden bg-green-50">
          <DrawingCanvas
            ref={canvasRef}
            backgroundDataUrl={imageDataUrl}
            shapes={shapes}
            onShapesChange={onShapesChange}
            onBackgroundChange={onImageChange}
            activeTool={activeTool}
            color={color}
            lineWidth={lineWidth}
            opacity={1}
            filled={filled}
            fontSize={fontSize}
            className="absolute inset-0"
          />
        </div>

        <CanvasToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={color}
          onColorChange={setColor}
          lineWidth={lineWidth}
          onLineWidthChange={setLineWidth}
          filled={filled}
          onFilledChange={setFilled}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onUndo={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))}
          onRedo={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }))}
          onClear={() => canvasRef.current?.clear()}
          onImageUpload={async (f) => {
            const url = await readImageFile(f);
            onImageChange(url);
          }}
        />
      </div>
    </div>
  );
};
