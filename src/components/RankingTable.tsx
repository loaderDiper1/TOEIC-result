import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Camera,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { StudentWithRank, SortField, SortDirection } from '../types/student';
import { getStudentInitials } from '../utils/ranking';

interface RankingTableProps {
  students: StudentWithRank[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onOpenPhotoModal: (student: StudentWithRank) => void;
  onOpenEditModal: (student: StudentWithRank) => void;
  onDeleteStudent?: (studentId: string, studentName: string) => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  students,
  sortField,
  sortDirection,
  onSortChange,
  onOpenPhotoModal,
  onOpenEditModal,
  onDeleteStudent,
}) => {
  // State for which student's 3-dot dropdown menu is currently open
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        activeMenuStudentId &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setActiveMenuStudentId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenuStudentId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuStudentId]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    );
  };

  // Score tier styling for colorful total scores
  const getTotalScoreStyle = (score: number) => {
    if (score >= 850) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20',
        dot: 'bg-emerald-500',
        label: 'Advanced',
      };
    }
    if (score >= 750) {
      return {
        badge: 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400/20',
        dot: 'bg-blue-500',
        label: 'High Proficiency',
      };
    }
    if (score >= 600) {
      return {
        badge: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-400/20',
        dot: 'bg-indigo-500',
        label: 'Intermediate',
      };
    }
    if (score >= 450) {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20',
        dot: 'bg-amber-500',
        label: 'Modest',
      };
    }
    if (score >= 300) {
      return {
        badge: 'bg-orange-50 text-orange-800 border-orange-300 ring-1 ring-orange-400/20',
        dot: 'bg-orange-500',
        label: 'Elementary',
      };
    }
    return {
      badge: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400/20',
      dot: 'bg-rose-500',
      label: 'Basic',
    };
  };

  return (
    <div
      ref={menuContainerRef}
      className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-visible"
    >
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
          {/* Grouped Table Header */}
          <thead>
            {/* Top Header Row */}
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
              {/* Rank Column */}
              <th
                rowSpan={2}
                onClick={() => onSortChange('rank')}
                className="py-2.5 px-3 border-r border-slate-200 w-14 text-center cursor-pointer select-none hover:bg-slate-200/70 transition-colors"
                title="Sort by Rank"
              >
                <div className="inline-flex items-center justify-center">
                  <span>Rank</span>
                  {renderSortIndicator('rank')}
                </div>
              </th>

              {/* Photo & Name Column (With hover 3-dot manage menu) */}
              <th
                rowSpan={2}
                onClick={() => onSortChange('name')}
                className="py-2.5 px-3 border-r border-slate-200 min-w-[210px] sm:min-w-[240px] cursor-pointer select-none hover:bg-slate-200/70 transition-colors"
                title="Sort by Student Name"
              >
                <div className="inline-flex items-center">
                  <span>Student Name</span>
                  {renderSortIndicator('name')}
                </div>
              </th>

              {/* Listening Section (Colspan 2) */}
              <th
                colSpan={2}
                className="py-2 px-3 border-r border-slate-200 text-center bg-sky-50 text-sky-900 border-b border-sky-200 font-bold"
              >
                Listening Section (Max 495)
              </th>

              {/* Reading Section (Colspan 2) */}
              <th
                colSpan={2}
                className="py-2 px-3 border-r border-slate-200 text-center bg-purple-50 text-purple-900 border-b border-purple-200 font-bold"
              >
                Reading Section (Max 495)
              </th>

              {/* Total Score Column (Final rightmost column, Manage column removed) */}
              <th
                rowSpan={2}
                onClick={() => onSortChange('totalScore')}
                className="py-2.5 px-3 text-center cursor-pointer select-none hover:bg-slate-200/70 transition-colors bg-slate-100/80 w-32 sm:w-36"
                title="Sort by Total Score"
              >
                <div className="inline-flex items-center justify-center font-bold text-slate-800">
                  <span>Total Score</span>
                  {renderSortIndicator('totalScore')}
                </div>
                <div className="text-[10px] font-normal text-slate-400 normal-case">
                  (Scale: 10–990)
                </div>
              </th>
            </tr>

            {/* Sub-Header Row for Raw and Converted Scores */}
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-500">
              {/* Listening Raw */}
              <th
                onClick={() => onSortChange('listeningRaw')}
                className="py-2 px-2.5 border-r border-slate-200 w-20 text-right cursor-pointer select-none hover:bg-sky-100/40 transition-colors bg-sky-50/30"
                title="Sort by Listening Raw Score"
              >
                <div className="inline-flex items-center justify-end">
                  <span className="text-sky-900 font-semibold">Raw</span>
                  {renderSortIndicator('listeningRaw')}
                </div>
                <div className="text-[9px] text-sky-600/70 font-normal">/100</div>
              </th>

              {/* Listening Converted */}
              <th
                onClick={() => onSortChange('listeningConverted')}
                className="py-2 px-3 border-r border-slate-200 w-36 cursor-pointer select-none hover:bg-sky-100/60 transition-colors bg-sky-50/60"
                title="Sort by Listening Converted Score"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900">Converted</span>
                  {renderSortIndicator('listeningConverted')}
                </div>
                <div className="text-[9px] text-sky-600 font-normal">Scale: 5–495</div>
              </th>

              {/* Reading Raw */}
              <th
                onClick={() => onSortChange('readingRaw')}
                className="py-2 px-2.5 border-r border-slate-200 w-20 text-right cursor-pointer select-none hover:bg-purple-100/40 transition-colors bg-purple-50/30"
                title="Sort by Reading Raw Score"
              >
                <div className="inline-flex items-center justify-end">
                  <span className="text-purple-900 font-semibold">Raw</span>
                  {renderSortIndicator('readingRaw')}
                </div>
                <div className="text-[9px] text-purple-600/70 font-normal">/100</div>
              </th>

              {/* Reading Converted */}
              <th
                onClick={() => onSortChange('readingConverted')}
                className="py-2 px-3 border-r border-slate-200 w-36 cursor-pointer select-none hover:bg-purple-100/60 transition-colors bg-purple-50/60"
                title="Sort by Reading Converted Score"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Converted</span>
                  {renderSortIndicator('readingConverted')}
                </div>
                <div className="text-[9px] text-purple-600 font-normal">Scale: 5–495</div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const lPct = Math.min(100, Math.round((student.listeningConverted / 495) * 100));
                const rPct = Math.min(100, Math.round((student.readingConverted / 495) * 100));
                const isMenuOpen = activeMenuStudentId === student.id;
                const scoreStyle = getTotalScoreStyle(student.totalScore);

                return (
                  <tr
                    key={student.id}
                    className="group hover:bg-slate-50/90 transition-colors page-break-inside-avoid relative"
                  >
                    {/* Rank Cell */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-200">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center font-mono font-semibold text-xs w-6 h-6 rounded-full bg-slate-100 text-slate-700">
                          {student.rank}
                        </span>
                      </div>
                    </td>

                    {/* Student Photo & Name Cell with 3-dot hover manage trigger */}
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Circular Avatar */}
                          <div
                            onClick={() => onOpenPhotoModal(student)}
                            className="relative group/avatar shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs focus:outline-hidden"
                            title="Click to change photo"
                          >
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[11px] font-semibold text-slate-600 bg-slate-200/80">
                                {getStudentInitials(student.name)}
                              </div>
                            )}

                            {/* Camera hover icon */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity no-print">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          {/* Student Name */}
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 truncate">
                              {student.name}
                            </span>
                          </div>
                        </div>

                        {/* 3-Dot Line next to name - appears on hover / tap */}
                        <div className="relative shrink-0 no-print">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuStudentId(isMenuOpen ? null : student.id);
                            }}
                            className={`p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-all focus:outline-hidden ${
                              isMenuOpen
                                ? 'opacity-100 bg-slate-200 text-slate-800'
                                : 'opacity-60 sm:opacity-0 sm:group-hover:opacity-100'
                            }`}
                            title="Manage student"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Floating Manage Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute left-full sm:left-auto sm:right-0 top-0 ml-1 sm:ml-0 sm:mt-6 z-50 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                {student.name}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentId(null);
                                  onOpenEditModal(student);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Scores</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStudentId(null);
                                  onOpenPhotoModal(student);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                              >
                                <Camera className="w-3.5 h-3.5 text-slate-500" />
                                <span>Manage Photo</span>
                              </button>

                              {onDeleteStudent && (
                                <>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuStudentId(null);
                                      onDeleteStudent(student.id, student.name);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span>Delete Student</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Listening Raw Score */}
                    <td className="py-2.5 px-2.5 text-right font-mono border-r border-slate-200 bg-sky-50/20">
                      <span className="inline-block px-1.5 py-0.5 rounded text-sky-800 bg-sky-100/60 font-semibold text-xs">
                        {student.listeningRaw}
                      </span>
                    </td>

                    {/* Listening Converted Score + Colorful Gradient Progress Bar */}
                    <td className="py-2.5 px-3 border-r border-slate-200 bg-sky-50/40">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold font-mono text-sky-800 text-xs sm:text-[13px]">
                          {student.listeningConverted}
                        </span>
                        <span className="text-[10px] font-medium text-sky-600/80">{lPct}%</span>
                      </div>
                      {/* Gradient progress bar */}
                      <div className="w-full bg-sky-200/50 h-1.5 rounded-full mt-1 overflow-hidden shadow-2xs">
                        <div
                          className="bg-linear-to-r from-blue-600 via-sky-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${lPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Reading Raw Score */}
                    <td className="py-2.5 px-2.5 text-right font-mono border-r border-slate-200 bg-purple-50/20">
                      <span className="inline-block px-1.5 py-0.5 rounded text-purple-800 bg-purple-100/60 font-semibold text-xs">
                        {student.readingRaw}
                      </span>
                    </td>

                    {/* Reading Converted Score + Colorful Gradient Progress Bar */}
                    <td className="py-2.5 px-3 border-r border-slate-200 bg-purple-50/40">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold font-mono text-purple-800 text-xs sm:text-[13px]">
                          {student.readingConverted}
                        </span>
                        <span className="text-[10px] font-medium text-purple-600/80">{rPct}%</span>
                      </div>
                      {/* Gradient progress bar */}
                      <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-1 overflow-hidden shadow-2xs">
                        <div
                          className="bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${rPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Total Converted Score with Vibrant Tier Badge */}
                    <td className="py-2.5 px-3 text-center bg-slate-50/60">
                      <div className="inline-flex items-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs sm:text-sm font-bold border shadow-2xs ${scoreStyle.badge}`}
                          title={`Score Tier: ${scoreStyle.label}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scoreStyle.dot}`} />
                          <span>{student.totalScore}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Color Legend & Score scale guide */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
        {/* Score Tier Color Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-semibold text-slate-600">Total Score Tiers:</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            850+ Advanced
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            750–845 High
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            600–745 Mid
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            450–595 Modest
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-800 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            300–445 Elem
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            &lt;300 Basic
          </span>
        </div>

        <div className="text-slate-400 font-mono text-[10px]">
          Hover student name for options (⋮)
        </div>
      </div>
    </div>
  );
};
