"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ENDPOINTS, apiRequest } from "../config/api";

interface Event {
  id: string;
  titre: string;
  date: string;
  lieu?: string;
  description?: string;
  capacite: number;
  inscrits: number;
  statut: string;
  date_ouverture_inscription?: string;
  date_fermeture_inscription?: string;
}

export default function EvenementsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shakingEventId, setShakingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        "/api/evenements/public"
      );
      const response = await apiRequest(apiUrl, { method: "GET" });

      if (response.evenements && response.evenements.length > 0) {
        setEvents(response.evenements);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Catégoriser les événements
  const categorizeEvents = () => {
    const now = new Date();
    const open: Event[] = [];
    const upcoming: Event[] = [];
    const closed: Event[] = [];

    events.forEach((event) => {
      const dateOuverture = event.date_ouverture_inscription
        ? new Date(event.date_ouverture_inscription.replace("Z", ""))
        : null;
      const dateFermeture = event.date_fermeture_inscription
        ? new Date(event.date_fermeture_inscription.replace("Z", ""))
        : null;

      const isBeforeOpening = dateOuverture && now < dateOuverture;
      const isAfterClosing = dateFermeture && now > dateFermeture;
      const isOpen =
        !isBeforeOpening && !isAfterClosing && event.statut === "ouvert";

      if (isOpen) {
        open.push(event);
      } else if (isBeforeOpening) {
        upcoming.push(event);
      } else {
        closed.push(event);
      }
    });

    // Trier par date
    open.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    upcoming.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    closed.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { open, upcoming, closed };
  };

  const { open, upcoming, closed } = categorizeEvents();

  const renderEventCard = (
    event: Event,
    status: "open" | "upcoming" | "closed"
  ) => {
    const now = new Date();
    const dateOuverture = event.date_ouverture_inscription
      ? new Date(event.date_ouverture_inscription.replace("Z", ""))
      : null;
    const dateFermeture = event.date_fermeture_inscription
      ? new Date(event.date_fermeture_inscription.replace("Z", ""))
      : null;

    const isBeforeOpening = dateOuverture && now < dateOuverture;
    const isAfterClosing = dateFermeture && now > dateFermeture;
    const isOpen =
      !isBeforeOpening && !isAfterClosing && event.statut === "ouvert";

    const placesRestantes = event.capacite - event.inscrits;
    const pourcentageRempli = (event.inscrits / event.capacite) * 100;
    const isShaking = shakingEventId === event.id;

    const handleClick = (e: any) => {
      if (!isOpen) {
        e.preventDefault();
        setShakingEventId(event.id);
        setTimeout(() => setShakingEventId(null), 500);
      }
    };

    const cardClassName = `block bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-xl transition-all relative ${
      isOpen
        ? "border-[#d4af37]/25 hover:border-[#d4af37]/50 hover:shadow-2xl hover:shadow-[#d4af37]/10 cursor-pointer"
        : "border-zinc-700/50 cursor-not-allowed"
    } ${isShaking ? "animate-shake !border-red-500 !opacity-100" : ""}`;

    const cardContent = (
      <>
        <div className="p-6">
          <div className="flex gap-5 items-start">
            {/* Date box */}
            <div
              className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg flex-shrink-0 ${
                isOpen
                  ? "bg-gradient-to-br from-[#d4af37] to-[#c9a74f] text-black shadow-[#d4af37]/30"
                  : "bg-zinc-700/50 text-gray-500"
              }`}
            >
              <span className="text-3xl font-black">
                {new Date(event.date).getDate()}
              </span>
              <span className="text-xs uppercase font-bold mt-1">
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  month: "short",
                })}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-cinzel font-bold text-white text-xl mb-3 leading-tight">
                {event.titre}
              </h3>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <span>📍</span>
                  {event.lieu || "Chamouillac"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span>📅</span>
                  {new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Jauge de remplissage */}
              {isOpen && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>
                      {event.inscrits}/{event.capacite} places
                    </span>
                    <span
                      className={
                        placesRestantes <= 10
                          ? "text-red-400 font-bold"
                          : "text-gray-400"
                      }
                    >
                      {placesRestantes} restantes
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        pourcentageRempli >= 90
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-[#d4af37] to-[#c9a74f]"
                      }`}
                      style={{ width: `${pourcentageRempli}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status badge */}
              {!isOpen && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border border-zinc-600/50 rounded-full">
                    <span className="text-xs font-cinzel font-bold text-gray-400 tracking-wider">
                      {status === "upcoming"
                        ? "🔒 Ouverture prochaine"
                        : "❌ Inscriptions terminées"}
                    </span>
                  </div>
                </div>
              )}

              {/* Date d'ouverture pour upcoming */}
              {status === "upcoming" && dateOuverture && (
                <p className="text-xs text-[#d4af37] mt-2 font-crimson">
                  Ouverture le{" "}
                  {dateOuverture.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTA pour événements ouverts */}
        {isOpen && (
          <div className="px-6 pb-6">
            <div className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#c9a74f] text-black text-center font-cinzel font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all">
              VOIR LES DÉTAILS
            </div>
          </div>
        )}
      </>
    );

    return isOpen ? (
      <Link
        key={event.id}
        href={`/evenements/${event.id}`}
        onClick={handleClick}
        className={cardClassName}
      >
        {cardContent}
      </Link>
    ) : (
      <div key={event.id} onClick={handleClick} className={cardClassName}>
        {cardContent}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20">
      {/* Fond médiéval */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 -z-10"></div>
      <div
        className="fixed inset-0 opacity-40 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="fixed top-20 right-10 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-[#c9a74f]/10 rounded-full blur-[120px] -z-10"></div>

      {/* Header fixe */}
      <div className="sticky top-0 z-50 bg-zinc-900/85 backdrop-blur-3xl border-b border-[#d4af37]/25 shadow-xl">
        <div className="px-6 py-4 flex items-center justify-between max-w-screen-xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-cinzel font-bold text-sm tracking-wider">
              RETOUR
            </span>
          </button>
          <h1 className="font-cinzel font-bold text-[#d4af37] text-base tracking-[0.2em]">
            ÉVÉNEMENTS
          </h1>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Événements ouverts */}
        {open.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-cinzel font-bold text-white">
                  Inscriptions <span className="text-[#d4af37]">Ouvertes</span>
                </h2>
                <p className="text-sm text-gray-400 font-crimson">
                  {open.length} événement{open.length > 1 ? "s" : ""} disponible
                  {open.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {open.map((event) => renderEventCard(event, "open"))}
            </div>
          </div>
        )}

        {/* Événements à venir */}
        {upcoming.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <div>
                <h2 className="text-2xl font-cinzel font-bold text-white">
                  Ouverture <span className="text-[#d4af37]">Prochaine</span>
                </h2>
                <p className="text-sm text-gray-400 font-crimson">
                  {upcoming.length} événement{upcoming.length > 1 ? "s" : ""}{" "}
                  bientôt disponible{upcoming.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {upcoming.map((event) => renderEventCard(event, "upcoming"))}
            </div>
          </div>
        )}

        {/* Événements fermés */}
        {closed.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-zinc-700/50 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-cinzel font-bold text-white">
                  Inscriptions <span className="text-gray-500">Terminées</span>
                </h2>
                <p className="text-sm text-gray-400 font-crimson">
                  {closed.length} événement{closed.length > 1 ? "s" : ""} passé
                  {closed.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {closed.map((event) => renderEventCard(event, "closed"))}
            </div>
          </div>
        )}

        {/* Aucun événement */}
        {open.length === 0 && upcoming.length === 0 && closed.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎭</span>
            </div>
            <p className="text-gray-400 text-lg font-cinzel">
              Aucun événement disponible
            </p>
            <p className="text-gray-500 text-sm font-crimson mt-2">
              Revenez bientôt pour découvrir nos prochaines célébrations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
