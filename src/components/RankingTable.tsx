import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from 'lucide-react';
import { StudentWithRank, SortField, SortDirection } from '../types/student';
import { getStudentInitials } from '../utils/ranking';

interface RankingTableProps {
  students: StudentWithRank[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  students,
  sortField,
  sortDirection,
  onSortChange,
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300 ml-0.5 sm:ml-1 inline-block" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 ml-0.5 sm:ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 ml-0.5 sm:ml-1 inline-block" />
    );
  };

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
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      {/* Mobile Swipe Notice */}
      <div className="sm:hidden px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-[11px] text-blue-900 flex items-center justify-between no-print">
        <span className="font-medium text-slate-600">Student column locked</span>
        <span className="font-semibold flex items-center gap-0.5 text-blue-700">
          Swipe right for scores <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
          {/* Grouped Table Header */}
          <thead>
            {/* Top Header Row */}
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
              {/* Unified Sticky Column: Rank & Student Name (100% solid opaque) */}
              <th
                rowSpan={2}
                className="sticky left-0 z-30 bg-slate-100 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] py-2.5 px-2.5 sm:px-3 w-[140px] sm:w-[185px] min-w-[135px] sm:min-w-[180px] select-none"
              >
                <div className="flex items-center justify-between text-slate-700 text-[11px] font-semibold uppercase tracking-wider">
                  <div
                    onClick={() => onSortChange('rank')}
                    className="inline-flex items-center gap-0.5 cursor-pointer hover:text-blue-700 transition-colors"
                    title="Sort by Rank"
                  >
                    <span>#</span>
                    {renderSortIndicator('rank')}
                  </div>
                  <div
                    onClick={() => onSortChange('name')}
                    className="inline-flex items-center gap-0.5 cursor-pointer hover:text-blue-700 transition-colors"
                    title="Sort by Student Name"
                  >
                    <span>Student</span>
                    {renderSortIndicator('name')}
                  </div>
                </div>
              </th>

              {/* Listening Section (Colspan 2) */}
              <th
                colSpan={2}
                className="py-2 px-2.5 sm:px-3 border-r border-slate-200 text-center bg-sky-50 text-sky-900 border-b border-sky-200 font-bold min-w-[160px] sm:min-w-[190px]"
              >
                Listening (Max 495)
              </th>

              {/* Reading Section (Colspan 2) */}
              <th
                colSpan={2}
                className="py-2 px-2.5 sm:px-3 border-r border-slate-200 text-center bg-purple-50 text-purple-900 border-b border-purple-200 font-bold min-w-[160px] sm:min-w-[190px]"
              >
                Reading (Max 495)
              </th>

              {/* Total Score Column */}
              <th
                rowSpan={2}
                onClick={() => onSortChange('totalScore')}
                className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-center cursor-pointer select-none hover:bg-slate-200 transition-colors bg-slate-100 w-28 sm:w-34 min-w-[100px]"
                title="Sort by Total Score"
              >
                <div className="inline-flex items-center justify-center font-bold text-slate-800">
                  <span>Total</span>
                  {renderSortIndicator('totalScore')}
                </div>
                <div className="text-[10px] font-normal text-slate-400 normal-case">
                  /990
                </div>
              </th>
            </tr>

            {/* Sub-Header Row for Raw and Converted Scores */}
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-500">
              {/* Listening Raw */}
              <th
                onClick={() => onSortChange('listeningRaw')}
                className="py-1.5 sm:py-2 px-2 border-r border-slate-200 w-16 sm:w-20 text-right cursor-pointer select-none hover:bg-sky-100/60 transition-colors bg-sky-50/50"
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
                className="py-1.5 sm:py-2 px-2.5 border-r border-slate-200 w-28 sm:w-34 cursor-pointer select-none hover:bg-sky-100/80 transition-colors bg-sky-50"
                title="Sort by Listening Converted Score"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900">Converted</span>
                  {renderSortIndicator('listeningConverted')}
                </div>
                <div className="text-[9px] text-sky-600 font-normal">5–495</div>
              </th>

              {/* Reading Raw */}
              <th
                onClick={() => onSortChange('readingRaw')}
                className="py-1.5 sm:py-2 px-2 border-r border-slate-200 w-16 sm:w-20 text-right cursor-pointer select-none hover:bg-purple-100/60 transition-colors bg-purple-50/50"
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
                className="py-1.5 sm:py-2 px-2.5 border-r border-slate-200 w-28 sm:w-34 cursor-pointer select-none hover:bg-purple-100/80 transition-colors bg-purple-50"
                title="Sort by Reading Converted Score"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">Converted</span>
                  {renderSortIndicator('readingConverted')}
                </div>
                <div className="text-[9px] text-purple-600 font-normal">5–495</div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No students found matching your search.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const lPct = Math.min(100, Math.round((student.listeningConverted / 495) * 100));
                const rPct = Math.min(100, Math.round((student.readingConverted / 495) * 100));
                const scoreStyle = getTotalScoreStyle(student.totalScore);

                return (
                  <tr
                    key={student.id}
                    className="group hover:bg-slate-50 transition-colors page-break-inside-avoid relative"
                  >
                    {/* Unified Sticky Rank & Student Cell (Clean, no ellipsis menu) */}
                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] py-1.5 px-2 sm:py-2 sm:px-2.5 transition-colors">
                      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                        {/* Rank number circle with tied indicator */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="inline-flex items-center justify-center font-mono font-semibold text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 text-slate-700 shrink-0">
                            {student.rank}
                          </span>
                          {student.isTied && (
                            <span
                              className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded-xs"
                              title="Tied Rank"
                            >
                              T
                            </span>
                          )}
                        </div>

                        {/* Student Avatar */}
                        <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-200">
                              {getStudentInitials(student.name)}
                            </div>
                          )}
                        </div>

                        {/* Student Name */}
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 truncate block text-xs sm:text-[13px]">
                            {student.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Listening Raw Score */}
                    <td className="py-1.5 sm:py-2 px-2 text-right font-mono border-r border-slate-200 bg-sky-50/20">
                      <span className="inline-block px-1 py-0.5 rounded text-sky-800 bg-sky-100/60 font-semibold text-xs">
                        {student.listeningRaw}
                      </span>
                    </td>

                    {/* Listening Converted Score */}
                    <td className="py-1.5 sm:py-2 px-2.5 border-r border-slate-200 bg-sky-50/40">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold font-mono text-sky-800 text-xs sm:text-[13px]">
                          {student.listeningConverted}
                        </span>
                        <span className="text-[10px] font-medium text-sky-600/80">{lPct}%</span>
                      </div>
                      <div className="w-full bg-sky-200/50 h-1.5 rounded-full mt-1 overflow-hidden shadow-2xs">
                        <div
                          className="bg-linear-to-r from-blue-600 via-sky-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${lPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Reading Raw Score */}
                    <td className="py-1.5 sm:py-2 px-2 text-right font-mono border-r border-slate-200 bg-purple-50/20">
                      <span className="inline-block px-1 py-0.5 rounded text-purple-800 bg-purple-100/60 font-semibold text-xs">
                        {student.readingRaw}
                      </span>
                    </td>

                    {/* Reading Converted Score */}
                    <td className="py-1.5 sm:py-2 px-2.5 border-r border-slate-200 bg-purple-50/40">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="font-bold font-mono text-purple-800 text-xs sm:text-[13px]">
                          {student.readingConverted}
                        </span>
                        <span className="text-[10px] font-medium text-purple-600/80">{rPct}%</span>
                      </div>
                      <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-1 overflow-hidden shadow-2xs">
                        <div
                          className="bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${rPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Total Converted Score */}
                    <td className="py-1.5 sm:py-2 px-2.5 text-center bg-slate-50">
                      <div className="inline-flex items-center">
                        <span
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-mono text-xs sm:text-sm font-bold border shadow-2xs ${scoreStyle.badge}`}
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

      {/* Table Footer with Color Legend (Clean, Hover/tap text removed) */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-600">Tiers:</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          850+ Advanced
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-800 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          750–845 High
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          600–745 Mid
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          450–595 Modest
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-800 bg-orange-50 border border-orange-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          300–445 Elem
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-800 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          &lt;300 Basic
        </span>
      </div>
    </div>
  );
};
