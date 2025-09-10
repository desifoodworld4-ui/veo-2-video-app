
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
      <p className="mt-6 text-lg font-semibold text-white">Generating Your Video...</p>
      <p className="text-gray-300 mt-2 transition-opacity duration-500">{message}</p>
    </div>
  );
};
