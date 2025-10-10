"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiUpload,
  FiImage,
  FiVideo,
  FiDownload,
  FiTrash2,
  FiX,
  FiPlay,
} from "react-icons/fi";
import { uploadToCloudinary, validateFile } from "../config/cloudinary";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import { useAuth } from "../hooks/useAuth";

interface Media {
  id: string;
  event_id: string;
  user_email: string;
  user_name: string;
  type: "image" | "video";
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

function GalerieContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const { user, isLoading: authLoading } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadQueue, setUploadQueue] = useState<
    {
      name: string;
      progress: number;
      status: "pending" | "uploading" | "done" | "error";
    }[]
  >([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [filter, setFilter] = useState<"all" | "images" | "videos">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && eventId) {
      fetchEventAndMedias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, authLoading]);

  const fetchEventAndMedias = async () => {
    if (!eventId) return;

    try {
      // Récupérer l'événement
      const eventUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${eventId}`
      );
      const eventResponse = await apiRequest(eventUrl, { method: "GET" });
      setEvent(eventResponse.evenement);

      // Récupérer les médias
      const token = localStorage.getItem("auth_token");
      const mediasUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${eventId}/medias`
      );
      const mediasResponse = await apiRequest(mediasUrl, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMedias(mediasResponse.medias || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user || !eventId) return;

    const files = Array.from(e.target.files);

    // Validation de tous les fichiers
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        return;
      }
    }

    setIsUploading(true);

    // Initialiser la file d'attente
    const queue = files.map((file) => ({
      name: file.name,
      progress: 0,
      status: "pending" as const,
    }));
    setUploadQueue(queue);

    const token = localStorage.getItem("auth_token");
    let successCount = 0;
    let errorCount = 0;

    // Upload des fichiers un par un
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Mettre à jour le statut: uploading
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "uploading" } : item
          )
        );

        // 1. Upload vers Cloudinary avec progression
        const cloudinaryResult = await uploadToCloudinary(
          file,
          eventId,
          user.email,
          (progress) => {
            setUploadQueue((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, progress } : item
              )
            );
          }
        );

        // 2. Enregistrer les métadonnées dans le backend
        const apiUrl = API_ENDPOINTS.connexion.replace(
          "/api/connexion",
          `/api/evenements/${eventId}/medias`
        );

        await apiRequest(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_email: user.email,
            type: cloudinaryResult.type,
            url: cloudinaryResult.url,
            storage_path: cloudinaryResult.storage_path,
            filename: cloudinaryResult.filename,
            size: cloudinaryResult.size,
          }),
        });

        // Marquer comme terminé
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "done", progress: 100 } : item
          )
        );

        successCount++;
      } catch (error) {
        console.error(`Erreur upload ${file.name}:`, error);

        // Marquer comme erreur
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "error" } : item
          )
        );

        errorCount++;
      }
    }

    // Rafraîchir la galerie
    await fetchEventAndMedias();

    // Afficher le résumé
    if (errorCount > 0) {
      alert(`Upload terminé: ${successCount} réussis, ${errorCount} échoués`);
    }

    // Nettoyer après 3 secondes
    setTimeout(() => {
      setUploadQueue([]);
      setIsUploading(false);
    }, 3000);

    // Réinitialiser l'input pour permettre de re-uploader les mêmes fichiers
    e.target.value = "";
  };

  const handleDelete = async (media: Media) => {
    if (!user || media.user_email !== user.email || !eventId) {
      alert("Vous ne pouvez supprimer que vos propres médias");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;

    try {
      // Supprimer via le backend (qui supprime de Cloudinary ET de la BDD)
      const token = localStorage.getItem("auth_token");
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        `/api/evenements/${eventId}/medias/${media.id}`
      );

      await apiRequest(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Rafraîchir la galerie
      await fetchEventAndMedias();
      setSelectedMedia(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleDownload = async (media: Media) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = media.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      alert("Erreur lors du téléchargement");
    }
  };

  const toggleSelection = (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = new Set(selectedItems);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedItems(newSelection);
  };

  const handleDownloadSelected = async () => {
    if (selectedItems.size === 0) return;

    for (const mediaId of selectedItems) {
      const media = medias.find((m) => m.id === mediaId);
      if (media) {
        await handleDownload(media);
      }
    }
    setSelectedItems(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!eventId || selectedItems.size === 0) return;

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedItems.size} média(s) ?`
      )
    )
      return;

    const token = localStorage.getItem("auth_token");
    let successCount = 0;
    let errorCount = 0;

    for (const mediaId of selectedItems) {
      try {
        const apiUrl = API_ENDPOINTS.connexion.replace(
          "/api/connexion",
          `/api/evenements/${eventId}/medias/${mediaId}`
        );

        await apiRequest(apiUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Erreur suppression ${mediaId}:`, error);
        errorCount++;
      }
    }

    await fetchEventAndMedias();
    setSelectedItems(new Set());

    if (errorCount > 0) {
      alert(
        `Suppression terminée: ${successCount} réussis, ${errorCount} échoués`
      );
    }
  };

  const handleShareSelected = () => {
    if (selectedItems.size === 0) return;

    const selectedMedias = medias.filter((m) => selectedItems.has(m.id));
    const urls = selectedMedias.map((m) => m.url).join("\n");

    if (navigator.share) {
      navigator
        .share({
          title: `${selectedItems.size} média(s) - ${event?.titre}`,
          text: `Découvrez ces ${selectedItems.size} média(s) de ${event?.titre}`,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback: copier dans le presse-papier
          navigator.clipboard.writeText(urls);
          alert("Liens copiés dans le presse-papier !");
        });
    } else {
      navigator.clipboard.writeText(urls);
      alert("Liens copiés dans le presse-papier !");
    }
  };

  const filteredMedias = medias.filter((media) => {
    if (filter === "images") return media.type === "image";
    if (filter === "videos") return media.type === "video";
    return true;
  });

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ID d&apos;événement manquant</p>
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

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
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Retour aux événements
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-black mb-2">
                Galerie - {event.titre}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress - Barre unique */}
        {uploadQueue.length > 0 && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">
                Upload en cours...
              </span>
              <span className="text-sm text-gray-600">
                {uploadQueue.filter((f) => f.status === "done").length} /{" "}
                {uploadQueue.length} fichiers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-black h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: `${
                    (uploadQueue.filter((f) => f.status === "done").length /
                      uploadQueue.length) *
                    100
                  }%`,
                }}
              >
                <span className="text-xs text-white font-medium px-2">
                  {Math.round(
                    (uploadQueue.filter((f) => f.status === "done").length /
                      uploadQueue.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
            {uploadQueue.some((f) => f.status === "uploading") && (
              <p className="text-xs text-gray-500 mt-2">
                En cours :{" "}
                {uploadQueue.find((f) => f.status === "uploading")?.name}
              </p>
            )}
          </div>
        )}

        {/* Barre d'actions flottante */}
        {selectedItems.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-gray-300 rounded-full shadow-2xl px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.size} sélectionné
                {selectedItems.size > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSelected}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <FiDownload className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleShareSelected}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Partager"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <FiTrash2 className="w-5 h-5 text-red-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Annuler"
                >
                  <FiX className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Tout ({medias.length})
          </button>
          <button
            onClick={() => setFilter("images")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center whitespace-nowrap ${
              filter === "images"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiImage className="w-4 h-4 mr-2" />
            Photos ({medias.filter((m) => m.type === "image").length})
          </button>
          <button
            onClick={() => setFilter("videos")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center whitespace-nowrap ${
              filter === "videos"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiVideo className="w-4 h-4 mr-2" />
            Vidéos ({medias.filter((m) => m.type === "video").length})
          </button>
        </div>

        {/* Galerie */}
        {filteredMedias.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "Aucun média pour le moment"
                : filter === "images"
                ? "Aucune photo"
                : "Aucune vidéo"}
            </p>
            {user && (
              <label className="btn-primary cursor-pointer inline-flex items-center">
                <FiUpload className="w-4 h-4 mr-2" />
                Ajouter des médias
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedias.map((media) => {
              const isMyMedia = user && media.user_email === user.email;
              const isSelected = selectedItems.has(media.id);

              return (
                <div
                  key={media.id}
                  className={`group relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600"
                      : "border-gray-200 hover:border-black"
                  }`}
                  onClick={() => setSelectedMedia(media)}
                >
                  {media.type === "image" ? (
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
                  {/* Checkbox de sélection - Toujours visible si c'est ton média */}
                  {isMyMedia && (
                    <div
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => toggleSelection(media.id, e)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white/90 border-white hover:bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {media.user_name}
                    </p>
                  </div>
                </div>
              );
            })}
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
            {selectedMedia.type === "image" ? (
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
                  <p className="text-sm font-medium text-black">
                    {selectedMedia.user_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedMedia.uploaded_at).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
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

export default function GaleriePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      }
    >
      <GalerieContent />
    </Suspense>
  );
}
