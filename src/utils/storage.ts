import { StudentRecord } from '../types/student';
import { INITIAL_STUDENTS } from '../data/initialStudents';

const STUDENTS_STORAGE_KEY = 'toeic_student_records_v1';
const DB_NAME = 'toeic_student_dashboard_db';
const DB_VERSION = 1;
const PHOTO_STORE = 'student_photos';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'studentId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Load student records from localStorage, falling back to INITIAL_STUDENTS
 */
export function loadStoredStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return INITIAL_STUDENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to read students from localStorage:', err);
  }
  return INITIAL_STUDENTS;
}

/**
 * Save student records to localStorage
 */
export function saveStoredStudents(students: StudentRecord[]): void {
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (err) {
    console.warn('Failed to save students to localStorage:', err);
  }
}

/**
 * Reset student records to initial dataset
 */
export function resetStoredStudents(): StudentRecord[] {
  try {
    localStorage.removeItem(STUDENTS_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to remove students from localStorage:', err);
  }
  return INITIAL_STUDENTS;
}

/**
 * Save a student photo in IndexedDB (with localStorage fallback if IndexedDB fails)
 */
export async function saveStudentPhoto(studentId: string, photoDataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.put({ studentId, photoDataUrl, updatedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to localStorage:', err);
    try {
      localStorage.setItem(`toeic_photo_${studentId}`, photoDataUrl);
    } catch (e) {
      console.error('LocalStorage photo backup failed:', e);
    }
  }
}

/**
 * Delete a student photo from IndexedDB and localStorage
 */
export async function deleteStudentPhoto(studentId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.delete(studentId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }

  try {
    localStorage.removeItem(`toeic_photo_${studentId}`);
  } catch (e) {
    // Ignore
  }
}

/**
 * Load all stored student photos
 */
export async function loadAllStudentPhotos(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Check localStorage first for any fallback photos
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('toeic_photo_')) {
        const studentId = key.replace('toeic_photo_', '');
        const val = localStorage.getItem(key);
        if (val) {
          result[studentId] = val;
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  // Load from IndexedDB
  try {
    const db = await openDB();
    const photos = await new Promise<{ studentId: string; photoDataUrl: string }[]>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    for (const item of photos) {
      if (item.studentId && item.photoDataUrl) {
        result[item.studentId] = item.photoDataUrl;
      }
    }
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
  }

  return result;
}

/**
 * Clear all student photos
 */
export async function clearAllStudentPhotos(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB clear failed:', err);
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('toeic_photo_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    // Ignore
  }
}
