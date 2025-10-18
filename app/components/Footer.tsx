"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1410] overflow-hidden">
      {/* Ligne dorée séparatrice */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent"></div>

      {/* Motifs décoratifs */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 md:left-20 text-8xl md:text-9xl text-[#d4af37]">
          ⚜
        </div>
        <div className="absolute bottom-20 right-10 md:right-20 text-8xl md:text-9xl text-[#d4af37]">
          ⚜
        </div>
      </div>

      <div className="section-container relative z-10">
        {/* Contenu principal */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10">
            {/* Logo & Description */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#c9a74f] flex items-center justify-center">
                  <span className="text-2xl text-[#0a0a0a]">⚜</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-cinzel font-bold text-xl tracking-[0.35em] text-[#d4af37]">
                    PREMIER DE L&apos;AN
                  </span>
                  <span className="font-crimson text-xs text-[#f5f1e8]/60 tracking-widest">
                    Édition 2026
                  </span>
                </div>
              </div>
              <p className="text-[#f5f1e8]/60 font-crimson leading-relaxed text-sm md:text-base max-w-md">
                Organisateur de soirées privées d'exception depuis 2010. Chaque
                célébration est une œuvre d'art, chaque moment un souvenir
                précieux.
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-px bg-gradient-to-r from-[#d4af37]/50 to-transparent"></div>
                <span className="text-[#d4af37] text-sm">❖</span>
                <div className="w-12 h-px bg-gradient-to-l from-[#d4af37]/50 to-transparent"></div>
              </div>
            </div>

            {/* Navigation rapide */}
            <div className="md:col-span-3 space-y-5">
              <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-[#d4af37] font-bold mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#accueil"
                    className="text-sm font-crimson text-[#f5f1e8]/70 hover:text-[#d4af37] transition-all duration-300 flex items-center space-x-2 group hover:translate-x-1"
                  >
                    <span className="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Accueil</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#evenements"
                    className="text-sm font-crimson text-[#f5f1e8]/70 hover:text-[#d4af37] transition-all duration-300 flex items-center space-x-2 group hover:translate-x-1"
                  >
                    <span className="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Événements</span>
                  </a>
                </li>
                <li>
                  <Link
                    href="/galerie"
                    className="text-sm font-crimson text-[#f5f1e8]/70 hover:text-[#d4af37] transition-all duration-300 flex items-center space-x-2 group hover:translate-x-1"
                  >
                    <span className="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Galerie</span>
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      href="/evenements"
                      className="text-sm font-crimson text-[#f5f1e8]/70 hover:text-[#d4af37] transition-all duration-300 flex items-center space-x-2 group hover:translate-x-1"
                    >
                      <span className="text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        →
                      </span>
                      <span>Mes Événements</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4 space-y-5">
              <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-[#d4af37] font-bold mb-6">
                Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-[#d4af37] text-lg mt-0.5">📧</span>
                  <div>
                    <p className="text-xs font-cinzel tracking-wider text-[#f5f1e8]/50 uppercase mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:contact@premierdelan.fr"
                      className="text-sm font-crimson text-[#f5f1e8]/80 hover:text-[#d4af37] transition-colors duration-300"
                    >
                      contact@premierdelan.fr
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-[#d4af37] text-lg mt-0.5">📍</span>
                  <div>
                    <p className="text-xs font-cinzel tracking-wider text-[#f5f1e8]/50 uppercase mb-1">
                      Localisation
                    </p>
                    <p className="text-sm font-crimson text-[#f5f1e8]/80">
                      Chamouillac, France
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-[#d4af37]/20 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-sm font-crimson text-[#f5f1e8]/50">
              © {currentYear} Premier de l'An. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-6">
              <Link
                href="/mentions-legales"
                className="text-xs font-crimson text-[#f5f1e8]/50 hover:text-[#d4af37] transition-colors duration-300"
              >
                Mentions légales
              </Link>
              <span className="text-[#d4af37]/30">•</span>
              <Link
                href="/confidentialite"
                className="text-xs font-crimson text-[#f5f1e8]/50 hover:text-[#d4af37] transition-colors duration-300"
              >
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
