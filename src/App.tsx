import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { RankingTable } from './components/RankingTable';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { BatchPhotoUploadModal } from './components/BatchPhotoUploadModal';
import { EditStudentModal } from './components/EditStudentModal';
import { AddStudentModal } from './components/AddStudentModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PrintHeader } from './components/PrintHeader';
import {
  StudentRecord,
  StudentWithRank,
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
  resetStoredStudents,
  loadAllStudentPhotos,
  saveStudentPhoto,
  deleteStudentPhoto,
  clearAllStudentPhotos,
} from './utils/storage';
import { exportRankingsToCSV } from './utils/exportCsv';

export default function App() {
  // Static bundled photos map from src/assets/students/
  const staticPhotosMap = useMemo(() => getStaticStudentPhotos(), []);

  // 1. Data state
  const [students, setStudents] = useState<StudentRecord[]>(() => loadStoredStudents());
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [, setIsPhotosLoaded] = useState(false);

  // 2. UI interaction state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // 3. Modal controls
  const [photoModalStudent, setPhotoModalStudent] = useState<StudentWithRank | null>(null);
  const [editModalStudent, setEditModalStudent] = useState<StudentWithRank | null>(null);
  const [isBatchPhotoModalOpen, setIsBatchPhotoModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load photos from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    loadAllStudentPhotos()
      .then((loadedPhotos) => {
        if (isMounted) {
          setPhotos(loadedPhotos);
          setIsPhotosLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load student photos from storage:', err);
        if (isMounted) setIsPhotosLoaded(true);
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

  // Photo handlers
  const handleSavePhoto = async (studentId: string, photoDataUrl: string) => {
    await saveStudentPhoto(studentId, photoDataUrl);
    setPhotos((prev) => ({ ...prev, [studentId]: photoDataUrl }));
    showToast('Student photo updated successfully.');
  };

  const handleDeletePhoto = async (studentId: string) => {
    await deleteStudentPhoto(studentId);
    setPhotos((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    showToast('Student photo removed.');
  };

  // Student CRUD handlers
  const handleSaveStudent = (updated: StudentRecord) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    showToast(`Updated record for ${updated.name}. Rankings recalculated.`);
  };

  const handleAddStudent = (newStudent: StudentRecord) => {
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`Added ${newStudent.name} to the ranking table.`);
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete ${studentName}'s record?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      handleDeletePhoto(studentId);
      showToast(`Removed ${studentName} from records.`);
    }
  };

  // Batch photo import handler
  const handleBatchApplyPhotos = async (matchedPhotos: Record<string, string>) => {
    for (const [studentId, photoDataUrl] of Object.entries(matchedPhotos)) {
      await saveStudentPhoto(studentId, photoDataUrl);
    }
    setPhotos((prev) => ({ ...prev, ...matchedPhotos }));
    showToast(`Successfully matched and updated ${Object.keys(matchedPhotos).length} student photos!`);
  };

  // Reset handler
  const handleConfirmReset = async (clearPhotos: boolean) => {
    const defaultStudents = resetStoredStudents();
    setStudents(defaultStudents);
    if (clearPhotos) {
      await clearAllStudentPhotos();
      setPhotos({});
    }
    setSearchQuery('');
    setSortField('rank');
    setSortDirection('asc');
    setIsResetModalOpen(false);
    showToast('Reset completed: Original 19 student records restored.');
  };

  // CSV export
  const handleExportCSV = () => {
    exportRankingsToCSV(
      displayedStudents,
      `TOEIC_Student_Rankings_${new Date().toISOString().slice(0, 10)}.csv`
    );
    showToast('CSV report downloaded.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Printable Header (Visible only when printing) */}
        <PrintHeader students={rankedStudents} />

        {/* Header & Metric Summary Strip */}
        <Header
          students={rankedStudents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenBatchPhotosModal={() => setIsBatchPhotoModalOpen(true)}
          onExportCSV={handleExportCSV}
        />

        {/* Main Ranking Table */}
        <RankingTable
          students={displayedStudents}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onOpenPhotoModal={(student) => setPhotoModalStudent(student)}
          onOpenEditModal={(student) => setEditModalStudent(student)}
          onDeleteStudent={handleDeleteStudent}
        />

        {/* Academic notes / Instructor footer */}
        <footer className="mt-6 pt-4 border-t border-slate-200 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            TOEIC Institutional Practice Evaluation &bull; English Language Academic Dept.
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Scores scale: Listening (5–495) + Reading (5–495) = Total (10–990)
          </div>
        </footer>
      </main>

      {/* Toast Notification (Bottom right) */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-md shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 no-print">
          {toastMessage}
        </div>
      )}

      {/* Batch Multi-Photo Matcher Modal */}
      <BatchPhotoUploadModal
        isOpen={isBatchPhotoModalOpen}
        onClose={() => setIsBatchPhotoModalOpen(false)}
        students={rankedStudents}
        onApplyPhotos={handleBatchApplyPhotos}
      />

      {/* Single Photo Upload Modal */}
      <PhotoUploadModal
        student={photoModalStudent}
        isOpen={!!photoModalStudent}
        onClose={() => setPhotoModalStudent(null)}
        onSavePhoto={handleSavePhoto}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Edit Scores Modal */}
      <EditStudentModal
        student={editModalStudent}
        isOpen={!!editModalStudent}
        onClose={() => setEditModalStudent(null)}
        onSaveStudent={handleSaveStudent}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={handleAddStudent}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
