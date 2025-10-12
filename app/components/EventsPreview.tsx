"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import { useAuth } from "../hooks/useAuth";
import InscriptionEventModal from "./InscriptionEventModal";
import GererInscriptionModal from "./GererInscriptionModal";
import Countdown from "./Countdown";

interface Event {
  id: string;
  titre: string;
  date: string;
  description: string;
  capacite: number;
  inscrits: number;
  photos_count: number;
  statut: string;
  lieu?: string;
  date_ouverture_inscription?: string;
  date_fermeture_inscription?: string;
  user_inscription?: any; // Données d'inscription si l'utilisateur est inscrit
}

export default function EventsPreview() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inscriptionEvent, setInscriptionEvent] = useState<Event | null>(null);
  const [gererInscription, setGererInscription] = useState<{
    event: Event;
    inscription: any;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch quand l'utilisateur change

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchEvents = async () => {
    try {
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        "/api/evenements/public"
      );
      const response = await apiRequest(apiUrl, {
        method: "GET",
      });

      // Prendre seulement les 3 premiers événements ouverts
      let openEvents = (response.evenements || [])
        .filter((e: Event) => e.statut === "ouvert")
        .slice(0, 3);

      // Si utilisateur connecté, vérifier ses inscriptions
      if (user) {
        const token = localStorage.getItem("auth_token");
        openEvents = await Promise.all(
          openEvents.map(async (event: Event) => {
            try {
              const inscriptionUrl = API_ENDPOINTS.connexion.replace(
                "/api/connexion",
                `/api/evenements/${event.id}/inscription?user_email=${user.email}`
              );
              const inscriptionResponse = await apiRequest(inscriptionUrl, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return {
                ...event,
                user_inscription: inscriptionResponse.inscription,
              };
            } catch (error) {
              // Pas inscrit ou erreur
              return event;
            }
          })
        );
      }

      setEvents(openEvents);
    } catch (error) {
      console.error("Erreur chargement événements:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="evenements"
      className="py-20 md:py-32 bg-parchment relative"
    >
      <div className="section-container">
        {/* Section Header */}
        <div
          className={`max-w-3xl mx-auto text-center mb-16 md:mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-px bg-gold"></div>
            <span className="text-xl text-gold">✦</span>
            <div className="w-12 h-px bg-gold"></div>
          </div>

          <p className="text-sm font-cinzel tracking-[0.3em] uppercase text-stone mb-6">
            Nos Célébrations
          </p>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-cinzel font-bold text-ink">
            Les Événements
            <br />
            <span className="text-gold">à Venir</span>
          </h2>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="p-16 text-center card-medieval">
            <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-stone font-crimson">
              Chargement des célébrations...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center card-medieval">
            <span className="text-5xl text-gold/30 block mb-4">⚜</span>
            <p className="text-stone font-crimson text-lg">
              Aucune célébration à venir pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const placesRestantes = event.capacite - event.inscrits;
              const now = new Date();

              // Ignorer le Z pour traiter comme heure locale pure (sans conversion UTC)
              const dateOuverture = event.date_ouverture_inscription
                ? new Date(event.date_ouverture_inscription.replace("Z", ""))
                : null;
              const dateFermeture = event.date_fermeture_inscription
                ? new Date(event.date_fermeture_inscription.replace("Z", ""))
                : null;

              const isBeforeOpening = dateOuverture && now < dateOuverture;
              const isAfterClosing = dateFermeture && now > dateFermeture;
              const isOpen =
                !isBeforeOpening &&
                !isAfterClosing &&
                event.statut === "ouvert";

              return (
                <div
                  key={event.id}
                  className="card-medieval group bg-parchment-light hover:bg-parchment transition-all duration-500"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 md:p-8 space-y-6 lg:space-y-0">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-cinzel font-bold text-ink group-hover:text-gold transition-colors duration-300">
                          {event.titre}
                        </h3>
                        <p className="text-sm text-stone font-crimson tracking-wide">
                          📅{" "}
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="text-stone font-crimson max-w-md leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm font-crimson pt-3">
                        <span className="text-ink">
                          <span className="font-semibold">
                            {event.inscrits}
                          </span>{" "}
                          / {event.capacite} inscrits
                        </span>
                        <span className="text-stone">•</span>
                        <span>
                          {isBeforeOpening ? (
                            <span className="text-orange-600 font-medium">
                              Prochainement
                            </span>
                          ) : isAfterClosing ? (
                            <span className="text-stone font-medium">
                              Inscriptions fermées
                            </span>
                          ) : placesRestantes > 0 ? (
                            <span
                              className={
                                placesRestantes <= 10
                                  ? "text-orange-600 font-medium"
                                  : "text-burgundy-light font-medium"
                              }
                            >
                              {placesRestantes} place
                              {placesRestantes > 1 ? "s" : ""} restante
                              {placesRestantes > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-burgundy font-medium">
                              Complet
                            </span>
                          )}
                        </span>
                        <span className="text-stone">•</span>
                        <span className="text-ink">
                          {event.photos_count} photo
                          {event.photos_count > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Compteur à rebours */}
                      {isBeforeOpening && dateOuverture && (
                        <div className="pt-3">
                          <Countdown
                            targetDate={event.date_ouverture_inscription!}
                            type="opening"
                            variant="compact"
                          />
                        </div>
                      )}
                      {isOpen && dateFermeture && (
                        <div className="pt-3">
                          <Countdown
                            targetDate={event.date_fermeture_inscription!}
                            type="closing"
                            variant="compact"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                      {isBeforeOpening ? (
                        <button
                          disabled
                          className="btn-medieval-primary whitespace-nowrap text-center opacity-50 cursor-not-allowed"
                        >
                          Prochainement
                        </button>
                      ) : isAfterClosing ? (
                        <button
                          disabled
                          className="btn-medieval-primary whitespace-nowrap text-center opacity-50 cursor-not-allowed"
                        >
                          Inscriptions fermées
                        </button>
                      ) : user ? (
                        event.user_inscription ? (
                          <button
                            onClick={() =>
                              setGererInscription({
                                event,
                                inscription: event.user_inscription,
                              })
                            }
                            className="btn-medieval-primary whitespace-nowrap text-center bg-green-600 hover:bg-green-700"
                          >
                            ✓ Gérer mon inscription
                          </button>
                        ) : (
                          <button
                            onClick={() => setInscriptionEvent(event)}
                            className="btn-medieval-primary whitespace-nowrap text-center"
                          >
                            S&apos;inscrire
                          </button>
                        )
                      ) : (
                        <Link
                          href="/inscription"
                          className="btn-medieval-primary whitespace-nowrap text-center"
                        >
                          S&apos;inscrire
                        </Link>
                      )}
                      {/* Bouton galerie seulement si inscrit */}
                      {user && event.user_inscription && !isBeforeOpening && (
                        <Link
                          href={`/galerie?event=${event.id}`}
                          className="btn-medieval-secondary whitespace-nowrap text-center"
                        >
                          Voir la galerie
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      {inscriptionEvent && user?.email && (
        <InscriptionEventModal
          event={inscriptionEvent}
          userEmail={user.email}
          onClose={() => setInscriptionEvent(null)}
          onSuccess={() => {
            fetchEvents();
            setInscriptionEvent(null);
          }}
        />
      )}

      {gererInscription && user?.email && (
        <GererInscriptionModal
          event={gererInscription.event}
          userEmail={user.email}
          inscription={gererInscription.inscription}
          onClose={() => setGererInscription(null)}
          onUpdate={() => {
            fetchEvents();
            setGererInscription(null);
          }}
        />
      )}
    </section>
  );
}
