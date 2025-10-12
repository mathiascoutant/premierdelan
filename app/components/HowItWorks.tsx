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

          {/* Timeline */}
          <div className="relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-700 ${
                    visibleSteps.includes(index)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  {/* Icône */}
                  <div className="relative mx-auto mb-6 w-32 h-32 bg-parchment-light border-2 border-gold/30 hover:border-gold flex items-center justify-center transition-all duration-500 hover:scale-110 group">
                    <span className="text-4xl">{step.icon}</span>

                    {/* Coins */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Texte */}
                  <h3 className="text-lg font-cinzel font-semibold text-ink mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone font-crimson">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
