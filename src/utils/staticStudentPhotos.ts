/**
 * Loads static student photos from src/assets/students/ at build time using Vite's glob import.
 * When the repository is pushed to Git with student photos in src/assets/students/,
 * Vite bundles and resolves them as static URLs automatically.
 */

// Automatically eager-import any image files placed inside src/assets/students/
const staticStudentAssetModules = import.meta.glob<{ default: string }>(
  '/src/assets/students/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true }
);

/**
 * Returns a map of normalized student names to bundled asset URLs
 */
export function getStaticStudentPhotos(): Record<string, string> {
  const photoMap: Record<string, string> = {};

  for (const filePath in staticStudentAssetModules) {
    const assetModule = staticStudentAssetModules[filePath];
    const assetUrl =
      typeof assetModule === 'string'
        ? assetModule
        : (assetModule as { default: string })?.default;

    if (!assetUrl) continue;

    // Extract filename without extension (e.g., "Jade.png" -> "jade")
    const filenameWithExt = filePath.split('/').pop() || '';
    const baseName = filenameWithExt.replace(/\.[^/.]+$/, '').trim().toLowerCase();

    if (baseName) {
      photoMap[baseName] = assetUrl;
    }
  }

  return photoMap;
}

/**
 * Resolves the best available photo URL for a student:
 * 1. Custom uploaded photo from IndexedDB (if present)
 * 2. Static bundled asset from src/assets/students/ (e.g. Jade.png, Steven.png)
 * 3. Static public fallback from /students/[name].png
 */
export function resolveStudentPhotoUrl(
  studentName: string,
  userPhoto?: string,
  staticPhotosMap: Record<string, string> = {}
): string | undefined {
  if (userPhoto) {
    return userPhoto;
  }

  const normalized = studentName.trim().toLowerCase();

  // Check Vite bundled asset from src/assets/students/
  if (staticPhotosMap[normalized]) {
    return staticPhotosMap[normalized];
  }

  return undefined;
}
