'use client';

import { Plus, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  onAddNew: () => void;
}

export default function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
        <MessageSquare className="h-8 w-8 text-[#101238]" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No conversations yet
      </h3>
      <p className="text-gray-500 mb-6">
        Start training your AI by creating your first Q&A pair
      </p>
      <button
        onClick={onAddNew}
        className="inline-flex items-center px-6 py-3 bg-[#101238] text-white font-semibold rounded-2xl hover:bg-[#0f1135] transition-all duration-300"
      >
        <Plus className="h-5 w-5 mr-2" />
        Create First Q&A
      </button>
    </div>
  );
}
