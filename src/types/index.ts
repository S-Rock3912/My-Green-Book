// ── Point & Geometry ────────────────────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}

// ── Drawing ──────────────────────────────────────────────────────────────────
export type DrawingTool =
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rect'
  | 'circle'
  | 'text'
  | 'eraser'
  | 'none';

interface BaseShape {
  id: string;
  color: string;
  lineWidth: number;
  opacity: number;
}

export interface PenShape extends BaseShape {
  type: 'pen';
  points: [number, number][];
}

export interface EraserShape extends BaseShape {
  type: 'eraser';
  points: [number, number][];
}

export interface LineShape extends BaseShape {
  type: 'line';
  start: [number, number];
  end: [number, number];
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  start: [number, number];
  end: [number, number];
}

export interface RectShape extends BaseShape {
  type: 'rect';
  start: [number, number];
  end: [number, number];
  filled: boolean;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  center: [number, number];
  radiusX: number;
  radiusY: number;
  filled: boolean;
}

export interface TextShape extends BaseShape {
  type: 'text';
  position: [number, number];
  text: string;
  fontSize: number;
}

export type DrawingShape =
  | PenShape
  | EraserShape
  | LineShape
  | ArrowShape
  | RectShape
  | CircleShape
  | TextShape;

// ── Domain Models ─────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hole {
  id: string;
  courseId: string;
  number: number;
  greenImageDataUrl: string | null;
  greenDrawingShapes: DrawingShape[];
}
