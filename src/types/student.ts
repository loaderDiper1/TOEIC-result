export interface StudentRecord {
  id: string;
  name: string;
  listeningRaw: number;
  listeningConverted: number;
  readingRaw: number;
  readingConverted: number;
}

export interface StudentWithRank extends StudentRecord {
  totalScore: number;
  rank: number;
  isTied: boolean;
  photoUrl?: string;
}

export type SortField =
  | 'rank'
  | 'name'
  | 'listeningRaw'
  | 'listeningConverted'
  | 'readingRaw'
  | 'readingConverted'
  | 'totalScore';

export type SortDirection = 'asc' | 'desc';
