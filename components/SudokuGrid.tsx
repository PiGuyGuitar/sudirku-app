import React from 'react';
import type { Board, Puzzle, Cell } from '../types';

interface SudokuGridProps {
  puzzle: Puzzle;
  board: Board;
  onCellSelect: (row: number, col: number) => void;
  selectedCell: Cell | null;
  errors: boolean[][];
  isSolved: boolean;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ puzzle, board, onCellSelect, selectedCell, errors, isSolved }) => {
  const renderCell = (row: number, col: number) => {
    const isPuzzleNumber = puzzle[row][col] !== 0;
    const value = board[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isError = errors[row] && errors[row][col];
    const isRelated = selectedCell && (selectedCell.row === row || selectedCell.col === col || (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(selectedCell.col / 3) === Math.floor(col / 3)));
    
    let cellClasses = 'aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer transition-colors duration-150';

    // Set text color based on cell state
    if (isPuzzleNumber) {
        cellClasses += ' text-gray-900 dark:text-gray-300';
    } else if (isError) {
        cellClasses += ' text-red-500 dark:text-red-400';
    } else if (isSolved) {
        cellClasses += ' text-green-600 dark:text-green-400';
    } else {
        cellClasses += ' text-blue-600 dark:text-blue-400';
    }

    // Set background color based on cell state
    if (isSelected) {
        cellClasses += ' bg-blue-200 dark:bg-blue-800';
    } else if (isRelated) {
        cellClasses += ' bg-gray-200 dark:bg-gray-700';
    } else {
        cellClasses += ' bg-white dark:bg-gray-800';
    }

    return (
      <div
        key={`${row}-${col}`}
        className={cellClasses}
        onClick={() => onCellSelect(row, col)}
      >
        {value !== null && value !== 0 ? value : ''}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-[2px] bg-gray-400 dark:bg-gray-500 border-2 border-gray-400 dark:border-gray-500 rounded-lg overflow-hidden aspect-square w-full">
      {Array.from({ length: 9 }).map((_, blockIndex) => {
        const startRow = Math.floor(blockIndex / 3) * 3;
        const startCol = (blockIndex % 3) * 3;
        return (
          <div key={blockIndex} className="grid grid-cols-3 gap-[1px] bg-gray-300 dark:bg-gray-600">
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              const row = startRow + Math.floor(cellIndex / 3);
              const col = startCol + (cellIndex % 3);
              return renderCell(row, col);
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SudokuGrid;