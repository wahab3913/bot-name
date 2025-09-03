'use client';

import { useState, useEffect } from 'react';
import { X, Brain, CheckCircle, Sparkles } from 'lucide-react';

interface QAData {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface QAModalProps {
  isOpen: boolean;
  editingQA: QAData | null;
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string }) => Promise<void>;
}

export default function QAModal({
  isOpen,
  editingQA,
  onClose,
  onSubmit,
}: QAModalProps) {
  const [formData, setFormData] = useState({
    question: editingQA?.question || '',
    answer: editingQA?.answer || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when editingQA changes
  useEffect(() => {
    if (editingQA) {
      setFormData({
        question: editingQA.question,
        answer: editingQA.answer,
      });
    } else {
      setFormData({
        question: '',
        answer: '',
      });
    }
  }, [editingQA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Full page backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-2 md:p-4">
        <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-sm md:max-w-2xl border border-gray-100 overflow-hidden">
          <div className="bg-[#101238] p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg md:rounded-xl flex items-center justify-center">
                  <Brain className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {editingQA
                      ? 'Edit Conversation'
                      : 'New Training Conversation'}
                  </h3>
                  <p className="text-gray-300 text-xs md:text-sm">
                    {editingQA
                      ? 'Update this Q&A pair'
                      : 'Teach your AI a new conversation'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg md:rounded-xl transition-colors"
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
                <div>
                  <div className="flex items-center space-x-2 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center">
                      <span className="text-sm md:text-lg font-bold text-blue-600">
                        Q
                      </span>
                    </div>
                    <label
                      htmlFor="question"
                      className="text-base md:text-lg font-semibold text-gray-900"
                    >
                      Question
                    </label>
                  </div>
                  <textarea
                    id="question"
                    name="question"
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl transition-all placeholder-gray-400 resize-none text-sm text-black ${
                      editingQA
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#101238] focus:border-transparent'
                    }`}
                    placeholder="What question should the AI be able to answer?"
                    value={formData.question}
                    onChange={handleChange}
                    readOnly={!!editingQA}
                    disabled={!!editingQA}
                    required={!editingQA}
                  />
                  {editingQA && (
                    <p className="text-xs text-gray-500 mt-2">
                      Question cannot be changed when editing. Only the answer
                      can be updated.
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3 md:mb-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-lg md:rounded-xl flex items-center justify-center">
                      <span className="text-sm md:text-lg font-bold text-emerald-600">
                        A
                      </span>
                    </div>
                    <label
                      htmlFor="answer"
                      className="text-base md:text-lg font-semibold text-gray-900"
                    >
                      Answer
                    </label>
                  </div>
                  <textarea
                    id="answer"
                    name="answer"
                    className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#101238] focus:border-transparent transition-all placeholder-gray-400 resize-none text-sm text-black"
                    placeholder="How should the AI respond to this question?"
                    value={formData.answer}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-100">
                <div className="flex justify-end space-x-2 md:space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 md:px-6 md:py-3 border border-gray-200 text-gray-700 font-medium rounded-lg md:rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101238] transition-all text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 md:px-6 md:py-3 bg-[#101238] text-white font-semibold rounded-lg md:rounded-xl hover:bg-[#0f1135] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#101238] transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
                        {editingQA ? 'Updating...' : 'Creating...'}
                      </>
                    ) : editingQA ? (
                      <>
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                        Update Conversation
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3" />
                        Create Conversation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
