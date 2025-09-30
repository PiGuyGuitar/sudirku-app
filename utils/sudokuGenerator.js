const Difficulty = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
  Extreme: 'Extreme',
  Insane: 'Insane',
};

// Utility to shuffle an array using Fisher-Yates algorithm
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Check if placing a number is valid in the given position
const isValid = (board, row, col, num) => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

// Backtracking solver to fill a board completely
const solveBoard = (board) => {
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

// Backtracking function to count the number of solutions for a given board.
// Returns 0, 1, or 2 (representing "2 or more").
const countSolutions = (board) => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let count = 0;
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        count += countSolutions(board);
                        board[row][col] = 0; // Backtrack
                        if (count >= 2) return 2; // Optimization: stop if we find more than one solution
                    }
                }
                return count;
            }
        }
    }
    return 1; // A full board is considered one solution
};


export const generateSudokuPuzzle = (difficulty) => {
  // 1. Create a fully solved board
  const solution = Array(9).fill(null).map(() => Array(9).fill(0));
  solveBoard(solution);

  // 2. Create a copy to remove cells from
  const puzzle = solution.map(row => [...row]);

  // 3. Determine number of cells to remove based on difficulty
  const removals = {
    [Difficulty.Easy]: 38,
    [Difficulty.Medium]: 46,
    [Difficulty.Hard]: 52,
    [Difficulty.Extreme]: 56,
    [Difficulty.Insane]: 60,
  };
  const cellsToRemove = removals[difficulty] || 46;

  // 4. Create a shuffled list of all 81 cell coordinates
  const cells = [];
  for (let i = 0; i < 81; i++) {
    cells.push({ row: Math.floor(i / 9), col: i % 9 });
  }
  shuffle(cells);
  
  // 5. Remove cells one by one, ensuring the puzzle remains unique
  let removedCount = 0;
  for (const cell of cells) {
    if (removedCount >= cellsToRemove) break;

    const { row, col } = cell;
    const originalValue = puzzle[row][col];
    
    puzzle[row][col] = 0; // Remove the number
    
    const boardCopy = puzzle.map(r => [...r]);
    const solutionCount = countSolutions(boardCopy);

    // If removing the cell makes the solution non-unique, put it back
    if (solutionCount !== 1) {
      puzzle[row][col] = originalValue;
    } else {
      removedCount++;
    }
  }

  return { puzzle, solution };
};