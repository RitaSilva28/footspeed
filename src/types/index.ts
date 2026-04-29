export interface ConeColor {
  id: string;
  name: string;
  color: string;
}

export interface ExerciseSettings {
  duration: number;
  interval: number;
  cones: ConeColor[];
}

export interface CalledColor {
  name: string;
  color: string;
}

export interface CompletedExercise {
  id: string;
  date: Date;
  duration: number;
  interval: number;
  conesCount: number;
  colorSequence: CalledColor[];
}

export type Screen = "settings" | "exercise" | "history";