
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
