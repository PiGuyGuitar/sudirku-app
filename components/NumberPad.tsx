
import React from 'react';
import { EraseIcon } from './icons';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onErase }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="grid grid-cols-5 gap-2 mt-4 w-full">
      {numbers.map(num => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="aspect-square bg-gray-200 dark:bg-gray-700 text-2xl font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onErase}
        className="aspect-square bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
      >
        <EraseIcon />
      </button>
    </div>
  );
};

export default NumberPad;
