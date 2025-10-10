'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiUpload, 
  FiImage, 
  FiVideo, 
  FiDownload, 
  FiTrash2,
  FiX,
  FiPlay
} from 'react-icons/fi';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, STORAGE_CONFIG } from '../../../config/firebaseStorage';
import { API_ENDPOINTS, apiRequest } from '../../../config/api';
import { useAuth } from '../../../hooks/useAuth';

interface Media {
  id: string;
  event_id: string;
  user_email: string;
  user_name: string;
  type: 'image' | 'video';
  url: string;
  storage_path: string;
  filename: string;
  size: number;
  uploaded_at: string;
}

interface Event {
  id: string;
  titre: string;
  date: string;
  description: string;
}

export default function GaleriePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');

  useEffect(() => {
    if (!authLoading) {
      fetchEventAndMedias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, authLoading]);

  const fetchEventAndMedias = async () => {
    try {
      // Récupérer l'événement
      const eventUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/evenements/${eventId}`);
      const eventResponse = await apiRequest(eventUrl, { method: 'GET' });
      setEvent(eventResponse.evenement);

      // Récupérer les médias
      const token = localStorage.getItem('auth_token');
      const mediasUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/evenements/${eventId}/medias`);
      const mediasResponse = await apiRequest(mediasUrl, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      setMedias(mediasResponse.medias || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    const file = e.target.files[0];
    const isImage = STORAGE_CONFIG.allowedImageTypes.includes(file.type);
    const isVideo = STORAGE_CONFIG.allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      alert('Format de fichier non supporté. Utilisez JPG, PNG, GIF, MP4, MOV ou WebM.');
      return;
    }

    const maxSize = isImage ? STORAGE_CONFIG.maxImageSize : STORAGE_CONFIG.maxVideoSize;
    if (file.size > maxSize) {
      alert(`Fichier trop volumineux. Taille max: ${isImage ? '10MB' : '100MB'}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload vers Firebase Storage
      const storagePath = STORAGE_CONFIG.storagePath(eventId, user.email, file.name);
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Erreur upload:', error);
          alert('Erreur lors de l\'upload');
          setIsUploading(false);
        },
        async () => {
          // Upload terminé, récupérer l'URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Enregistrer en base de données
          const token = localStorage.getItem('auth_token');
          const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/evenements/${eventId}/medias`);
          
          await apiRequest(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_email: user.email,
              type: isImage ? 'image' : 'video',
              url: downloadURL,
              storage_path: storagePath,
              filename: file.name,
              size: file.size,
            }),
          });

          // Rafraîchir la galerie
          await fetchEventAndMedias();
          setIsUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error('Erreur:', error);
      setIsUploading(false);
    }
  };

  const handleDelete = async (media: Media) => {
    if (!user || media.user_email !== user.email) {
      alert('Vous ne pouvez supprimer que vos propres médias');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      // Supprimer de Firebase Storage
      const storageRef = ref(storage, media.storage_path);
      await deleteObject(storageRef);

      // Supprimer de la base de données
      const token = localStorage.getItem('auth_token');
      const apiUrl = API_ENDPOINTS.connexion.replace('/api/connexion', `/api/evenements/${eventId}/medias/${media.id}`);
      
      await apiRequest(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Rafraîchir la galerie
      await fetchEventAndMedias();
      setSelectedMedia(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDownload = async (media: Media) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const filteredMedias = medias.filter(media => {
    if (filter === 'images') return media.type === 'image';
    if (filter === 'videos') return media.type === 'video';
    return true;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Événement non trouvé</p>
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="section-container">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-4">
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Retour aux événements
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-black mb-2">
                Galerie - {event.titre}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {user && (
              <div>
                <label className="btn-primary cursor-pointer inline-flex items-center">
                  <FiUpload className="w-4 h-4 mr-2" />
                  Ajouter des médias
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Upload en cours...</span>
              <span className="text-sm font-medium text-black">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Tout ({medias.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center ${
              filter === 'images' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FiImage className="w-4 h-4 mr-2" />
            Photos ({medias.filter(m => m.type === 'image').length})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center ${
              filter === 'videos' 
                ? 'bg-black text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FiVideo className="w-4 h-4 mr-2" />
            Vidéos ({medias.filter(m => m.type === 'video').length})
          </button>
        </div>

        {/* Galerie */}
        {filteredMedias.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'Aucun média pour le moment' 
                : filter === 'images'
                ? 'Aucune photo'
                : 'Aucune vidéo'}
            </p>
            {user && (
              <label className="btn-primary cursor-pointer inline-flex items-center">
                <FiUpload className="w-4 h-4 mr-2" />
                Ajouter le premier média
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedias.map((media) => (
              <div
                key={media.id}
                className="group relative aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-all cursor-pointer"
                onClick={() => setSelectedMedia(media)}
              >
                {media.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-black">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <FiPlay className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{media.user_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualisation */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors z-10"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div 
            className="max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedMedia.url}
                alt={selectedMedia.filename}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] rounded-lg"
              />
            )}

            <div className="mt-4 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-black">{selectedMedia.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedMedia.uploaded_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(selectedMedia)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  {user && selectedMedia.user_email === user.email && (
                    <button
                      onClick={() => handleDelete(selectedMedia)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600">{selectedMedia.filename}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

