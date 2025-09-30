// Fix: Implemented the main App component to manage game state and logic.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SudokuGrid from './components/SudokuGrid';
import NumberPad from './components/NumberPad';
import DifficultySelector from './components/DifficultySelector';
import LoadingSpinner from './components/LoadingSpinner';
import GameStats from './components/GameStats';
import { Board, Puzzle, Solution, Difficulty, Cell } from './types';
import { generateSudokuPuzzle } from './utils/sudokuGenerator';
import { findErrors, isBoardSolved } from './utils/sudokuLogic';
import ThemeToggle from './components/ThemeToggle';
import AutosolveWarning from './components/AutosolveWarning';

const createEmptyBoard = (): Board => Array(9).fill(null).map(() => Array(9).fill(null));
const createEmptyErrors = (): boolean[][] => Array(9).fill(null).map(() => Array(9).fill(false));

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'difficulty' | 'loading' | 'playing' | 'solved'>('difficulty');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [errors, setErrors] = useState<boolean[][]>(createEmptyErrors());
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [time, setTime] = useState(0);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [isAutosolving, setIsAutosolving] = useState(false);
  const [autosolveUsed, setAutosolveUsed] = useState(false);
  const [showAutosolveWarning, setShowAutosolveWarning] = useState(false);
  const autosolveIntervalRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('sudoku-theme') : null;
    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  // Check for saved game on initial load
  useEffect(() => {
    const savedGame = localStorage.getItem('sudoku-saved-game');
    if (savedGame) {
      setHasSavedGame(true);
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#111827');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
    localStorage.setItem('sudoku-theme', theme);
  }, [theme]);
  
  const stopAutosolver = useCallback(() => {
    if (autosolveIntervalRef.current) {
      clearInterval(autosolveIntervalRef.current);
      autosolveIntervalRef.current = null;
    }
    setIsAutosolving(false);
  }, []);

  const startNewGame = useCallback((selectedDifficulty: Difficulty) => {
    localStorage.removeItem('sudoku-saved-game'); // Clear any previous save
    setHasSavedGame(false);
    setGameState('loading');
    stopAutosolver();
    
    // Use a short timeout to allow the UI to update to the loading state
    setTimeout(() => {
        setDifficulty(selectedDifficulty);
        setSelectedCell(null);
        setErrors(createEmptyErrors());
        setErrorsCount(0);
        setTime(0);
        setAutosolveUsed(false);

        const { puzzle: newPuzzle, solution: newSolution } = generateSudokuPuzzle(selectedDifficulty);
        setPuzzle(newPuzzle);
        setSolution(newSolution);
        
        const initialBoard: Board = newPuzzle.map(row =>
            row.map(cell => (cell === 0 ? null : cell))
        );
        setBoard(initialBoard);
        setGameState('playing');
    }, 50); // 50ms timeout
  }, [stopAutosolver]);

  const handleSelectDifficulty = (selectedDifficulty: Difficulty) => {
    startNewGame(selectedDifficulty);
  };
  
  const handleNewGame = () => {
    stopAutosolver();
    setGameState('difficulty');
    setPuzzle(null);
    setSolution(null);
    setBoard(createEmptyBoard());
    setAutosolveUsed(false);
  };

  const handleContinueGame = () => {
    const savedGameJSON = localStorage.getItem('sudoku-saved-game');
    if (savedGameJSON) {
        const savedGame = JSON.parse(savedGameJSON);
        setDifficulty(savedGame.difficulty);
        setPuzzle(savedGame.puzzle);
        setSolution(savedGame.solution);
        setBoard(savedGame.board);
        setTime(savedGame.time);
        setAutosolveUsed(savedGame.autosolveUsed || false);
        setSelectedCell(null);
        setErrors(createEmptyErrors()); // will be recalculated
        setGameState('playing');
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !isAutosolving) {
      const timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, isAutosolving]);

  useEffect(() => {
    if (puzzle && gameState !== 'difficulty') {
        const newErrors = findErrors(board, puzzle);
        setErrors(newErrors);
        setErrorsCount(newErrors.flat().filter(Boolean).length);

        if (solution && isBoardSolved(board, solution)) {
            stopAutosolver();
            setGameState('solved');
            setSelectedCell(null);
            localStorage.removeItem('sudoku-saved-game');
            setHasSavedGame(false);
        } else if (gameState === 'playing') {
            const gameStateToSave = {
                difficulty,
                puzzle,
                solution,
                board,
                time,
                autosolveUsed,
            };
            localStorage.setItem('sudoku-saved-game', JSON.stringify(gameStateToSave));
            setHasSavedGame(true);
        }
    }
  }, [board, puzzle, solution, gameState, difficulty, time, autosolveUsed, stopAutosolver]);

  const handleCellSelect = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (puzzle && puzzle[row][col] === 0) {
      setSelectedCell({ row, col });
    } else {
      setSelectedCell(null);
    }
  };

  const handleNumberClick = (num: number) => {
    if (selectedCell && puzzle && puzzle[selectedCell.row][selectedCell.col] === 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[selectedCell.row][selectedCell.col] = num;
      setBoard(newBoard);
    }
  };

  const handleErase = () => {
    if (selectedCell && puzzle && puzzle[selectedCell.row][selectedCell.col] === 0) {
      const newBoard = board.map(row => [...row]);
      newBoard[selectedCell.row][selectedCell.col] = null;
      setBoard(newBoard);
    }
  };

  const findNextEmptyCell = (currentBoard: Board): Cell | null => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] === null) {
                return { row, col };
            }
        }
    }
    return null;
  };
  
  const handleAutosolveClick = () => {
    if (isAutosolving) {
      stopAutosolver();
    } else {
      setShowAutosolveWarning(true);
    }
  };
  
  const handleConfirmAutosolve = () => {
    setShowAutosolveWarning(false);
    if (gameState !== 'playing' || !solution) return;
    setAutosolveUsed(true);
    setIsAutosolving(true);

    autosolveIntervalRef.current = window.setInterval(() => {
        setBoard(prevBoard => {
            const emptyCell = findNextEmptyCell(prevBoard);
            if (emptyCell && solution) {
                const newBoard = prevBoard.map(r => [...r]);
                newBoard[emptyCell.row][emptyCell.col] = solution[emptyCell.row][emptyCell.col];
                setTime(prevTime => prevTime + 60);
                return newBoard;
            } else {
                stopAutosolver();
                return prevBoard;
            }
        });
    }, 500);
  };

  const handleCancelAutosolve = () => {
    setShowAutosolveWarning(false);
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
        if (autosolveIntervalRef.current) {
            clearInterval(autosolveIntervalRef.current);
        }
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (gameState) {
      case 'difficulty':
        return <DifficultySelector 
                  onSelectDifficulty={handleSelectDifficulty}
                  hasSavedGame={hasSavedGame}
                  onContinue={handleContinueGame} 
                />;
      case 'loading':
        return <LoadingSpinner text="Generating new puzzle..." />;
      case 'playing':
      case 'solved':
        if (!puzzle || !difficulty || !solution) return <LoadingSpinner text="Error loading game..." />;
        return (
          <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center">
            <GameStats 
                difficulty={difficulty} 
                errorsCount={errorsCount} 
                time={time}
                onNewGame={handleNewGame}
                isAutosolving={isAutosolving}
                onToggleAutosolve={handleAutosolveClick}
            />
            <SudokuGrid 
              puzzle={puzzle} 
              board={board} 
              onCellSelect={handleCellSelect} 
              selectedCell={selectedCell} 
              errors={errors}
              isSolved={gameState === 'solved'}
            />
            {gameState === 'playing' && (
              <NumberPad onNumberClick={handleNumberClick} onErase={handleErase} />
            )}
            {gameState === 'solved' && (
              <div className="mt-6 text-center">
                <h2 className="text-3xl font-bold text-green-500 dark:text-green-400">Congratulations!</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">You solved the puzzle in {formatTime(time)}.</p>
                {autosolveUsed && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Autosolve has been used this game</p>
                )}
                <button 
                  onClick={handleNewGame}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center font-sans p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
        <div className="w-full max-w-md flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">SuDirkU</h1>
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl w-full max-w-md">
            {renderContent()}
        </div>
        {showAutosolveWarning && (
            <AutosolveWarning
                onConfirm={handleConfirmAutosolve}
                onCancel={handleCancelAutosolve}
            />
        )}
    </main>
  );
};

export default App;