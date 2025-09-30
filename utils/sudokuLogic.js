/**
 * Finds all cells that violate Sudoku rules (duplicates in a row, column, or 3x3 box).
 * @param {Array<Array<number|null>>} board The current state of the game board.
 * @returns {Array<Array<boolean>>} A 9x9 boolean grid where `true` indicates a cell with an error.
 */
export const findErrors = (board) => {
  const errors = Array(9).fill(null).map(() => Array(9).fill(false));

  // Helper function to find and mark duplicates in a group of 9 cells
  const markDuplicates = (cells) => {
    const seen = new Map();
    
    // Group cell positions by the number they contain
    for (const cell of cells) {
      const value = board[cell.row][cell.col];
      if (value !== null) {
        if (!seen.has(value)) {
          seen.set(value, []);
        }
        seen.get(value).push(cell);
      }
    }

    // Mark cells that are part of a duplicate entry
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        for (const pos of positions) {
          errors[pos.row][pos.col] = true;
        }
      }
    }
  };

  // 1. Check all rows for duplicates
  for (let i = 0; i < 9; i++) {
    const rowCells = Array.from({ length: 9 }, (_, j) => ({ row: i, col: j }));
    markDuplicates(rowCells);
  }

  // 2. Check all columns for duplicates
  for (let j = 0; j < 9; j++) {
    const colCells = Array.from({ length: 9 }, (_, i) => ({ row: i, col: j }));
    markDuplicates(colCells);
  }

  // 3. Check all 3x3 boxes for duplicates
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxCells = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          boxCells.push({ row: boxRow * 3 + i, col: boxCol * 3 + j });
        }
      }
      markDuplicates(boxCells);
    }
  }

  return errors;
};


/**
 * Checks if the board is fully and correctly solved by comparing it to the solution.
 * @param {Array<Array<number|null>>} board The current game board.
 * @param {Array<Array<number>>} solution The correct solution.
 * @returns {boolean}
 */
export const isBoardSolved = (board, solution) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null || board[i][j] !== solution[i][j]) {
        return false;
      }
    }
  }
  return true;
};