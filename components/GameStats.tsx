import React from 'react';
import { Difficulty } from '../types';

interface GameStatsProps {
  difficulty: Difficulty;
  errorsCount: number;
  time: number;
  onNewGame: () => void;
  isAutosolving: boolean;
  onToggleAutosolve: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({ difficulty, errorsCount, time, onNewGame, isAutosolving, onToggleAutosolve }) => {
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex justify-center items-center text-gray-800 dark:text-gray-100 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 my-4 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">Difficulty</span>
          <span className="text-lg font-bold">{difficulty}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Time</span>
          <span className="text-lg font-bold tabular-nums">{formatTime(time)}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Errors</span>
          <span className="text-lg font-bold tabular-nums">{errorsCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleAutosolve}
          className={`font-bold py-2 px-3 text-sm rounded-lg transition-colors ${isAutosolving ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {isAutosolving ? 'Stop Solving' : 'Auto-Solve'}
        </button>
        <button 
          onClick={onNewGame}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 text-sm rounded-lg transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameStats;