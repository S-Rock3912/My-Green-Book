import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Course,
  Hole,
  DrawingShape,
} from '../types';

interface AppState {
  courses: Course[];
  holes: Hole[];

  addCourse: (data: Pick<Course, 'name' | 'location'>) => Course;
  updateCourse: (id: string, data: Partial<Pick<Course, 'name' | 'location'>>) => void;
  deleteCourse: (id: string) => void;

  addHole: (courseId: string, number: number) => Hole;
  updateHole: (id: string, data: Partial<Hole>) => void;
  deleteHole: (id: string) => void;

  updateGreenDrawing: (id: string, shapes: DrawingShape[]) => void;
  updateGreenImage: (id: string, dataUrl: string | null) => void;

  loadFromSupabase: (data: { courses: Course[]; holes: Hole[] }) => void;

  getCourse: (id: string) => Course | undefined;
  getCourseHoles: (courseId: string) => Hole[];
  getHole: (id: string) => Hole | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      courses: [],
      holes: [],

      addCourse: (data) => {
        const now = new Date().toISOString();
        const course: Course = {
          id: uuidv4(),
          name: data.name,
          location: data.location,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ courses: [...s.courses, course] }));
        return course;
      },

      updateCourse: (id, data) =>
        set((s) => ({
          courses: s.courses.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
          holes: s.holes.filter((h) => h.courseId !== id),
        })),

      addHole: (courseId, number) => {
        const hole: Hole = {
          id: uuidv4(),
          courseId,
          number,
          greenImageDataUrl: null,
          greenDrawingShapes: [],
        };
        set((s) => ({ holes: [...s.holes, hole] }));
        return hole;
      },

      updateHole: (id, data) =>
        set((s) => ({
          holes: s.holes.map((h) => (h.id === id ? { ...h, ...data } : h)),
        })),

      deleteHole: (id) =>
        set((s) => ({ holes: s.holes.filter((h) => h.id !== id) })),

      updateGreenDrawing: (id, shapes) =>
        set((s) => ({
          holes: s.holes.map((h) => (h.id === id ? { ...h, greenDrawingShapes: shapes } : h)),
        })),

      updateGreenImage: (id, dataUrl) =>
        set((s) => ({
          holes: s.holes.map((h) => (h.id === id ? { ...h, greenImageDataUrl: dataUrl } : h)),
        })),

      loadFromSupabase: (data) =>
        set({ courses: data.courses, holes: data.holes }),

      getCourse: (id) => get().courses.find((c) => c.id === id),

      getCourseHoles: (courseId) =>
        get()
          .holes.filter((h) => h.courseId === courseId)
          .sort((a, b) => a.number - b.number),

      getHole: (id) => get().holes.find((h) => h.id === id),
    }),
    {
      name: 'green-book-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
