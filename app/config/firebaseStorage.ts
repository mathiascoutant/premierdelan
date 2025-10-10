import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebase';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Cloud Storage
export const storage = getStorage(app);

// Configuration
export const STORAGE_CONFIG = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  storagePath: (eventId: string, userId: string, filename: string) => 
    `events/${eventId}/media/${userId}/${Date.now()}_${filename}`,
};

