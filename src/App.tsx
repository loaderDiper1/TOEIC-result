import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { RankingTable } from './components/RankingTable';
import { PrintHeader } from './components/PrintHeader';
import {
  StudentRecord,
  SortField,
  SortDirection,
} from './types/student';
import {
  calculateRankings,
  sortStudents,
  filterStudents,
} from './utils/ranking';
import { getStaticStudentPhotos } from './utils/staticStudentPhotos';
import {
  loadStoredStudents,
  saveStoredStudents,
  loadAllStudentPhotos,
} from './utils/storage';

export default function App() {
  // Static bundled photos map from src/assets/students/
  const staticPhotosMap = useMemo(() => getStaticStudentPhotos(), []);

  // 1. Data state
  const [students, setStudents] = useState<StudentRecord[]>(() => loadStoredStudents());
  const [photos, setPhotos] = useState<Record<string, string>>({});

  // 2. UI interaction state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Load photos from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    loadAllStudentPhotos()
      .then((loadedPhotos) => {
        if (isMounted) {
          setPhotos(loadedPhotos);
        }
      })
      .catch((err) => {
        console.warn('Failed to load student photos from storage:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync student records changes to localStorage
  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  // Derived official competition rankings (with static and uploaded photos matched)
  const rankedStudents = useMemo(() => {
    return calculateRankings(students, photos, staticPhotosMap);
  }, [students, photos, staticPhotosMap]);

  // Filter and sort for table display
  const displayedStudents = useMemo(() => {
    const filtered = filterStudents(rankedStudents, searchQuery);
    return sortStudents(filtered, sortField, sortDirection);
  }, [rankedStudents, searchQuery, sortField, sortDirection]);

  // Sorting toggle
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Default to descending for score columns, ascending for rank/name
      if (
        field === 'totalScore' ||
        field === 'listeningConverted' ||
        field === 'readingConverted' ||
        field === 'listeningRaw' ||
        field === 'readingRaw'
      ) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Printable Header (Visible only when printing) */}
        <PrintHeader students={rankedStudents} />

        {/* Clean Header & Metric Summary Strip */}
        <Header
          students={rankedStudents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Clean Ranking Table */}
        <RankingTable
          students={displayedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      </main>
    </div>
  );
}
