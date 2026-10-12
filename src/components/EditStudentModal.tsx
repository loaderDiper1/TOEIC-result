import React, { useState, useEffect } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { StudentWithRank, StudentRecord } from '../types/student';
import { validateStudentScores } from '../utils/ranking';

interface EditStudentModalProps {
  student: StudentWithRank | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (updated: StudentRecord) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSaveStudent,
}) => {
  const [name, setName] = useState('');
  const [listeningRaw, setListeningRaw] = useState<number | string>(0);
  const [listeningConverted, setListeningConverted] = useState<number | string>(0);
  const [readingRaw, setReadingRaw] = useState<number | string>(0);
  const [readingConverted, setReadingConverted] = useState<number | string>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setName(student.name);
      setListeningRaw(student.listeningRaw);
      setListeningConverted(student.listeningConverted);
      setReadingRaw(student.readingRaw);
      setReadingConverted(student.readingConverted);
      setErrors({});
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // Live computed total
  const lConvNum = Number(listeningConverted) || 0;
  const rConvNum = Number(readingConverted) || 0;
  const calculatedTotal = lConvNum + rConvNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateStudentScores({
      name,
      listeningRaw,
      listeningConverted,
      readingRaw,
      readingConverted,
    });

    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    onSaveStudent({
      id: student.id,
      name: name.trim(),
      listeningRaw: Number(listeningRaw),
      listeningConverted: Number(listeningConverted),
      readingRaw: Number(readingRaw),
      readingConverted: Number(readingConverted),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Edit Student Scores
            </h2>
            <p className="text-xs text-slate-500">
              Update scores &bull; Rankings recalculate automatically
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1 focus:outline-hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Jade"
                required
              />
              {errors.name && (
                <div className="text-[11px] text-red-600 mt-1">{errors.name}</div>
              )}
            </div>

            {/* Listening Section */}
            <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 space-y-3">
              <div className="text-xs font-semibold text-blue-900 flex items-center justify-between">
                <span>Listening Comprehension</span>
                <span className="text-[10px] text-blue-600 font-normal">Max Converted: 495</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Raw Score (0–100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={listeningRaw}
                    onChange={(e) => setListeningRaw(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                    required
                  />
                  {errors.listeningRaw && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.listeningRaw}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Converted Score (5–495)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="495"
                    step="5"
                    value={listeningConverted}
                    onChange={(e) => setListeningConverted(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold text-blue-900 bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                    required
                  />
                  {errors.listeningConverted && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.listeningConverted}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Reading Section */}
            <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 space-y-3">
              <div className="text-xs font-semibold text-indigo-900 flex items-center justify-between">
                <span>Reading Comprehension</span>
                <span className="text-[10px] text-indigo-600 font-normal">Max Converted: 495</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Raw Score (0–100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={readingRaw}
                    onChange={(e) => setReadingRaw(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                    required
                  />
                  {errors.readingRaw && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.readingRaw}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Converted Score (5–495)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="495"
                    step="5"
                    value={readingConverted}
                    onChange={(e) => setReadingConverted(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold text-indigo-900 bg-white border border-slate-300 rounded focus:outline-hidden focus:border-blue-500"
                    required
                  />
                  {errors.readingConverted && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.readingConverted}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Total Score Live Calculation Display */}
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Calculator className="w-4 h-4 text-slate-500" />
                <span>Calculated Total Score:</span>
              </div>
              <div className="text-base font-bold font-mono text-slate-900">
                {calculatedTotal}{' '}
                <span className="text-xs font-normal text-slate-500">/ 990</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
