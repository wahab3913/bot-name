'use client';

import { Plus, Brain } from 'lucide-react';

interface QAHeaderProps {
  qaCount: number;
  onAddNew: () => void;
}

export default function QAHeader({ qaCount, onAddNew }: QAHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">
          AI Training Center
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Create and manage Q&A pairs to improve AI responses
        </p>
      </div>
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full">
          <Brain className="h-3 w-3 md:h-4 md:w-4 text-[#101238]" />
          <span className="text-xs md:text-sm font-medium text-[#101238]">
            {qaCount} conversations trained
          </span>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 bg-[#101238] text-white font-semibold rounded-xl md:rounded-2xl hover:bg-[#0f1135] focus:outline-none focus:ring-4 focus:ring-[#101238]/50 transition-all duration-300 transform hover:scale-[1.02] shadow-lg text-sm md:text-base"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
          Add New Q&A
        </button>
      </div>
    </div>
  );
}
