import type { DrawingShape } from '../types';

/** 矢印の描画 */
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  angle: number,
  size: number
) {
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size / 2);
  ctx.lineTo(-size, size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 1つのシェイプをキャンバスに描画する (正規化座標 → ピクセル変換) */
export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: DrawingShape,
  w: number,
  h: number
): void {
  ctx.save();
  ctx.globalAlpha = shape.opacity;
  ctx.strokeStyle = shape.color;
  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (shape.type === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = shape.lineWidth * 4;
    const pts = shape.points;
    if (pts.length > 0) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  ctx.globalCompositeOperation = 'source-over';

  switch (shape.type) {
    case 'pen': {
      const pts = shape.points;
      if (pts.length === 0) break;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0] * w, pts[i][1] * h);
      }
      ctx.stroke();
      break;
    }

    case 'line': {
      const [sx, sy] = [shape.start[0] * w, shape.start[1] * h];
      const [ex, ey] = [shape.end[0] * w, shape.end[1] * h];
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      const [sx, sy] = [shape.start[0] * w, shape.start[1] * h];
      const [ex, ey] = [shape.end[0] * w, shape.end[1] * h];
      const angle = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      drawArrowHead(ctx, ex, ey, angle, shape.lineWidth * 4 + 6);
      break;
    }

    case 'rect': {
      const [sx, sy] = [shape.start[0] * w, shape.start[1] * h];
      const [ex, ey] = [shape.end[0] * w, shape.end[1] * h];
      if (shape.filled) {
        ctx.fillRect(sx, sy, ex - sx, ey - sy);
      } else {
        ctx.strokeRect(sx, sy, ex - sx, ey - sy);
      }
      break;
    }

    case 'circle': {
      const [cx, cy] = [shape.center[0] * w, shape.center[1] * h];
      const rx = shape.radiusX * w;
      const ry = shape.radiusY * h;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
      if (shape.filled) ctx.fill();
      else ctx.stroke();
      break;
    }

    case 'text': {
      const [px, py] = [shape.position[0] * w, shape.position[1] * h];
      ctx.font = `bold ${shape.fontSize}px sans-serif`;
      ctx.fillText(shape.text, px, py);
      break;
    }
  }

  ctx.restore();
}

/**
 * 全シェイプを描画する (背景 + 描画レイヤー合成)
 * - 消しゴムは描画レイヤー上でdestination-outで動作させる
 */
export function renderAllShapes(
  mainCtx: CanvasRenderingContext2D,
  shapes: DrawingShape[],
  w: number,
  h: number,
  backgroundImg?: HTMLImageElement | null
): void {
  mainCtx.clearRect(0, 0, w, h);

  // 背景
  if (backgroundImg) {
    mainCtx.drawImage(backgroundImg, 0, 0, w, h);
  } else {
    mainCtx.fillStyle = '#e8f5e9';
    mainCtx.fillRect(0, 0, w, h);
  }

  // 描画レイヤー (消しゴムのためにoffscreenで合成)
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d')!;

  for (const shape of shapes) {
    renderShape(offCtx, shape, w, h);
  }

  mainCtx.drawImage(offscreen, 0, 0);
}

/** ファイル入力からData URLを読み込む */
export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** canvasをData URLにエクスポートする */
export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}
