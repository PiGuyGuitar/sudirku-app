// Fix: Added full content for types.ts to define data structures for the application.
export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Extreme = 'Extreme',
  Insane = 'Insane',
}

export type CellValue = number | null;
export type Board = CellValue[][];
export type Puzzle = number[][]; // 0 for empty cells
export type Solution = number[][];

export interface Cell {
  row: number;
  col: number;
}
