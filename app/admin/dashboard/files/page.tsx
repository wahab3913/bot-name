'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// Using Firebase Web SDK for client-side uploads/deletes
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  Clock,
  X,
  File,
} from 'lucide-react';
import { storage } from '@/lib/firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import ConfirmationModal from '../components/ConfirmationModal';

interface FileData {
  _id: string;
  fileName: string;
  fileUrl: string;
  filePath?: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export default function FileManagement() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    file: FileData | null;
    isDeleting: boolean;
  }>({ isOpen: false, file: null, isDeleting: false });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/admin/files', {
        credentials: 'include', // Include HTTP-only cookies
      });
      const data = await response.json();

      if (data.success) {
        setFiles(data.data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadQueue((prev) => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach((file) => uploadFile(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'text/*': ['.txt', '.md', '.csv'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
          '.xlsx',
        ],
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: true,
    });

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    try {
      // Upload to Firebase Storage (client-side)
      const timestamp = Date.now();
      const storageFileName = `${timestamp}_${file.name}`;
      const filePath = `uploads/${storageFileName}`;
      const storageRef = ref(storage, filePath);

      await new Promise<void>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          'state_changed',
          (snapshot: { bytesTransferred: number; totalBytes: number }) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
          },
          (err: unknown) => reject(err),
          () => resolve()
        );
      });

      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata to database via API
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: downloadURL,
          filePath: filePath,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFiles((prev) => [data.data, ...prev]);
        setTimeout(() => {
          setUploadProgress((prev) => {
            const { [fileId]: removed, ...rest } = prev;
            return rest;
          });
        }, 500);
      } else {
        console.error('Upload failed:', data.error);
        alert(`Upload failed: ${data.error}`);
        setUploadProgress((prev) => {
          const { [fileId]: removed, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Please try again.');
      setUploadProgress((prev) => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });
    }

    setUploadQueue((prev) => prev.filter((f) => f !== file));
  };

  const openDeleteModal = (file: FileData) => {
    setDeleteModal({ isOpen: true, file, isDeleting: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, file: null, isDeleting: false });
  };

  const confirmDelete = async () => {
    const file = deleteModal.file;
    if (!file) return;

    // Set deleting state
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      // Delete DB record via API
      const response = await fetch(`/api/admin/files?id=${file._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Attempt to delete from Firebase Storage using stored path, fallback to URL
        if (file.filePath) {
          try {
            await deleteObject(ref(storage, file.filePath));
          } catch (e) {
            console.warn('Storage delete warning:', e);
          }
        } else if (data.fileUrl) {
          try {
            await deleteObject(ref(storage, data.fileUrl));
          } catch (e) {
            console.warn('Storage delete warning:', e);
          }
        }

        // Remove from local state
        setFiles(files.filter((f) => f._id !== file._id));
        closeDeleteModal();
      } else {
        console.error('Delete failed:', data.error);
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('word') || fileType.includes('document')) return File;
    if (fileType.includes('text') || fileType.includes('markdown'))
      return FileText;
    return File;
  };

  const removeFromQueue = (file: File) => {
    setUploadQueue((prev) => prev.filter((f) => f !== file));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#101238] rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-700">
            Loading files...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-col md:flex-row">
        <div>
          <h1 className="md:text-3xl font-bold text-gray-900">
            Knowledge Base Files
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Upload and manage documents to enhance AI understanding
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
          <Upload className="h-4 w-4 text-[#101238]" />
          <span className="text-sm font-medium text-[#101238]">
            {files.length} files stored
          </span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`relative bg-blue-50 border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          isDragActive
            ? 'border-blue-500 bg-blue-100 scale-[1.02]'
            : isDragReject
            ? 'border-red-500 bg-red-50'
            : 'border-blue-300 hover:border-blue-400 hover:bg-blue-100/50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-6">
          <div
            className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive
                ? 'bg-[#101238] scale-110'
                : 'bg-[#101238] group-hover:scale-110'
            }`}
          >
            <Upload className="h-10 w-10 text-white" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Knowledge Files'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Drag and drop files here, or{' '}
              <span className="text-[#101238] font-medium">browse</span> to
              select files
            </p>
          </div>

          <div className="flex flex-wrap gap-8 justify-center max-w-lg mx-auto">
            {[
              { icon: FileText, label: 'PDFs', color: 'text-red-500' },
              { icon: File, label: 'Word Docs', color: 'text-blue-500' },
              { icon: FileText, label: 'Text Files', color: 'text-green-500' },
            ].map((type, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 p-3 bg-white/60 rounded-xl"
              >
                <type.icon className={`h-6 w-6 ${type.color}`} />
                <span className="text-xs font-medium text-gray-600">
                  {type.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            Maximum file size: 10MB • Supported formats: PDF, DOC, DOCX, TXT, MD
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-[#101238]" />
            Upload Progress
          </h3>
          <div className="space-y-4">
            {uploadQueue.map((file, index) => {
              const fileId = `${file.name}-${Date.now()}`;
              const progress = uploadProgress[fileId] || 0;
              const isComplete = progress === 100;
              const FileIcon = getFileIcon(file.type);

              return (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isComplete ? 'bg-green-100' : 'bg-blue-100'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <FileIcon className="h-6 w-6 text-[#101238]" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {Math.round(progress)}%
                        </span>
                        {!isComplete && (
                          <button
                            onClick={() => removeFromQueue(file)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isComplete ? 'bg-green-500' : 'bg-[#101238]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      {isComplete && (
                        <span className="text-xs text-green-600 font-medium">
                          Upload complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Uploaded Files ({files.length})
          </h2>
        </div>

        {files.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-500">
              Upload your first document to start building your AI knowledge
              base
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.fileType);
              return (
                <div
                  key={file._id}
                  className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#101238] rounded-xl flex items-center justify-center">
                          <FileIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#101238] transition-colors">
                            {file.fileName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {/* <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Type</span>
                        <span className="text-gray-900 font-medium">
                          {file.fileType.split('/')[1]?.toUpperCase() ||
                            'Unknown'}
                        </span>
                      </div> */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Uploaded</span>
                        <span className="text-gray-900">
                          {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gray-100 text-[#101238] rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex-1 justify-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                      <a
                        href={file.fileUrl}
                        download
                        className="flex items-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => openDeleteModal(file)}
                        className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteModal.file?.fileName}"? This will permanently remove the file from both storage and database.`}
        confirmText="Delete File"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}
