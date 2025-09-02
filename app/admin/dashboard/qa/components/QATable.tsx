'use client';

import { Calendar, Edit, Trash2 } from 'lucide-react';

interface QAData {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface QATableProps {
  qas: QAData[];
  onEdit: (qa: QAData) => void;
  onDelete: (qa: QAData) => void;
  formatDate: (dateString: string) => string;
}

export default function QATable({
  qas,
  onEdit,
  onDelete,
  formatDate,
}: QATableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 w-2/5">
              Question
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 w-2/5">
              Answer
            </th>
            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 w-1/6">
              Created
            </th>
            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {qas.map((qa, index) => (
            <tr
              key={qa._id}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="py-4 px-6 align-top">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold text-blue-600">
                      Q
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed line-clamp-3">
                    {qa.question}
                  </p>
                </div>
              </td>
              <td className="py-4 px-6 align-top">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-semibold text-emerald-600">
                      A
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {qa.answer}
                  </p>
                </div>
              </td>
              <td className="py-4 px-6 align-top">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(qa.createdAt)}</span>
                </div>
              </td>
              <td className="py-4 px-6 align-top">
                <div className="flex items-center justify-end space-x-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
