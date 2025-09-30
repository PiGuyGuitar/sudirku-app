
import type { Board, Puzzle, Solution } from '../types';

/**
 * Checks if a number is valid in a given row.
 */
const isValidInRow = (board: Board, row: number, num: number): boolean => {
  let count = 0;
  for (let col = 0; col < 9; col++) {
    if (board[row][col] === num) {
      count++;
    }
  }
  return count === 1;
};

/**
 * Checks if a number is valid in a given column.
 */
const isValidInCol = (board: Board, col: number, num: number): boolean => {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    if (board[row][col] === num) {
      count++;
    }
  }
  return count === 1;
};

/**
 * Checks if a number is valid in its 3x3 subgrid.
 */
const isValidInBox = (board: Board, startRow: number, startCol: number, num: number): boolean => {
  let count = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row + startRow][col + startCol] === num) {
        count++;
      }
    }
  }
  return count === 1;
};

/**
 * Finds all cells with invalid numbers and returns a boolean grid.
 */
export const findErrors = (board: Board, puzzle: Puzzle): boolean[][] => {
  const errors: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Only check user-entered numbers
      if (puzzle[row][col] === 0 && board[row][col] !== null) {
        const num = board[row][col] as number;
        const tempBoard = board.map(r => [...r]);

        // Temporarily clear the cell to check for duplicates elsewhere
        tempBoard[row][col] = null; 

        let hasError = false;
        // Check row for duplicates
        if (tempBoard[row].includes(num)) hasError = true;
        // Check column for duplicates
        if (tempBoard.some(r => r[col] === num)) hasError = true;
        // Check 3x3 box for duplicates
        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if(tempBoard[r + startRow][c + startCol] === num) hasError = true;
            }
        }
        
        if (hasError) {
          errors[row][col] = true;
        }
      }
    }
  }
  return errors;
};


/**
 * Checks if the board is fully and correctly solved.
 */
export const isBoardSolved = (board: Board, solution: Solution): boolean => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null || board[i][j] !== solution[i][j]) {
        return false;
      }
    }
  }
  return true;
};
