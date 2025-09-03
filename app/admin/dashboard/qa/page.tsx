'use client';

import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import QAHeader from './components/QAHeader';
import QATable from './components/QATable';
import QACardList from './components/QACardList';
import QAModal from './components/QAModal';
import EmptyState from './components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';

interface QAData {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export default function QAManagement() {
  const [qas, setQAs] = useState<QAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQA, setEditingQA] = useState<QAData | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    qa: QAData | null;
    isDeleting: boolean;
  }>({ isOpen: false, qa: null, isDeleting: false });

  useEffect(() => {
    fetchQAs();
  }, []);

  const fetchQAs = async () => {
    try {
      const response = await fetch('/api/admin/qa', {
        credentials: 'include', // Include HTTP-only cookies
      });

      if (response.status === 401) {
        // Token is invalid, redirect to login (middleware will handle this)
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setQAs(data.data);
      }
    } catch (error) {
      console.error('Error fetching Q&As:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: {
    question: string;
    answer: string;
  }) => {
    try {
      const url = '/api/admin/qa';
      const method = editingQA ? 'PUT' : 'POST';
      const body = editingQA
        ? { id: editingQA._id, answer: formData.answer }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (editingQA) {
          // Update existing Q&A (only answer)
          setQAs(
            qas.map((qa) =>
              qa._id === editingQA._id
                ? {
                    ...qa,
                    answer: formData.answer,
                    updatedAt: new Date().toISOString(),
                  }
                : qa
            )
          );
        } else {
          // Add new Q&A
          setQAs([data.data, ...qas]);
        }

        handleCloseModal();
      } else {
        alert(data.error || 'Error saving Q&A');
      }
    } catch (error) {
      console.error('Error saving Q&A:', error);
      alert('Error saving Q&A');
    }
  };

  const handleEdit = (qa: QAData) => {
    setEditingQA(qa);
    setShowModal(true);
  };

  const openDeleteModal = (qa: QAData) => {
    setDeleteModal({ isOpen: true, qa, isDeleting: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, qa: null, isDeleting: false });
  };

  const confirmDelete = async () => {
    const qa = deleteModal.qa;
    if (!qa) return;

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/admin/qa?id=${qa._id}`, {
        method: 'DELETE',
        credentials: 'include', // Include HTTP-only cookies
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      if (data.success) {
        setQAs(qas.filter((q) => q._id !== qa._id));
        closeDeleteModal();
      } else {
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Error deleting Q&A:', error);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQA(null);
  };

  const handleAddNew = () => {
    setEditingQA(null);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#101238] rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-700">
            Loading conversations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <QAHeader qaCount={qas.length} onAddNew={handleAddNew} />

      {/* Q&A Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200/50">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-4 w-4 md:h-5 md:w-5 mr-2 text-gray-600" />
            Training Conversations ({qas.length})
          </h2>
        </div>

        {qas.length === 0 ? (
          <EmptyState onAddNew={handleAddNew} />
        ) : (
          <>
            <QACardList
              qas={qas}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
            />
            <QATable
              qas={qas}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              formatDate={formatDate}
            />
          </>
        )}
      </div>

      {/* Modal */}
      <QAModal
        isOpen={showModal}
        editingQA={editingQA}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Q&A"
        message={`Are you sure you want to delete the question "${deleteModal.qa?.question}"? This action cannot be undone and will remove this Q&A from your AI training data.`}
        confirmText="Delete Q&A"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}
