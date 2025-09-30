import React from 'react';
import { Difficulty } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  hasSavedGame: boolean;
  onContinue: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, hasSavedGame, onContinue }) => {
  const difficulties: { level: Difficulty; color: string; extraClasses?: string }[] = [
    { level: Difficulty.Easy, color: 'bg-green-600 hover:bg-green-700' },
    { level: Difficulty.Medium, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { level: Difficulty.Hard, color: 'bg-red-600 hover:bg-red-700' },
    { level: Difficulty.Extreme, color: 'bg-purple-700 hover:bg-purple-800' },
    { level: Difficulty.Insane, color: 'bg-black hover:bg-gray-900', extraClasses: 'border-2 border-red-700' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">New Game</h2>
      <div className="w-full max-w-xs space-y-3">
        {hasSavedGame && (
          <>
            <button
              onClick={onContinue}
              className="w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </button>
            <div className="h-px bg-gray-300 dark:bg-gray-600 my-4"></div>
          </>
        )}
        {difficulties.map(({ level, color, extraClasses }) => (
          <button
            key={level}
            onClick={() => onSelectDifficulty(level)}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out ${color} ${extraClasses || ''}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;