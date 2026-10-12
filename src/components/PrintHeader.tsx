import React from 'react';
import { StudentWithRank } from '../types/student';

interface PrintHeaderProps {
  students: StudentWithRank[];
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ students }) => {
  const avg =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.totalScore, 0) / students.length)
      : 0;

  const listeningAvg =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.listeningConverted, 0) / students.length)
      : 0;

  const readingAvg =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + s.readingConverted, 0) / students.length)
      : 0;

  return (
    <div className="print-only mb-6 border-b-2 border-slate-900 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
            TOEIC Practice Examination Score Report
          </h1>
          <div className="text-xs text-slate-600 mt-0.5">
            Institutional Diagnostic Testing &bull; Official Student Performance Leaderboard
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          <div>Report Generated: {new Date().toLocaleDateString()}</div>
          <div>Examination: TOEIC Practice Test</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-xs border border-slate-300 p-2 bg-slate-50 font-mono">
        <div>Total Students: <strong>{students.length}</strong></div>
        <div>Class Average: <strong>{avg} / 990</strong></div>
        <div>Listening Mean: <strong>{listeningAvg} / 495</strong></div>
        <div>Reading Mean: <strong>{readingAvg} / 495</strong></div>
      </div>
    </div>
  );
};
