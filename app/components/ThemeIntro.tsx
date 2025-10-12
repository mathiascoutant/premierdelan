"use client";

import { useEffect, useRef, useState } from "react";

export default function ThemeIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-parchment-light relative overflow-hidden">
      {/* Ornements décoratifs */}
      <div className="absolute top-10 left-10 text-9xl text-gold/5 pointer-events-none">
        🏰
      </div>
      <div className="absolute bottom-10 right-10 text-9xl text-gold/5 pointer-events-none">
        ⚔
      </div>

      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Encadré principal */}
          <div
            className={`relative bg-gradient-to-br from-parchment to-parchment-dark border-2 border-gold/30 p-8 md:p-12 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Coins ornés */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gold"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gold"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold"></div>

            {/* Contenu */}
            <div className="relative z-10 text-center space-y-6">
              {/* Titre */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <span className="text-3xl text-gold">⚜</span>
                <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-ink">
                  Bienvenue au Moyen-Âge
                </h2>
                <span className="text-3xl text-gold">⚜</span>
              </div>

              {/* Description */}
              <div className="space-y-4 text-stone font-crimson text-lg leading-relaxed max-w-2xl mx-auto">
                <p>
                  Pour célébrer l&apos;<span className="text-gold font-semibold">An de Grâce 2026</span>, 
                  nous vous convions à une <span className="text-ink font-semibold">soirée exceptionnelle</span> dans 
                  le cadre enchanteur de <span className="text-gold font-semibold">Chamouillac</span>.
                </p>
                <p>
                  Le <span className="text-ink font-semibold">31 décembre 2025</span>, voyagez dans le temps 
                  et vivez une célébration digne des plus grands banquets royaux. Costumes d&apos;époque, 
                  décors somptueux et animations médiévales vous attendent.
                </p>
                <p className="text-gold font-semibold italic">
                  « Une nuit pour faire revivre l&apos;histoire et créer des souvenirs immortels »
                </p>
              </div>

              {/* Info pratique */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gold/20">
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-sm font-cinzel tracking-wider text-gold uppercase">Date</p>
                  <p className="text-ink font-crimson">31 Décembre 2025</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🏰</div>
                  <p className="text-sm font-cinzel tracking-wider text-gold uppercase">Lieu</p>
                  <p className="text-ink font-crimson">Chamouillac</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">👑</div>
                  <p className="text-sm font-cinzel tracking-wider text-gold uppercase">Thème</p>
                  <p className="text-ink font-crimson">Médiéval</p>
                </div>
              </div>

              {/* Ornement final */}
              <div className="flex items-center justify-center space-x-3 pt-6">
                <span className="text-gold">⚜</span>
                <span className="text-gold text-xs">◆</span>
                <span className="text-gold">⚜</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

