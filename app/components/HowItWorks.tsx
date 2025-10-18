"use client";

import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Révéler les étapes progressivement
            [0, 1, 2, 3, 4].forEach((index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => [...prev, index]);
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

  const steps = [
    { icon: "🔍", title: "Découvrez", desc: "Explorez l'événement" },
    { icon: "📜", title: "Inscrivez-vous", desc: "Réservez votre place" },
    { icon: "🎭", title: "Vivez", desc: "Participez à la fête" },
    { icon: "📸", title: "Partagez", desc: "Immortalisez l'instant" },
    { icon: "⏳", title: "Revivez", desc: "Consultez vos souvenirs" },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-parchment">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-ink mb-4">
              Comment <span className="text-gold">ça marche ?</span>
            </h2>
            <p className="text-stone font-crimson">En 5 étapes simples</p>
          </div>

          {/* Timeline - 2 par 2 même sur mobile */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center text-center transition-all duration-700 ${
                    visibleSteps.includes(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  {/* Icône centrée */}
                  <div className="relative mb-4 md:mb-6 w-20 h-20 md:w-32 md:h-32 bg-parchment-light border-2 border-gold/30 hover:border-gold flex items-center justify-center transition-all duration-500 hover:scale-110 group">
                    <span className="text-3xl md:text-5xl">{step.icon}</span>

                    {/* Coins décoratifs */}
                    <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 border-t-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-b-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Texte centré */}
                  <h3 className="text-sm md:text-xl font-cinzel font-semibold text-ink mb-1 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-stone font-crimson px-2">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
