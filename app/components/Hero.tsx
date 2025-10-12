"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import Countdown from "./Countdown";

export default function Hero() {
  const { user, isLoading } = useAuth();
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [countdownType, setCountdownType] = useState<
    "opening" | "closing" | null
  >(null);

  useEffect(() => {
    fetchNextEvent();
  }, []);

  const fetchNextEvent = async () => {
    try {
      const apiUrl = API_ENDPOINTS.connexion.replace(
        "/api/connexion",
        "/api/evenements/public"
      );
      const response = await apiRequest(apiUrl, { method: "GET" });

      if (response.evenements && response.evenements.length > 0) {
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
      console.error("Erreur récupération événement:", error);
    }
  };

  return (
    <section
      id="accueil"
      className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-ink via-ink-light to-ink"
      style={{ height: "100vh" }}
    >
      {/* Motif subtil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-10 text-9xl text-gold">⚜</div>
        <div className="absolute bottom-1/4 right-10 text-9xl text-gold">⚜</div>
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Petit badge */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-6 py-2 border border-gold/30 bg-gold/5">
            <span className="text-gold text-sm">✦</span>
            <span className="text-xs font-cinzel tracking-[0.3em] text-gold uppercase">
              Événement du 31 Décembre 2025
            </span>
            <span className="text-gold text-sm">✦</span>
          </div>

          {/* Compteur */}
          {nextEvent && countdownType && (
            <div className="mt-4">
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
        </div>

        {/* Titre principal */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-cinzel font-bold text-parchment leading-tight mb-8 animate-slide-up">
          PREMIER DE L&apos;AN
          <span className="block text-3xl md:text-5xl lg:text-6xl mt-4 text-gold tracking-[0.2em]">
            ÉDITION MÉDIÉVALE
          </span>
        </h1>

        {/* Sous-titre */}
        <p
          className="text-xl md:text-2xl text-parchment/70 font-crimson mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Plongez dans une soirée d&apos;exception à Chamouillac
        </p>

        {/* CTA */}
        {!isLoading && !user && (
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="#evenements"
              className="px-10 py-4 bg-gold text-ink font-cinzel tracking-wider hover:bg-gold-dark transition-all shadow-[0_4px_0_0_#5C4033] hover:shadow-[0_2px_0_0_#5C4033] hover:translate-y-[2px]"
            >
              DÉCOUVRIR
            </a>
            <Link
              href="/inscription"
              className="px-10 py-4 border-2 border-gold text-gold font-cinzel tracking-wider hover:bg-gold hover:text-ink transition-all"
            >
              S&apos;INSCRIRE
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
