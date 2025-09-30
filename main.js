import { generateSudokuPuzzle } from './utils/sudokuGenerator.js';
import { findErrors, isBoardSolved } from './utils/sudokuLogic.js';

// --- CONSTANTS ---
const Difficulty = Object.freeze({
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
  Extreme: 'Extreme',
  Insane: 'Insane',
});

// --- DOM ELEMENTS ---
const appContainer = document.getElementById('app-container');

// --- STATE MANAGEMENT ---
let state = {};

function resetState() {
    state = {
        gameState: 'difficulty', // 'difficulty', 'loading', 'playing', 'solved'
        difficulty: null,
        puzzle: null,
        solution: null,
        board: createEmptyBoard(),
        selectedCell: null, // { row, col }
        errors: createEmptyErrors(),
        errorsCount: 0,
        time: 0,
        timerInterval: null,
        autosolveInterval: null,
        isAutosolving: false,
        autosolveUsed: false,
        showAutosolveWarning: false,
        theme: getInitialTheme(),
        hasSavedGame: !!localStorage.getItem('sudoku-saved-game'),
    };
}

// --- UTILITY FUNCTIONS ---
function createEmptyBoard() {
    return Array(9).fill(null).map(() => Array(9).fill(null));
}

function createEmptyErrors() {
    return Array(9).fill(null).map(() => Array(9).fill(false));
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getInitialTheme() {
    return localStorage.getItem('sudoku-theme') === 'dark' ? 'dark' : 'light';
}

// --- RENDERING ---
function render() {
    let content = '';
    switch (state.gameState) {
        case 'difficulty':
            content = renderDifficultySelector();
            break;
        case 'loading':
            content = renderLoadingSpinner('Generating new puzzle...');
            break;
        case 'playing':
        case 'solved':
            content = renderGameScreen();
            break;
    }

    const autosolveWarning = state.showAutosolveWarning ? renderAutosolveWarning() : '';

    appContainer.innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center font-sans p-4">
            <div class="w-full max-w-md flex justify-between items-center mb-4 text-gray-800 dark:text-white">
                <h1 class="text-4xl font-bold">SuDirkU</h1>
                ${renderThemeToggle()}
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl w-full max-w-md">
                ${content}
            </div>
            ${autosolveWarning}
        </div>
    `;
}

function renderThemeToggle() {
    const isDark = state.theme === 'dark';
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>`;
    return `
        <button data-action="toggle-theme" class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors">
            ${isDark ? sunIcon : moonIcon}
        </button>
    `;
}

function renderDifficultySelector() {
    const difficulties = [
        { level: Difficulty.Easy, color: 'bg-green-600 hover:bg-green-700' },
        { level: Difficulty.Medium, color: 'bg-yellow-600 hover:bg-yellow-700' },
        { level: Difficulty.Hard, color: 'bg-red-600 hover:bg-red-700' },
        { level: Difficulty.Extreme, color: 'bg-purple-700 hover:bg-purple-800' },
        { level: Difficulty.Insane, color: 'bg-black hover:bg-gray-900', extraClasses: 'border-2 border-red-700' },
    ];

    const continueButton = state.hasSavedGame ? `
        <button data-action="continue-game" class="w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out bg-blue-600 hover:bg-blue-700">
            Continue
        </button>
        <div class="h-px bg-gray-300 dark:bg-gray-600 my-4"></div>
    ` : '';

    return `
        <div class="flex flex-col items-center justify-center h-full p-4">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">New Game</h2>
            <div class="w-full max-w-xs space-y-3">
                ${continueButton}
                ${difficulties.map(({ level, color, extraClasses }) => `
                    <button data-action="select-difficulty" data-difficulty="${level}" class="w-full text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out ${color} ${extraClasses || ''}">
                        ${level}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLoadingSpinner(text) {
    return `
        <div class="flex flex-col items-center justify-center h-full p-10">
            <div class="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
            <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">${text}</p>
        </div>
    `;
}

function renderGameScreen() {
    if (!state.puzzle) return renderLoadingSpinner('Error loading game...');
    return `
        <div class="w-full max-w-lg mx-auto flex flex-col items-center">
            ${renderGameStats()}
            ${renderSudokuGrid()}
            ${state.gameState === 'playing' ? renderNumberPad() : ''}
            ${state.gameState === 'solved' ? renderSolvedScreen() : ''}
        </div>
    `;
}

function renderGameStats() {
    return `
        <div class="w-full flex justify-center items-center text-gray-800 dark:text-gray-100 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 my-4 flex-wrap gap-4">
            <div class="flex items-center gap-4">
                <div class="flex flex-col items-center text-center">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">Difficulty</span>
                    <span class="text-lg font-bold">${state.difficulty}</span>
                </div>
                <div class="flex flex-col items-center text-center">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Time</span>
                    <span class="text-lg font-bold tabular-nums">${formatTime(state.time)}</span>
                </div>
                <div class="flex flex-col items-center text-center">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Errors</span>
                    <span class="text-lg font-bold tabular-nums">${state.errorsCount}</span>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button data-action="toggle-autosolve" class="font-bold py-2 px-3 text-sm rounded-lg transition-colors ${state.isAutosolving ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}">
                    ${state.isAutosolving ? 'Stop Solving' : 'Auto-Solve'}
                </button>
                <button data-action="new-game" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 text-sm rounded-lg transition-colors">
                    New Game
                </button>
            </div>
        </div>
    `;
}

function renderSudokuGrid() {
    let cells = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const isPuzzleNumber = state.puzzle[row][col] !== 0;
            const value = state.board[row][col];
            const isSelected = state.selectedCell?.row === row && state.selectedCell?.col === col;
            const isError = state.errors[row] && state.errors[row][col];
            const isRelated = state.selectedCell && !isSelected && (state.selectedCell.row === row || state.selectedCell.col === col || (Math.floor(state.selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(state.selectedCell.col / 3) === Math.floor(col / 3)));
            
            let cellClasses = 'aspect-square flex items-center justify-center text-xl sm:text-2xl font-bold cursor-pointer transition-colors duration-150';

            if (isPuzzleNumber) cellClasses += ' text-gray-900 dark:text-gray-300';
            else if (isError) cellClasses += ' text-red-500 dark:text-red-400';
            else if (state.gameState === 'solved') cellClasses += ' text-green-600 dark:text-green-400';
            else cellClasses += ' text-blue-600 dark:text-blue-400';
            
            if (isSelected) cellClasses += ' bg-blue-200 dark:bg-blue-800';
            else if (isRelated) cellClasses += ' bg-gray-200 dark:bg-gray-700';
            else cellClasses += ' bg-white dark:bg-gray-800';
            
            const startRow = Math.floor(row / 3);
            const startCol = Math.floor(col / 3);
            if (startRow > 0 && row % 3 === 0) cellClasses += ' border-t-2 border-gray-400 dark:border-gray-500';
            if (startCol > 0 && col % 3 === 0) cellClasses += ' border-l-2 border-gray-400 dark:border-gray-500';

            cells += `<div data-action="select-cell" data-row="${row}" data-col="${col}" class="${cellClasses}">${value !== null && value !== 0 ? value : ''}</div>`;
        }
    }
    return `<div class="grid grid-cols-9 bg-gray-300 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500 rounded-lg overflow-hidden aspect-square w-full">${cells}</div>`;
}

function renderNumberPad() {
    const eraseIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>`;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `
        <button data-action="number-click" data-number="${num}" class="aspect-square bg-gray-200 dark:bg-gray-700 text-2xl font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            ${num}
        </button>
    `).join('');

    return `
        <div class="grid grid-cols-5 gap-2 mt-4 w-full">
            ${numbers}
            <button data-action="erase" class="aspect-square bg-red-600 rounded-lg hover:bg-red-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors">
                ${eraseIcon}
            </button>
        </div>
    `;
}

function renderSolvedScreen() {
    return `
        <div class="mt-6 text-center">
            <h2 class="text-3xl font-bold text-green-500 dark:text-green-400">Congratulations!</h2>
            <p class="text-gray-600 dark:text-gray-300 mt-2">You solved the puzzle in ${formatTime(state.time)}.</p>
            ${state.autosolveUsed ? `<p class="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Autosolve has been used this game</p>` : ''}
            <button data-action="new-game" class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Play Again
            </button>
        </div>
    `;
}

function renderAutosolveWarning() {
    return `
      <div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
          <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Auto-Solve Warning</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Each number adds a 60s penalty. Press 'Stop Solving' anytime to cancel.</p>
          <div class="flex justify-center gap-4">
            <button data-action="cancel-autosolve" class="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors">Cancel</button>
            <button data-action="confirm-autosolve" class="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors">Continue</button>
          </div>
        </div>
      </div>
    `;
}

// --- GAME LOGIC ---
function updateBoardState() {
    if (!state.puzzle) return;
    
    state.errors = findErrors(state.board);
    state.errorsCount = state.errors.flat().filter(Boolean).length;

    if (state.solution && isBoardSolved(state.board, state.solution)) {
        stopAutosolver();
        stopTimer();
        state.gameState = 'solved';
        state.selectedCell = null;
        localStorage.removeItem('sudoku-saved-game');
        state.hasSavedGame = false;
    } else if (state.gameState === 'playing') {
        const gameStateToSave = {
            difficulty: state.difficulty,
            puzzle: state.puzzle,
            solution: state.solution,
            board: state.board,
            time: state.time,
            autosolveUsed: state.autosolveUsed,
        };
        localStorage.setItem('sudoku-saved-game', JSON.stringify(gameStateToSave));
        state.hasSavedGame = true;
    }
    render();
}

function startTimer() {
    stopTimer();
    state.timerInterval = setInterval(() => {
        state.time++;
        // Re-render only the stats for performance
        const statsNode = appContainer.querySelector('.my-4');
        if (statsNode) statsNode.outerHTML = renderGameStats();
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function stopAutosolver() {
    if (state.autosolveInterval) {
        clearInterval(state.autosolveInterval);
        state.autosolveInterval = null;
    }
    if (state.isAutosolving) {
        state.isAutosolving = false;
        startTimer();
        render();
    }
}

function startNewGame(difficulty) {
    localStorage.removeItem('sudoku-saved-game');
    state.hasSavedGame = false;
    state.gameState = 'loading';
    stopAutosolver();
    stopTimer();
    render();

    setTimeout(() => {
        resetState(); // Reset all state properties
        state.gameState = 'playing';
        state.difficulty = difficulty;
        state.hasSavedGame = false;

        const { puzzle, solution } = generateSudokuPuzzle(difficulty);
        state.puzzle = puzzle;
        state.solution = solution;
        state.board = puzzle.map(row => row.map(cell => (cell === 0 ? null : cell)));
        
        startTimer();
        updateBoardState(); // This will render the new game
    }, 50);
}

// --- EVENT HANDLERS ---
function handleAppClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const params = target.dataset;

    switch (action) {
        case 'toggle-theme':
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('sudoku-theme', state.theme);
            render();
            break;
        case 'select-difficulty':
            startNewGame(params.difficulty);
            break;
        case 'continue-game':
            handleContinueGame();
            break;
        case 'new-game':
            stopAutosolver();
            stopTimer();
            state.gameState = 'difficulty';
            render();
            break;
        case 'select-cell':
            if (state.gameState !== 'playing') return;
            const row = parseInt(params.row, 10);
            const col = parseInt(params.col, 10);
            if (state.puzzle[row][col] === 0) {
                state.selectedCell = { row, col };
            } else {
                state.selectedCell = null;
            }
            render();
            break;
        case 'number-click':
            if (state.selectedCell && state.puzzle[state.selectedCell.row][state.selectedCell.col] === 0) {
                const { row, col } = state.selectedCell;
                state.board[row][col] = parseInt(params.number, 10);
                updateBoardState();
            }
            break;
        case 'erase':
            if (state.selectedCell && state.puzzle[state.selectedCell.row][state.selectedCell.col] === 0) {
                const { row, col } = state.selectedCell;
                state.board[row][col] = null;
                updateBoardState();
            }
            break;
        case 'toggle-autosolve':
            if (state.isAutosolving) stopAutosolver();
            else {
                state.showAutosolveWarning = true;
                render();
            }
            break;
        case 'confirm-autosolve':
            handleConfirmAutosolve();
            break;
        case 'cancel-autosolve':
            state.showAutosolveWarning = false;
            render();
            break;
    }
}

function handleContinueGame() {
    const savedGameJSON = localStorage.getItem('sudoku-saved-game');
    if (savedGameJSON) {
        const savedGame = JSON.parse(savedGameJSON);
        state.difficulty = savedGame.difficulty;
        state.puzzle = savedGame.puzzle;
        state.solution = savedGame.solution;
        state.board = savedGame.board;
        state.time = savedGame.time;
        state.autosolveUsed = savedGame.autosolveUsed || false;
        state.selectedCell = null;
        state.errors = createEmptyErrors();
        state.gameState = 'playing';
        startTimer();
        updateBoardState();
    }
}

function handleConfirmAutosolve() {
    state.showAutosolveWarning = false;
    if (state.gameState !== 'playing' || !state.solution) return;
    
    stopTimer();
    state.autosolveUsed = true;
    state.isAutosolving = true;
    render();

    state.autosolveInterval = setInterval(() => {
        let emptyCell = null;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (state.board[r][c] === null) {
                    emptyCell = { row: r, col: c };
                    break;
                }
            }
            if (emptyCell) break;
        }

        if (emptyCell && state.solution) {
            state.board[emptyCell.row][emptyCell.col] = state.solution[emptyCell.row][emptyCell.col];
            state.time += 60;
            updateBoardState();
        } else {
            stopAutosolver();
            updateBoardState(); // This should trigger solved state
        }
    }, 500);
}

// --- INITIALIZATION ---
function init() {
    appContainer.addEventListener('click', handleAppClick);
    resetState();
    render();
}

init();
