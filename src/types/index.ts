export interface ConeColor {
  id: string;
  name: string;
  color: string;
}

export interface ExerciseSettings {
  duration: number; // in seconds
  interval: number; // in seconds between color calls
  cones: ConeColor[];
}

export interface CompletedExercise {
  id: string;
  date: Date;
  duration: number;
  interval: number;
  conesCount: number;
  colorSequence: string[]; // names of colors called
}

export type Screen = 'settings' | 'exercise' | 'history';
