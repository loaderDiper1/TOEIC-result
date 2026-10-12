import React, { useState } from 'react';
import { X, UserPlus, Calculator } from 'lucide-react';
import { StudentRecord } from '../types/student';
import { validateStudentScores } from '../utils/ranking';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: StudentRecord) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [listeningRaw, setListeningRaw] = useState<number | string>(70);
  const [listeningConverted, setListeningConverted] = useState<number | string>(350);
  const [readingRaw, setReadingRaw] = useState<number | string>(70);
  const [readingConverted, setReadingConverted] = useState<number | string>(350);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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

    const newId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    onAddStudent({
      id: newId,
      name: name.trim(),
      listeningRaw: Number(listeningRaw),
      listeningConverted: Number(listeningConverted),
      readingRaw: Number(readingRaw),
      readingConverted: Number(readingConverted),
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Add New Student Result
            </h2>
            <p className="text-xs text-slate-500">
              Enter test scores to insert student into ranking table
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1 focus:outline-hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. Alex Johnson"
                required
              />
              {errors.name && (
                <div className="text-[11px] text-red-600 mt-1">{errors.name}</div>
              )}
            </div>

            <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 space-y-3">
              <div className="text-xs font-semibold text-blue-900 flex items-center justify-between">
                <span>Listening Comprehension</span>
                <span className="text-[10px] text-blue-600 font-normal">Max: 495 pts</span>
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
                    value={listeningRaw}
                    onChange={(e) => setListeningRaw(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded focus:outline-hidden"
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
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold text-blue-900 bg-white border border-slate-300 rounded focus:outline-hidden"
                    required
                  />
                  {errors.listeningConverted && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.listeningConverted}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 space-y-3">
              <div className="text-xs font-semibold text-indigo-900 flex items-center justify-between">
                <span>Reading Comprehension</span>
                <span className="text-[10px] text-indigo-600 font-normal">Max: 495 pts</span>
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
                    value={readingRaw}
                    onChange={(e) => setReadingRaw(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded focus:outline-hidden"
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
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-semibold text-indigo-900 bg-white border border-slate-300 rounded focus:outline-hidden"
                    required
                  />
                  {errors.readingConverted && (
                    <div className="text-[10px] text-red-600 mt-0.5">{errors.readingConverted}</div>
                  )}
                </div>
              </div>
            </div>

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
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
