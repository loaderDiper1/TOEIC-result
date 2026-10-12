import { StudentWithRank } from '../types/student';

/**
 * Generates and downloads a clean CSV file of the student rankings.
 * Includes UTF-8 BOM for flawless Excel compatibility.
 */
export function exportRankingsToCSV(
  students: StudentWithRank[],
  filename: string = 'TOEIC_Student_Rankings.csv'
): void {
  const headers = [
    'Rank',
    'Student Name',
    'Listening Raw Score',
    'Listening Converted Score',
    'Reading Raw Score',
    'Reading Converted Score',
    'Total Score',
  ];

  const rows = students.map((s) => [
    s.rank,
    `"${s.name.replace(/"/g, '""')}"`,
    s.listeningRaw,
    s.listeningConverted,
    s.readingRaw,
    s.readingConverted,
    s.totalScore,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
