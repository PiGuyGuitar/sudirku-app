import React from 'react';

interface AutosolveWarningProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const AutosolveWarning: React.FC<AutosolveWarningProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full text-center animate-fade-in-up">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Auto-Solve Warning</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Each number adds a 60s penalty. Press 'Stop Solving' anytime to cancel.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AutosolveWarning;
