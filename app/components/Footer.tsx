"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="bg-ink relative overflow-hidden">
      {/* Ornement supérieur */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>

      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 text-9xl text-gold">⚜</div>
        <div className="absolute bottom-20 right-20 text-9xl text-gold">⚜</div>
      </div>

      <div className="section-container relative z-10">
        {/* Contenu principal */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-5 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl text-gold">⚜</span>
                <div className="flex flex-col">
                  <span className="font-cinzel font-bold text-xl tracking-[0.3em] text-gold">
                    PREMIER
                  </span>
                  <span className="font-cinzel text-sm tracking-[0.3em] text-parchment/60 -mt-1">
                    DE L&apos;AN
                  </span>
                </div>
              </div>
              <p className="text-parchment/60 font-crimson leading-relaxed max-w-sm">
                Créer des moments inoubliables depuis 2010. Chaque célébration est une œuvre d&apos;art.
              </p>
              <div className="flex items-center space-x-2 text-gold/30">
                <span>⚜</span>
                <span className="text-xs">◆</span>
                <span>⚜</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3 space-y-5">
              <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-gold mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#accueil"
                    className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Accueil</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#evenements"
                    className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Événements</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Services</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Compte */}
            <div className="md:col-span-4 space-y-5">
              <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-gold mb-6">
                Votre Espace
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/connexion"
                    className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Connexion</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/inscription"
                    className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      →
                    </span>
                    <span>Créer un compte</span>
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      href="/mes-evenements"
                      className="text-sm font-crimson text-parchment/60 hover:text-gold transition-colors duration-300 flex items-center space-x-2 group"
                    >
                      <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        →
                      </span>
                      <span>Mes événements</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>

        {/* Bas de page */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm font-crimson text-parchment/40 flex items-center space-x-2">
            <span className="text-gold/60">©</span>
            <span>{currentYear} Premier de l&apos;An</span>
            <span className="hidden md:inline text-gold/30">•</span>
            <span className="hidden md:inline">Tous droits réservés</span>
          </p>

          <div className="flex items-center space-x-8">
            <a
              href="#"
              className="text-sm font-crimson text-parchment/40 hover:text-gold transition-colors"
            >
              Mentions Légales
            </a>
            <a
              href="#"
              className="text-sm font-crimson text-parchment/40 hover:text-gold transition-colors"
            >
              Confidentialité
            </a>
          </div>
        </div>
      </div>

      {/* Ligne finale */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"></div>
    </footer>
  );
}
