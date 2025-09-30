import { Difficulty, type Puzzle, type Solution } from '../types';

// Utility to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Check if a number is valid in the given position
const isValid = (board: Puzzle, row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

// Backtracking solver to fill a board
const solveBoard = (board: Puzzle): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) {
              return true;
            }
            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
};

let solutionCount = 0;
// Count number of solutions for a given board
const countSolutions = (board: Puzzle): void => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9 && solutionCount < 2; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        countSolutions(board);
                        board[row][col] = 0; // Backtrack
                    }
                }
                return;
            }
        }
    }
    solutionCount++;
};

export const generateSudokuPuzzle = (difficulty: Difficulty): { puzzle: Puzzle; solution: Solution } => {
  // 1. Create a fully solved board
  const solution: Solution = Array(9).fill(null).map(() => Array(9).fill(0));
  solveBoard(solution);

  // 2. Create a copy to poke holes into
  const puzzle: Puzzle = solution.map(row => [...row]);

  // 3. Determine number of cells to remove based on difficulty
  const removals = {
    [Difficulty.Easy]: 38,
    [Difficulty.Medium]: 46,
    [Difficulty.Hard]: 52,
    [Difficulty.Extreme]: 56,
    [Difficulty.Insane]: 60,
  };
  const cellsToRemove = removals[difficulty] || 46;

  // 4. Create a shuffled list of cell coordinates
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < 81; i++) {
    cells.push({ row: Math.floor(i / 9), col: i % 9 });
  }
  shuffle(cells);
  
  // 5. Remove cells one by one, checking for unique solution
  let removedCount = 0;
  for (const cell of cells) {
    if (removedCount >= cellsToRemove) break;

    const { row, col } = cell;
    const temp = puzzle[row][col];
    if (temp === 0) continue;
    
    puzzle[row][col] = 0;
    
    const boardCopy = puzzle.map(r => [...r]);
    solutionCount = 0;
    countSolutions(boardCopy);

    if (solutionCount !== 1) {
      puzzle[row][col] = temp;
    } else {
      removedCount++;
    }
  }

  return { puzzle, solution };
};
