"use client";

import { useEffect, useRef, useState } from "react";

export default function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Révéler les cartes progressivement
            [0, 1, 2, 3].forEach((index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
              }, index * 150);
            });
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

  const features = [
    {
      icon: "🛡",
      title: "Sécurité Royale",
      description:
        "Vos données et médias protégés avec le plus grand soin dans nos coffres numériques",
    },
    {
      icon: "📜",
      title: "Galeries Exclusives",
      description:
        "Espaces de partage privés et élégants pour chaque événement organisé",
    },
    {
      icon: "⚡",
      title: "Accès Immédiat",
      description:
        "Inscription fluide et accès instantané à l'ensemble de vos célébrations",
    },
    {
      icon: "♾️",
      title: "Souvenirs Éternels",
      description:
        "Partagez sans limites vos moments précieux en photos et vidéos haute qualité",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] via-[#1a1410] to-[#0a0a0a] overflow-hidden"
    >
      {/* Motifs dorés subtils */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-8xl text-[#d4af37]">✦</div>
        <div className="absolute bottom-20 right-10 text-8xl text-[#d4af37]">
          ❖
        </div>
      </div>

      <div className="section-container relative z-10">
        {/* Titre de section */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-3 mb-6">
            <span className="text-[#d4af37] text-xl">⚜</span>
            <span className="text-xs font-cinzel tracking-[0.3em] text-[#d4af37] uppercase font-bold">
              Nos Atouts
            </span>
            <span className="text-[#d4af37] text-xl">⚜</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-[#f5f1e8] mb-4">
            Une Expérience <span className="text-[#d4af37]">d'Exception</span>
          </h2>
          <p className="text-[#f5f1e8]/60 font-crimson text-lg max-w-2xl mx-auto">
            Découvrez les avantages qui font de nos événements des moments
            inoubliables
          </p>
        </div>

        {/* Grille de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br from-[#1a1410]/60 to-[#0a0a0a]/60 backdrop-blur-sm border-2 border-[#d4af37]/20 p-8 md:p-10 hover:border-[#d4af37]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#d4af37]/20 ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Coins dorés */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icône */}
              <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 mb-6 mx-auto bg-gradient-to-br from-[#d4af37]/10 to-[#c9a74f]/5 border border-[#d4af37]/30 group-hover:border-[#d4af37]/60 transition-all duration-500 group-hover:scale-110">
                <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </span>
              </div>

              {/* Contenu */}
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-cinzel font-bold text-[#d4af37] mb-3 group-hover:text-[#f4d03f] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#f5f1e8]/70 font-crimson text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Effet brillant au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
