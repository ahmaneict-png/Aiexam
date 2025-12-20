
import React from 'react';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="text-center p-12 bg-white rounded-3xl shadow-lg border border-slate-100">
        <div className="inline-flex relative mb-8">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-xl font-semibold text-slate-800 mb-2">{message}</p>
        <p className="text-slate-400">याला काही वेळ लागू शकतो, कृपया प्रतीक्षा करा...</p>
    </div>
  );
};

export default LoadingIndicator;
