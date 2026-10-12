import { StudentRecord, StudentWithRank, SortField, SortDirection } from '../types/student';
import { resolveStudentPhotoUrl } from './staticStudentPhotos';

/**
 * Calculates standard competition rankings (1224 ranking) based solely on total converted score.
 * Total score = Listening Converted + Reading Converted.
 * If students have equal total score, they share the same rank, and the next rank skips appropriately.
 */
export function calculateRankings(
  students: StudentRecord[],
  photos: Record<string, string> = {},
  staticPhotos: Record<string, string> = {}
): StudentWithRank[] {
  // Compute totals
  const withTotals = students.map((s) => ({
    ...s,
    totalScore: Number(s.listeningConverted) + Number(s.readingConverted),
    photoUrl: resolveStudentPhotoUrl(s.name, photos[s.id], staticPhotos),
  }));

  // Sort descending by total score for competition ranking assignment
  // In case of equal score, keep stable order by name
  const sortedByTotal = [...withTotals].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate score frequencies to detect ties
  const scoreCounts: Record<number, number> = {};
  sortedByTotal.forEach((s) => {
    scoreCounts[s.totalScore] = (scoreCounts[s.totalScore] || 0) + 1;
  });

  // Assign standard competition ranks:
  // Rank of a student = 1 + count of students with strictly higher totalScore
  const rankedStudents: StudentWithRank[] = sortedByTotal.map((student) => {
    const strictlyHigherCount = sortedByTotal.filter(
      (other) => other.totalScore > student.totalScore
    ).length;
    const rank = strictlyHigherCount + 1;
    const isTied = (scoreCounts[student.totalScore] || 0) > 1;

    return {
      ...student,
      rank,
      isTied,
    };
  });

  return rankedStudents;
}

/**
 * Sorts ranked students by the selected column and direction while preserving calculated official ranks.
 */
export function sortStudents(
  students: StudentWithRank[],
  field: SortField,
  direction: SortDirection
): StudentWithRank[] {
  return [...students].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'rank':
        comparison = a.rank - b.rank;
        if (comparison === 0) comparison = a.name.localeCompare(b.name);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'listeningRaw':
        comparison = a.listeningRaw - b.listeningRaw;
        break;
      case 'listeningConverted':
        comparison = a.listeningConverted - b.listeningConverted;
        break;
      case 'readingRaw':
        comparison = a.readingRaw - b.readingRaw;
        break;
      case 'readingConverted':
        comparison = a.readingConverted - b.readingConverted;
        break;
      case 'totalScore':
        comparison = a.totalScore - b.totalScore;
        break;
      default:
        comparison = a.rank - b.rank;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filter students by name search query (case-insensitive)
 */
export function filterStudents(
  students: StudentWithRank[],
  searchQuery: string
): StudentWithRank[] {
  if (!searchQuery.trim()) return students;
  const q = searchQuery.toLowerCase().trim();
  return students.filter((s) => s.name.toLowerCase().includes(q));
}

/**
 * Validation rules for TOEIC scores
 */
export interface ScoreValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    listeningRaw?: string;
    listeningConverted?: string;
    readingRaw?: string;
    readingConverted?: string;
  };
}

export function validateStudentScores(data: {
  name: string;
  listeningRaw: number | string;
  listeningConverted: number | string;
  readingRaw: number | string;
  readingConverted: number | string;
}): ScoreValidationResult {
  const errors: ScoreValidationResult['errors'] = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Student name is required';
  }

  const lRaw = Number(data.listeningRaw);
  if (isNaN(lRaw) || lRaw < 0 || lRaw > 100 || !Number.isInteger(lRaw)) {
    errors.listeningRaw = 'Listening raw score must be an integer between 0 and 100';
  }

  const lConv = Number(data.listeningConverted);
  if (isNaN(lConv) || lConv < 5 || lConv > 495) {
    errors.listeningConverted = 'Listening converted score must be between 5 and 495';
  }

  const rRaw = Number(data.readingRaw);
  if (isNaN(rRaw) || rRaw < 0 || rRaw > 100 || !Number.isInteger(rRaw)) {
    errors.readingRaw = 'Reading raw score must be an integer between 0 and 100';
  }

  const rConv = Number(data.readingConverted);
  if (isNaN(rConv) || rConv < 5 || rConv > 495) {
    errors.readingConverted = 'Reading converted score must be between 5 and 495';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates initials for student avatar fallback
 */
export function getStudentInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
