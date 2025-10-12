"use client";

import { useEffect, useRef, useState } from "react";

export default function Features() {
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
      title: "Sécurité Absolue",
      description: "Vos données et médias protégés comme dans un coffre royal.",
    },
    {
      icon: "📜",
      title: "Galeries Privées",
      description:
        "Chaque événement dispose de son propre espace de partage exclusif.",
    },
    {
      icon: "⚡",
      title: "Accès Instantané",
      description:
        "Inscription rapide et accès immédiat à tous vos événements.",
    },
    {
      icon: "♾️",
      title: "Souvenirs Illimités",
      description: "Partagez autant de photos et vidéos que vous le souhaitez.",
    },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-20 md:py-32 bg-parchment-texture relative"
    >
      <div className="section-container">
        {/* Titre */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-ink mb-4">
            Pourquoi nous <span className="text-gold">rejoindre ?</span>
          </h2>
          <p className="text-stone font-crimson">
            Nos atouts pour votre expérience
          </p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card-medieval p-8 group transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 flex items-center justify-center text-4xl bg-gold/10 border-2 border-gold/30 group-hover:bg-gold group-hover:scale-110 transition-all duration-500">
                    {feature.icon}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-cinzel font-semibold text-ink group-hover:text-gold transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-stone font-crimson leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 text-gold/20 text-sm">
                ⚜
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
