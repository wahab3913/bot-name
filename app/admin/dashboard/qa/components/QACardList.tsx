'use client';

import { Calendar, Edit, Trash2 } from 'lucide-react';

interface QAData {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface QACardListProps {
  qas: QAData[];
  onEdit: (qa: QAData) => void;
  onDelete: (qa: QAData) => void;
}

export default function QACardList({ qas, onEdit, onDelete }: QACardListProps) {
  return (
    <div className="block md:hidden space-y-4 p-4">
      {qas.map((qa, index) => (
        <div
          key={qa._id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="p-4">
            {/* Question */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">Q</span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  Question
                </span>
              </div>
              <p className="text-sm text-gray-900 leading-relaxed pl-8 line-clamp-3">
                {qa.question}
              </p>
            </div>

            {/* Answer */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-emerald-600">
                    A
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  Answer
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-8 line-clamp-3">
                {qa.answer}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(qa.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onEdit(qa)}
                  className="p-2 text-gray-400 hover:text-[#101238] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(qa)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
