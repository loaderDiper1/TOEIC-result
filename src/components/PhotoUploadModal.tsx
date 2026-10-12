import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Check, AlertCircle } from 'lucide-react';
import { StudentWithRank } from '../types/student';
import { compressAndResizeAvatar } from '../utils/imageCompressor';
import { getStudentInitials } from '../utils/ranking';

interface PhotoUploadModalProps {
  student: StudentWithRank | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (studentId: string, photoDataUrl: string) => Promise<void>;
  onDeletePhoto: (studentId: string) => Promise<void>;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  student,
  isOpen,
  onClose,
  onSavePhoto,
  onDeletePhoto,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !student) return null;

  const currentPhoto = previewUrl || student.photoUrl;

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validExtensions.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a JPG, PNG, or WebP image file.');
      return;
    }

    // Max 10MB input check
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File is too large. Please select an image under 10MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!student) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (selectedFile) {
        // Compress & scale down using canvas
        const compressedDataUrl = await compressAndResizeAvatar(selectedFile, 256, 0.85);
        await onSavePhoto(student.id, compressedDataUrl);
      }
      handleClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process and save image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    setIsProcessing(true);
    try {
      await onDeletePhoto(student.id);
      handleClose();
    } catch {
      setErrorMsg('Failed to remove student photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Student Photo Management
            </h2>
            <p className="text-xs text-slate-500">
              {student.name} &bull; Rank #{student.rank} &bull; Score: {student.totalScore}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1 focus:outline-hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current / Preview Avatar Display */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 shrink-0 shadow-xs flex items-center justify-center">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-slate-500">
                  {getStudentInitials(student.name)}
                </span>
              )}
            </div>

            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                {selectedFile
                  ? 'New photo selected (Preview)'
                  : student.photoUrl
                  ? 'Current uploaded photo'
                  : 'Default initials placeholder'}
              </div>
              <div className="text-slate-500">
                {selectedFile
                  ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`
                  : 'Dimensions auto-scaled to 256×256 px on save'}
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-medium text-slate-700">
              Click to select or drag and drop photo
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Supports JPG, PNG, and WebP (up to 10MB)
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <div>
            {student.photoUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedFile || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Saving...' : 'Save Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
