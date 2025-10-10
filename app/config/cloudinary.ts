// Configuration Cloudinary
export const CLOUDINARY_CONFIG = {
  cloudName: 'dxwhngg8g',
  uploadPreset: 'premierdelan_events',
  apiUrl: (cloudName: string) => `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
};

export interface CloudinaryUploadResult {
  url: string;
  storage_path: string;
  filename: string;
  size: number;
  type: 'image' | 'video';
}

// Fonction d'upload vers Cloudinary
export async function uploadToCloudinary(
  file: File,
  eventId: string,
  userEmail: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  // Définir le dossier
  const folder = `events/${eventId}/media/${userEmail.replace('@', '_')}`;
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Suivi de la progression
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          storage_path: data.public_id,
          filename: file.name,
          size: data.bytes,
          type: data.resource_type === 'video' ? 'video' : 'image',
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', CLOUDINARY_CONFIG.apiUrl(CLOUDINARY_CONFIG.cloudName));
    xhr.send(formData);
  });
}

// Fonction de suppression de Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // La suppression se fait côté backend pour des raisons de sécurité
  // (nécessite une signature avec l'API secret)
  // Le frontend appelle juste le backend qui se charge de supprimer de Cloudinary
  console.log('Suppression déléguée au backend:', publicId);
}

// Validation des fichiers
export const VALIDATION = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/avi'],
};

export function validateFile(file: File): { valid: boolean; error?: string } {
  const isImage = VALIDATION.allowedImageTypes.includes(file.type);
  const isVideo = VALIDATION.allowedVideoTypes.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF, WebP, MP4, MOV, AVI ou WebM.',
    };
  }

  const maxSize = isImage ? VALIDATION.maxImageSize : VALIDATION.maxVideoSize;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille max: ${isImage ? '10MB' : '100MB'}`,
    };
  }

  return { valid: true };
}

