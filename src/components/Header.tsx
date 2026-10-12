import React from 'react';
import { Download, Printer, RotateCcw, Search, UserPlus, Users, BookOpen, BarChart3, Headphones, Camera } from 'lucide-react';
import { StudentWithRank } from '../types/student';

interface HeaderProps {
  students: StudentWithRank[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenResetModal: () => void;
  onOpenAddModal: () => void;
  onOpenBatchPhotosModal: () => void;
  onExportCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  searchQuery,
  onSearchChange,
  onOpenResetModal,
  onOpenAddModal,
  onOpenBatchPhotosModal,
  onExportCSV,
}) => {
  const studentCount = students.length;

  const averageScore =
    studentCount > 0
      ? Math.round(students.reduce((acc, s) => acc + s.totalScore, 0) / studentCount)
      : 0;

  const listeningAvg =
    studentCount > 0
      ? Math.round(students.reduce((acc, s) => acc + s.listeningConverted, 0) / studentCount)
      : 0;

  const readingAvg =
    studentCount > 0
      ? Math.round(students.reduce((acc, s) => acc + s.readingConverted, 0) / studentCount)
      : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="mb-6 space-y-4">
      {/* Title & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center text-white font-semibold text-xs tracking-wider shadow-xs">
              ETS
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
              TOEIC Student Ranking
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Previous Examination Results &bull; Official Practice Diagnostic Test
          </p>
        </div>

        {/* Global Toolbar buttons (hidden during print) */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={onOpenBatchPhotosModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md shadow-2xs hover:bg-blue-100 hover:text-blue-800 active:bg-blue-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            title="Batch upload and match student photos by filename"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Photos</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            title="Export full leaderboard as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onOpenResetModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md shadow-2xs hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:bg-red-100 transition-colors focus:outline-hidden"
            title="Reset to initial 19 student records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 rounded-md shadow-2xs hover:bg-blue-800 active:bg-blue-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip - Removed Top Rank and Highest Score as requested */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
        {/* Total Students */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded bg-slate-100 text-slate-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Students
            </div>
            <div className="text-base font-semibold text-slate-900 leading-tight">
              {studentCount}
            </div>
          </div>
        </div>

        {/* Exam Type */}
        <div className="flex items-center gap-3 px-2 border-l border-slate-100">
          <div className="p-2 rounded bg-blue-50 text-blue-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Exam Type
            </div>
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              TOEIC Practice Test
            </div>
            <div className="text-[10px] text-slate-400">
              Standard 200 Questions
            </div>
          </div>
        </div>

        {/* Class Average Score */}
        <div className="flex items-center gap-3 px-2 sm:border-l border-slate-100">
          <div className="p-2 rounded bg-indigo-50 text-indigo-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Class Average
            </div>
            <div className="text-base font-semibold text-indigo-700 leading-tight">
              {averageScore} <span className="text-[11px] font-normal text-slate-400">/ 990</span>
            </div>
          </div>
        </div>

        {/* Section Averages */}
        <div className="flex items-center gap-3 px-2 border-l border-slate-100">
          <div className="p-2 rounded bg-sky-50 text-sky-700">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Section Means
            </div>
            <div className="text-xs font-medium text-slate-700 leading-tight">
              <span className="text-sky-700 font-semibold">L: {listeningAvg}</span> &bull;{' '}
              <span className="text-purple-700 font-semibold">R: {readingAvg}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Avg converted pts
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar (hidden in print) */}
      <div className="flex items-center justify-between gap-3 no-print">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student by name..."
            className="w-full pl-8 pr-7 py-1.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-md placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">{students.length}</span> students
        </div>
      </div>
    </header>
  );
};
