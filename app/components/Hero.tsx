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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetchNextEvent();

    // Parallax effect
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1410] to-[#0a0a0a]"
      style={{ height: "100vh" }}
    >
      {/* Overlay doré animé */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4af37]/5 to-transparent pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Motifs décoratifs dorés */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 md:left-20 text-6xl md:text-9xl text-[#d4af37] animate-float">
          ⚜
        </div>
        <div className="absolute top-40 right-10 md:right-32 text-4xl md:text-7xl text-[#c9a74f] animate-float-delayed">
          ✦
        </div>
        <div className="absolute bottom-40 left-16 md:left-40 text-5xl md:text-8xl text-[#d4af37] animate-float-slow">
          ❖
        </div>
        <div className="absolute bottom-20 right-10 md:right-20 text-6xl md:text-9xl text-[#c9a74f] animate-float">
          ⚜
        </div>
      </div>

      {/* Grille subtile */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />

      {/* Contenu principal */}
      <div className="relative z-10 text-center px-6 md:px-12 max-w-6xl mx-auto pt-20">
        {/* Badge élégant */}
        <div className="mb-8 md:mb-12 opacity-0 animate-fade-in">
          <div className="inline-flex items-center space-x-3 px-6 md:px-8 py-3 border-2 border-[#d4af37]/40 bg-[#d4af37]/5 backdrop-blur-sm hover:border-[#d4af37]/60 transition-all duration-500 group">
            <span className="text-[#d4af37] text-base md:text-lg group-hover:scale-125 transition-transform">
              ✦
            </span>
            <span className="text-xs md:text-sm font-cinzel tracking-[0.3em] text-[#d4af37] uppercase font-bold">
              Événement Exclusif
            </span>
            <span className="text-[#d4af37] text-base md:text-lg group-hover:scale-125 transition-transform">
              ✦
            </span>
          </div>
        </div>

        {/* Titre principal majestueux */}
        <h1
          className="font-cinzel font-bold text-4xl md:text-7xl lg:text-8xl mb-6 md:mb-8 leading-tight opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <span className="block text-[#f5f1e8] drop-shadow-2xl">
            Premier de l'An
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] mt-2 md:mt-4 animate-shimmer">
            2026
          </span>
        </h1>

        {/* Sous-titre élégant */}
        <p
          className="font-crimson text-lg md:text-2xl text-[#f5f1e8]/80 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
        >
          Une soirée d'exception où élégance, festivités et magie se rencontrent
          pour célébrer la nouvelle année dans un cadre prestigieux
        </p>

        {/* Compteur si disponible */}
        {nextEvent && countdownType && (
          <div
            className="mb-8 md:mb-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
          >
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

        {/* Boutons CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "800ms", animationFillMode: "forwards" }}
        >
          {!isLoading &&
            (user ? (
              <Link
                href="/evenements"
                className="group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-[#d4af37] to-[#c9a74f] text-[#0a0a0a] font-cinzel font-bold text-base md:text-lg tracking-wider uppercase overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#d4af37]/50"
              >
                <span className="relative z-10">Découvrir les Événements</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#f4d03f] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ) : (
              <>
                <Link
                  href="/inscription"
                  className="group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-[#d4af37] to-[#c9a74f] text-[#0a0a0a] font-cinzel font-bold text-base md:text-lg tracking-wider uppercase overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#d4af37]/50"
                >
                  <span className="relative z-10">Réserver ma Place</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f4d03f] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <Link
                  href="#evenements"
                  className="group px-8 md:px-12 py-4 md:py-5 border-2 border-[#d4af37] text-[#d4af37] font-cinzel font-bold text-base md:text-lg tracking-wider uppercase hover:bg-[#d4af37]/10 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#d4af37]/30"
                >
                  En Savoir Plus
                </Link>
              </>
            ))}
        </div>

        {/* Indicateur de scroll */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1000ms", animationFillMode: "forwards" }}
        >
          <div className="flex flex-col items-center space-y-2 animate-bounce-slow">
            <span className="text-[#d4af37] text-xs font-cinzel tracking-wider uppercase">
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

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(-5deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
          background-size: 200% auto;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
