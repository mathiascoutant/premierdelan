"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import Countdown from "./Countdown";

export default function MobileHomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [countdownType, setCountdownType] = useState<
    "opening" | "closing" | null
  >(null);
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
        const openEvents = response.evenements.filter(
          (e: any) => e.statut === "ouvert"
        );
        setEvents(openEvents.slice(0, 3));

        const event = response.evenements[0];
        const now = new Date();
        const dateOuverture = event.date_ouverture_inscription
          ? new Date(event.date_ouverture_inscription.replace("Z", ""))
          : null;
        const dateFermeture = event.date_fermeture_inscription
          ? new Date(event.date_fermeture_inscription.replace("Z", ""))
          : null;

        const isBeforeOpening = dateOuverture && now < dateOuverture;
        const isOpen = !isBeforeOpening && dateFermeture && now < dateFermeture;

        if (isBeforeOpening) {
          setNextEvent(event);
          setCountdownType("opening");
        } else if (isOpen) {
          setNextEvent(event);
          setCountdownType("closing");
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="min-h-screen relative pb-20">
      {/* Fond avec pattern élégant */}
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

      {/* Header luxueux fixe */}
      <div className="sticky top-0 z-50 bg-zinc-900/85 backdrop-blur-3xl border-b border-[#d4af37]/25 shadow-xl">
        <div className="px-6 py-4 flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
              <span className="text-2xl">⚜</span>
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-[#d4af37] text-base tracking-[0.2em]">
                PREMIER DE L'AN
              </h1>
              <p className="text-xs text-gray-500 font-crimson">Édition 2026</p>
            </div>
          </div>
          {user && (
            <Link
              href="/profil"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center text-black font-bold shadow-lg shadow-[#d4af37]/30"
            >
              {user.firstname.charAt(0)}
              {user.lastname.charAt(0)}
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto">
        {/* Hero magnifique avec countdown */}
        <div className="px-6 pt-12 pb-16 text-center min-h-[85vh] flex flex-col justify-center relative">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full backdrop-blur-sm mb-8">
              <span className="text-[#d4af37] text-sm">✦</span>
              <span className="text-xs font-cinzel tracking-wider text-[#d4af37] font-bold">
                SOIRÉE EXCLUSIVE
              </span>
              <span className="text-[#d4af37] text-sm">✦</span>
            </div>
          </div>

          <div className="text-5xl mb-6 leading-none text-[#d4af37]">⚜</div>

          <h2 className="text-4xl font-cinzel font-bold text-white mb-3 leading-tight">
            Premier de l'An
          </h2>

          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-5"></div>

          <div className="space-y-2 mb-8">
            <p className="text-lg text-[#d4af37] font-cinzel font-bold">
              31 Décembre 2025
            </p>
            <p className="text-sm text-gray-500 font-crimson">
              🏰 Chamouillac • 🎭 Médiéval
            </p>
          </div>

          {nextEvent && countdownType && (
            <div className="mb-10">
              <Countdown
                targetDate={
                  countdownType === "opening"
                    ? nextEvent.date_ouverture_inscription
                    : nextEvent.date_fermeture_inscription
                }
                type={countdownType}
              />
            </div>
          )}

          {!user && (
            <Link
              href="/inscription"
              className="inline-block px-12 py-5 bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] text-black font-cinzel font-bold text-base tracking-wider rounded-full shadow-2xl shadow-[#d4af37]/40 hover:shadow-[#d4af37]/60 transition-all"
            >
              RÉSERVER MA PLACE
            </Link>
          )}

          {/* Indicateur de scroll */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[#d4af37] text-xs font-cinzel tracking-widest uppercase">
                Défiler
              </span>
              <svg
                className="w-6 h-6 text-[#d4af37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Événements premium */}
        {events.length > 0 && (
          <div className="px-6 py-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-cinzel font-bold text-white mb-2">
                Nos <span className="text-[#d4af37]">Événements</span>
              </h3>
              <p className="text-gray-500 text-sm font-crimson">
                Découvrez nos prochaines célébrations
              </p>
            </div>

            <div className="space-y-5">
              {events.map((event, i) => {
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
                  !isBeforeOpening &&
                  !isAfterClosing &&
                  event.statut === "ouvert";

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
                    : "cursor-not-allowed"
                } ${isShaking ? "animate-shake border-red-500" : ""}`;

                const cardContent = (
                  <div className="p-6">
                    <div className="flex gap-5 items-start">
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
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="font-cinzel font-bold text-white text-xl mb-3 leading-tight">
                          {event.titre}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <span>📍</span>
                            {event.lieu || "Chamouillac"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span>👥</span>
                            {event.inscrits}/{event.capacite} places
                          </span>
                        </div>
                        {!isOpen && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border border-zinc-600/50 rounded-full">
                              <span className="text-xs font-cinzel font-bold text-gray-400 tracking-wider">
                                {isBeforeOpening
                                  ? "🔒 Bientôt disponible"
                                  : "Inscriptions terminées"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                  <div
                    key={event.id}
                    onClick={handleClick}
                    className={cardClassName}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Informations pratiques */}
        <div className="px-6 py-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-cinzel font-bold text-white mb-2">
              Informations <span className="text-[#d4af37]">Pratiques</span>
            </h3>
            <p className="text-gray-500 text-sm font-crimson">
              Tout ce qu'il faut savoir
            </p>
          </div>

          <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-3xl p-6 mb-4">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: "📅", label: "Date", value: "31 Déc 2025" },
                { icon: "🕐", label: "Horaire", value: "20h - 5h" },
                { icon: "📍", label: "Lieu", value: "Chamouillac" },
                { icon: "🎭", label: "Thème", value: "Médiéval" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <p className="text-xs text-[#d4af37] font-cinzel tracking-wider uppercase mb-1 font-bold">
                    {item.label}
                  </p>
                  <p className="text-sm font-crimson text-white font-semibold">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/programme"
            className="block w-full py-4 bg-gradient-to-r from-zinc-800 to-zinc-700 border-2 border-[#d4af37] text-[#d4af37] text-center font-cinzel font-bold text-sm tracking-wider rounded-2xl hover:bg-zinc-700 transition-all"
          >
            📜 DÉROULÉ DE LA SOIRÉE
          </Link>
        </div>

        {/* Au programme */}
        <div className="px-6 py-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-cinzel font-bold text-white mb-2">
              Au <span className="text-[#d4af37]">Programme</span>
            </h3>
            <p className="text-gray-500 text-sm font-crimson">
              Une soirée riche en émotions
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: "🍷",
                title: "Apéritif Royal",
                desc: "Accueil avec vin d'honneur",
              },
              {
                icon: "🍽️",
                title: "Banquet Médiéval",
                desc: "Buffet gastronomique",
              },
              {
                icon: "🎶",
                title: "Animations",
                desc: "Musique et spectacles",
              },
              { icon: "🎆", title: "Feu d'Artifice", desc: "À minuit précis" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-5 bg-gradient-to-r from-zinc-800/60 to-zinc-700/60 backdrop-blur-xl border border-[#d4af37]/25 rounded-2xl p-5 hover:border-[#d4af37]/40 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-cinzel font-bold text-white text-base mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-400 font-crimson">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA magnifique */}
        {!user && (
          <div className="px-6 py-12">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#f4d03f] to-[#c9a74f]"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 px-8 py-12 text-center">
                <div className="text-7xl mb-6 text-black/80">👑</div>
                <h3 className="text-4xl font-cinzel font-black text-black mb-4 leading-tight">
                  Rejoignez
                  <br />
                  l'Aventure
                </h3>
                <p className="text-black/70 font-crimson text-lg mb-8 max-w-xs mx-auto leading-relaxed">
                  Réservez dès maintenant votre place pour une soirée
                  inoubliable
                </p>
                <Link
                  href="/inscription"
                  className="inline-block px-12 py-5 bg-black text-[#d4af37] rounded-full font-cinzel font-bold text-base tracking-widest shadow-2xl shadow-black/50 hover:shadow-black/70 transition-all"
                >
                  JE RÉSERVE
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
