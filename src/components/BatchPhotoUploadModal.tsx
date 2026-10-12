import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StudentWithRank } from '../types/student';
import { compressAndResizeAvatar } from '../utils/imageCompressor';

interface MatchItem {
  file: File;
  previewUrl: string;
  matchedStudentId: string | null;
  fileName: string;
}

interface BatchPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentWithRank[];
  onApplyPhotos: (matchedPhotos: Record<string, string>) => Promise<void>;
}

export const BatchPhotoUploadModal: React.FC<BatchPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  students,
  onApplyPhotos,
}) => {
  const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean filename without extension
  const getBaseName = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '').trim().toLowerCase();
  };

  // Match file to student by exact name first, then normalized
  const findMatchingStudentId = (filename: string): string | null => {
    const base = getBaseName(filename);

    // 1. Exact match (case insensitive)
    const exact = students.find((s) => s.name.trim().toLowerCase() === base);
    if (exact) return exact.id;

    // 2. Exact match after removing common separators or prefixes
    const normalizedBase = base.replace(/[_-]/g, ' ').replace(/\s+/g, ' ');
    const normalized = students.find(
      (s) => s.name.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedBase
    );
    if (normalized) return normalized.id;

    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (validExtensions.includes(f.type.toLowerCase()) || /\.(png|jpg|jpeg|webp)$/i.test(f.name)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('No valid image files (PNG, JPG, WebP) were found.');
      return;
    }

    const newItems: MatchItem[] = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      matchedStudentId: findMatchingStudentId(file.name),
      fileName: file.name,
    }));

    setMatchItems(newItems);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleStudentSelect = (index: number, studentId: string) => {
    setMatchItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        matchedStudentId: studentId === '' ? null : studentId,
      };
      return next;
    });
  };

  const handleApply = async () => {
    const validMatches = matchItems.filter((m) => m.matchedStudentId !== null);
    if (validMatches.length === 0) {
      setErrorMsg('Please match at least one photo to a student before applying.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const resultPhotos: Record<string, string> = {};

      for (const item of validMatches) {
        if (!item.matchedStudentId) continue;
        const compressed = await compressAndResizeAvatar(item.file, 256, 0.85);
        resultPhotos[item.matchedStudentId] = compressed;
      }

      await onApplyPhotos(resultPhotos);
      handleClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    matchItems.forEach((m) => {
      if (m.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(m.previewUrl);
      }
    });
    setMatchItems([]);
    setErrorMsg(null);
    setIsProcessing(false);
    onClose();
  };

  const matchedCount = matchItems.filter((m) => m.matchedStudentId !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Batch Upload & Match Student Photos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or drop your student photos. Photos will automatically pair with students by name.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1.5 focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {matchItems.length > 0
                ? 'Select or drop more photos to replace or add'
                : 'Drop all 19 student photos here or click to browse'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Supports selecting multiple files at once (.png, .jpg, .webp).
            </div>
          </div>

          {/* Matched Preview List */}
          {matchItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Detected Photos: {matchItems.length} &bull; Matched:{' '}
                  <span className="text-emerald-700 font-bold">{matchedCount}</span> /{' '}
                  {matchItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Choose Different Files</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white">
                {matchItems.map((item, idx) => {
                  const matchedStudent = students.find((s) => s.id === item.matchedStudentId);
                  const isMatched = !!matchedStudent;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 gap-3 transition-colors ${
                        isMatched ? 'bg-white' : 'bg-amber-50/40'
                      }`}
                    >
                      {/* Photo Thumbnail + Filename */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.previewUrl}
                          alt={item.fileName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-slate-800 truncate">
                            {item.fileName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {(item.file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>

                      {/* Matching Target Dropdown */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isMatched ? (
                          <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold mr-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Matched</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mr-1">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span>Unmatched</span>
                          </div>
                        )}

                        <select
                          value={item.matchedStudentId || ''}
                          onChange={(e) => handleStudentSelect(idx, e.target.value)}
                          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Select Student --</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (Rank #{s.rank})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            {matchItems.length > 0 && (
              <span>
                Ready to assign <strong>{matchedCount}</strong> student photos.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={matchedCount === 0 || isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Processing & Saving...' : `Apply ${matchedCount} Photos`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
